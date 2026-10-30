#!/usr/bin/env bash
set -e

echo "=========================================================="
echo "🚀 NASCON Event Management Platform - Minikube Deployment"
echo "=========================================================="

# 1. Verify Minikube
echo -e "\n[1/6] Checking Minikube status..."
if ! minikube status > /dev/null 2>&1; then
    echo "Starting Minikube with Docker driver..."
    minikube start --driver=docker
else
    echo "Minikube is running."
fi

# 2. Point Docker to Minikube
echo -e "\n[2/6] Pointing Docker CLI to Minikube's Docker daemon..."
eval $(minikube docker-env)

# 3. Build Docker images inside Minikube
echo -e "\n[3/6] Building Docker images..."
docker build -t nascon-backend:latest ./backend
docker build -t nascon-frontend:latest ./frontend

# 4. Apply Kubernetes manifests
echo -e "\n[4/6] Applying Kubernetes manifests..."
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/postgres-secret.yaml
kubectl apply -f k8s/postgres-init-configmap.yaml
kubectl apply -f k8s/postgres-deployment.yaml
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/frontend-deployment.yaml

# 5. Apply Monitoring
echo -e "\n[5/6] Deploying Monitoring Stack..."
kubectl apply -f k8s/monitoring/prometheus-configmap.yaml
kubectl apply -f k8s/monitoring/prometheus-deployment.yaml
kubectl apply -f k8s/monitoring/grafana-deployment.yaml

# 6. Wait for Rollouts
echo -e "\n[6/6] Verifying rollouts..."
kubectl rollout status deployment/nascon-postgres -n nascon --timeout=90s
kubectl rollout status deployment/nascon-backend -n nascon --timeout=90s
kubectl rollout status deployment/nascon-frontend -n nascon --timeout=90s
kubectl rollout status deployment/prometheus-deployment -n nascon --timeout=90s
kubectl rollout status deployment/grafana-deployment -n nascon --timeout=90s

MINIKUBE_IP=$(minikube ip)
echo "=========================================================="
echo "🎉 DEPLOYMENT COMPLETE!"
echo "🌐 NASCON Website: http://${MINIKUBE_IP}:30080"
echo "📊 Grafana:        http://${MINIKUBE_IP}:30030 (admin/admin)"
echo "📈 Prometheus:     http://${MINIKUBE_IP}:30090"
echo "=========================================================="
