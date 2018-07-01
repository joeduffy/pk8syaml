import * as pulumi from "@pulumi/pulumi";
import * as fs from "mz/fs";
import * as process from "process";
import * as yaml from "js-yaml";

// apply simply takes a list of paths to Kubernetes YAML files, parses each -- in the order specified -- and
// creates a set of Pulumi objects from these resources.  Because the semantics of these files is that resources are
// created in-order, all resource creation is serialized, one after the other.
export async function apply(...paths: string[]): Promise<void> {
    let prior: pulumi.Resource | undefined;
    for (let path of paths) {
        console.log(`applying ${path}...`);
        const file = await fs.readFile(path, "utf-8");
        const node: any = yaml.safeLoad(file);
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
