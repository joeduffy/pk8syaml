'use strict';

const pulumi = require("@pulumi/pulumi");
const traverse = require("traverse");

// Returns a function that may be used to replace values in an object graph with an output.
module.exports = function(search, replace) {
    return function (obj) {
        return traverse(obj).forEach(function (x) {
            if (x === search) {
                this.update(pulumi.runtime.isDryRun() ? "unknown" : replace);
            }
        });
    };
}
