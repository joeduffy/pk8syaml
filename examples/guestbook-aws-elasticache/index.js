'use strict';

const aws = require("@pulumi/aws");
const fs = require("mz/fs");
const pk8syaml = require("pk8syaml");
const yaml = require("js-yaml");

// Provision our ElastiCache cluster with a single read replica:
const redis = new aws.elasticache.ReplicationGroup("redis", {
    replicationGroupId: "guestbook-redis",
    replicationGroupDescription: "Guestbook Redis",
    automaticFailoverEnabled: true,
    engine: "redis",
    nodeType: "cache.m3.medium",
    parameterGroupName: "default.redis4.0",
    port: 6379,
    numberCacheClusters: 2,
});

// Load our Kubernetes YAML files into their in-memory object equivalents, and patch them.
const cfgrepl = require("./cfgrepl");
const replaceRedisAddress = cfgrepl("{{redis}}", redis.primaryEndpointAddress);
const configs = [
    fs.readFile("./config/frontend-deployment.yaml").then(file => yaml.safeLoad(file)).then(replaceRedisAddress),
    fs.readFile("./config/frontend-service.yaml").then(file => yaml.safeLoad(file)).then(replaceRedisAddress),
];

// Finally, when the files are loaded, and patched, we can apply the configuration safely.
Promise.all(configs).then(finals => {
    pk8syaml.applyObjects(...finals);
});
