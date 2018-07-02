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

// Load our Kubernetes YAML files, substituting the Redis values with our endpoint address.
pk8syaml.apply([
    "./config/frontend-deployment.yaml",
    "./config/frontend-service.yaml",
], { redis: redis.primaryEndpointAddress });
