'use strict';
let pk8syaml = require("pk8syaml");
pk8syaml.apply([
    "./config/redis-master-deployment.yaml",
    "./config/redis-master-service.yaml",
    "./config/redis-slave-deployment.yaml",
    "./config/redis-slave-service.yaml",
    "./config/frontend-deployment.yaml",
    "./config/frontend-service.yaml"
]);
