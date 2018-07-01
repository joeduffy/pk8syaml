# Pulumi Kubernetes YAML Bridge (pk8syaml)

This bridge lets you deploy standard [Kubernetes YAML](https://kubernetes.io/docs/concepts/configuration/) files
using [Pulumi](https://pulumi.io).  This enables a few interesting scenarios

* Incremental adoption of Pulumi for Kubernetes deployments
* Robust GitOps-based CI/CD, using immutable infrastructure, for Kubernetes
* Ability to mix AWS, Azure, Google Cloud configuration alongside Kubernetes configuration

It's also worth noting that this library is just a few dozen lines of JavaScript built atop the Pulumi platform.
