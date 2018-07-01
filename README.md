# Pulumi Kubernetes YAML Bridge (pk8syaml)

<img src="./images/bridge.jpg" align="right" width=350 />

This bridge lets you deploy standard [Kubernetes YAML](https://kubernetes.io/docs/concepts/configuration/) files
using [Pulumi](https://pulumi.io).  This enables a few interesting scenarios

* Incremental adoption of Pulumi for Kubernetes deployments
* Robust GitOps-based CI/CD, using immutable infrastructure, for Kubernetes
* Ability to mix AWS, Azure, Google Cloud configuration alongside Kubernetes configuration

For a basic example of pk8syaml in action, see [the Standard Kubernetes Guestbook](./examples/guestbook).

To see an interesting mix of Kubernetes and cloud resources, including AWS, Azure, and Google Cloud, see
[this same Guestbook using hosted AWS ElastiCache](./examples/guestbook-aws-elasticache).  These are versioned
and deployed homogeneously.  Of course, it gets more interesting when you
[port the YAML configuration to real code](https://github.com/pulumi/examples/tree/master/kubernetes-ts-guestbook),
eliminating the need to do string substitution, and unlocking the full power of programming languages.

<img src="./examples/guestbook-aws-elasticache/images/up.png" width=600 />

pk8syaml is published to NPM, and may be installed simply as

```
$ npm install pk8syaml
```

It is meant to be used with [Pulumi](https://pulumi.io), so be sure to [install it](https://pulumi.io/install) first.

It's also worth noting that this library is just a few dozen lines of JavaScript built atop the Pulumi platform.
