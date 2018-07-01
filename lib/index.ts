import * as pulumi from "@pulumi/pulumi";
import * as fs from "mz/fs";
import * as fspath from "path";
import * as process from "process";
import * as yaml from "js-yaml";

// apply simply takes a list of paths to Kubernetes YAML/JSON files, parses each -- in the order specified -- and
// creates a set of Pulumi objects from these resources.  Because the semantics of Kubernetes configuration is that
// resources are created in-order, all resource creation is serialized, one after the other.
export async function apply(...paths: string[]): Promise<void> {
    let nodes = [];
    for (let path of paths) {
        const file = await fs.readFile(path, "utf-8");
        if (fspath.extname(path) === ".json") {
            nodes.push(JSON.parse(file));
        } else {
            nodes.push(yaml.safeLoad(file));
        }
    }
    applyObjects(nodes);
}

// applyJSONs takes a list of Kubernetes JSON files as in-memory blobs of text, parses each -- in the order specified
// -- and creates a set of Pulumi objects from these resources.  Because the semantics of Kubernetes configuration is
// that resources are created in-order, all resource creation is serialized, one after the other.
export function applyJSONs(...files: string[]): void {
    let nodes = [];
    for (let file of files) {
        nodes.push(JSON.parse(file));
    }
    applyObjects(nodes);
}

// applyYAMLs takes a list of Kubernetes YAML files as in-memory blobs of text, parses each -- in the order specified
// -- and creates a set of Pulumi objects from these resources.  Because the semantics of Kubernetes configuration is
// that resources are created in-order, all resource creation is serialized, one after the other.
export function applyYAMLs(...files: string[]): void {
    let nodes = [];
    for (let file of files) {
        nodes.push(yaml.safeLoad(file));
    }
    applyObjects(nodes);
}

// applyObjects takes a list of Kubernetes configuration objects and creates a set of Pulumi objects from these
// resources.  Because the semantics of Kubernetes configuration is that resources are created in-order, all
// resource creation is serialized, one object after the other, meaning there will be no parallelism.
export function applyObjects(...nodes: any[]): void {
    let prior: pulumi.Resource | undefined;
    for (let node of nodes) {
        if (node) {
            prior = new (pulumi.CustomResource as any)(
                getType(node), node.metadata.name, node, { dependsOn: prior && [ prior ] });
        }
    }
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
