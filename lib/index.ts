import * as pulumi from "@pulumi/pulumi";
import * as fs from "mz/fs";
import * as fspath from "path";
import * as process from "process";
import * as traverse from "traverse";
import * as yaml from "js-yaml";

// apply simply takes a list of paths to Kubernetes YAML/JSON files, parses each -- in the order specified -- and
// creates a set of Pulumi objects from these resources.  Because the semantics of Kubernetes configuration is that
// resources are created in-order, all resource creation is serialized, one after the other.
export async function apply(paths: string[], replmap?: {[key: string]: Object}): Promise<pulumi.Resource[]> {
    let nodes = [];
    for (let path of paths) {
        const file = await fs.readFile(path, "utf-8");
        if (fspath.extname(path) === ".json") {
            nodes.push(JSON.parse(file));
        } else {
            nodes.push(yaml.safeLoad(file));
        }
    }
    return applyObjects(nodes, replmap);
}

// applyJSONs takes a list of Kubernetes JSON files as in-memory blobs of text, parses each -- in the order specified
// -- and creates a set of Pulumi objects from these resources.  Because the semantics of Kubernetes configuration is
// that resources are created in-order, all resource creation is serialized, one after the other.
export function applyJSONs(files: string[], replmap?: {[key: string]: Object}): pulumi.Resource[] {
    let nodes = [];
    for (let file of files) {
        nodes.push(JSON.parse(file));
    }
    return applyObjects(nodes, replmap);
}

// applyYAMLs takes a list of Kubernetes YAML files as in-memory blobs of text, parses each -- in the order specified
// -- and creates a set of Pulumi objects from these resources.  Because the semantics of Kubernetes configuration is
// that resources are created in-order, all resource creation is serialized, one after the other.
export function applyYAMLs(files: string[], replmap?: {[key: string]: Object}): pulumi.Resource[] {
    let nodes = [];
    for (let file of files) {
        nodes.push(yaml.safeLoad(file));
    }
    return applyObjects(nodes, replmap);
}

// applyObjects takes a list of Kubernetes configuration objects and creates a set of Pulumi objects from these
// resources.  Because the semantics of Kubernetes configuration is that resources are created in-order, all
// resource creation is serialized, one object after the other, meaning there will be no parallelism.
export function applyObjects(nodes: any[], replmap?: {[key: string]: Object}): pulumi.Resource[] {
    let resources: pulumi.Resource[] = [];
    let prior: pulumi.Resource | undefined;
    for (let node of nodes) {
        if (node) {
            // If there's a replacement map, use it to substitute elements of the tree.
            if (replmap) {
                node = traverse(node).map(function (v: any) {
                    if (typeof v === "string") {
                        for (let k of Object.keys(replmap)) {
                            const templ = `{{${k}}}`;
                            const replw = replmap[k];
                            if (v === templ) {
                                this.update(replw);
                                break;
                            }
                            if (v.indexOf(templ) !== -1) {
                                if (typeof replw !== "string") {
                                    throw new Error(
                                        `cannot perform partial replacement w/ non-string '${replw}'`);
                                }
                                this.update(v.replace(`{{${k}}}`, replw));
                            }
                        }
                    }
                });
            }

            // Allocate the Pulumi resource, ensuring it depends on the prior node.
            const res = new (pulumi.CustomResource as any)(
                getType(node), node.metadata.name, node, { dependsOn: prior && [ prior ] });
            prior = res;
            resources.push(res);
        }
    }
    return resources;
}

// getType produces a Pulumi type token given a Kubernetes config node.
function getType(node: any): string {
    if (!node.apiVersion) {
        throw new Error("node is missing expected apiVersion property");
    } else if (!node.kind) {
        throw new Error("node is missing expected kind property");
    }
    const mod = node.apiVersion.indexOf('/') === -1 ? `core/${node.apiVersion}` : node.apiVersion;
    return `kubernetes:${mod}:${node.kind}`;
}
