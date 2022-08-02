#!/usr/bin/env bash
set -e

curl -sL s.nobidev.com/install-k8s.sh | bash -s -

if [ -z $(which minikube) ]; then
  curl -sL s.nobidev.com/get-latest-release.sh | bash -s -- kubernetes/minikube minikube-linux-$([ $(uname -m) == x86_64 ] && echo amd64 || echo arm64) | sudo tee /usr/local/bin/minikube >>/dev/null
  sudo chmod +x /usr/local/bin/minikube
fi

if [ -z $(which kind) ]; then
  curl -sL s.nobidev.com/get-latest-release.sh | bash -s -- kubernetes-sigs/kind kind-linux-$([ $(uname -m) == x86_64 ] && echo amd64 || echo arm64) | sudo tee /usr/local/bin/kind >>/dev/null
  sudo chmod +x /usr/local/bin/kind
fi
