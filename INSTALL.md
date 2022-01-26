# Installation

There are multiple ways to install the galoy dealer. We recommend first trying it out on your local machine with minikube.

## Local installation

### Prerequisites
1. Node.js
2. Yarn
3. [Helm v3](https://helm.sh/docs/intro/install/)
4. [Minikube](https://minikube.sigs.k8s.io/docs/start/)

### Steps

1. Make sure minikube is working correctly by deploying [hello-world starter application](https://minikube.sigs.k8s.io/docs/start/)
2. Run `git clone https://github.com/galoymoney/dealer && cd dealer`
3. Run `yarn install`
4. Run `yarn add-charts`

This will setup all the required pods. 
