#!/usr/bin/env bash
# ==============================================================================
# 🚀 NASCON '26 - Complete AWS EC2 (Ubuntu) Setup Script
# Installs: Docker, Docker Compose, Kubectl, Minikube, Git, Node.js
# ==============================================================================
set -e

echo "=========================================================="
echo "⚡ Step 1: Updating System & Installing Prerequisites..."
echo "=========================================================="
sudo apt-get update -y
sudo apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    apt-transport-https \
    git \
    conntrack \
    socat

echo "=========================================================="
echo "🐳 Step 2: Installing Docker Engine..."
echo "=========================================================="
# Add Docker official GPG key
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg --yes
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Add Docker repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update -y
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Enable and start Docker service
sudo systemctl enable docker
sudo systemctl start docker

# Add current user (ubuntu) to docker group
sudo usermod -aG docker $USER

echo "=========================================================="
echo "☸️ Step 3: Installing Kubectl..."
echo "=========================================================="
KUBECTL_VERSION=$(curl -L -s https://dl.k8s.io/release/stable.txt)
curl -LO "https://dl.k8s.io/release/${KUBECTL_VERSION}/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
rm kubectl

echo "=========================================================="
echo "📦 Step 4: Installing Minikube..."
echo "=========================================================="
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube
rm minikube-linux-amd64

echo "=========================================================="
echo "🟢 Step 5: Installing Node.js & npm..."
echo "=========================================================="
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

echo "=========================================================="
echo "✅ Verification of Installed DevOps Tools:"
echo "=========================================================="
docker --version || true
docker compose version || true
kubectl version --client || true
minikube version || true
node -v || true
npm -v || true

echo "=========================================================="
echo "🎉 EC2 PREPARATION COMPLETE!"
echo "⚠️ IMPORTANT: Please refresh your terminal group permissions by running:"
echo "     newgrp docker"
echo "Or disconnect and reconnect your SSH session."
echo "=========================================================="

