# NASCON 2026 - Minikube Deployment Helper (PowerShell)
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "🚀 NASCON Event Management Platform - Minikube Deployment" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Check if Minikube is running
Write-Host "`n[1/6] Checking Minikube status..." -ForegroundColor Yellow
$minikubeStatus = minikube status --format='{{.Host}}' 2>$null
if ($minikubeStatus -ne "Running") {
    Write-Host "Minikube is not running. Starting Minikube cluster..." -ForegroundColor Yellow
    minikube start --driver=docker
} else {
    Write-Host "Minikube is running!" -ForegroundColor Green
}

# 2. Configure shell to use Minikube Docker daemon
Write-Host "`n[2/6] Pointing Docker CLI to Minikube's internal Docker daemon..." -ForegroundColor Yellow
& minikube -p minikube docker-env --shell powershell | Invoke-Expression

# 3. Build Docker images inside Minikube
Write-Host "`n[3/6] Building Backend & Frontend Docker images inside Minikube..." -ForegroundColor Yellow
Write-Host "Building nascon-backend:latest..." -ForegroundColor Gray
docker build -t nascon-backend:latest ./backend

Write-Host "Building nascon-frontend:latest..." -ForegroundColor Gray
docker build -t nascon-frontend:latest ./frontend

# 4. Deploy 3-Tier Application Manifests
Write-Host "`n[4/6] Deploying 3-Tier Application to Kubernetes..." -ForegroundColor Yellow
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/postgres-secret.yaml
kubectl apply -f k8s/postgres-init-configmap.yaml
kubectl apply -f k8s/postgres-deployment.yaml
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/frontend-deployment.yaml

# 5. Deploy Monitoring Stack
Write-Host "`n[5/6] Deploying Monitoring Stack (Prometheus & Grafana)..." -ForegroundColor Yellow
kubectl apply -f k8s/monitoring/prometheus-configmap.yaml
kubectl apply -f k8s/monitoring/prometheus-deployment.yaml
kubectl apply -f k8s/monitoring/grafana-deployment.yaml

# 6. Verify and output service URLs
Write-Host "`n[6/6] Waiting for pods to reach 'Running' status..." -ForegroundColor Yellow
kubectl rollout status deployment/nascon-postgres -n nascon --timeout=60s
kubectl rollout status deployment/nascon-backend -n nascon --timeout=60s
kubectl rollout status deployment/nascon-frontend -n nascon --timeout=60s
kubectl rollout status deployment/prometheus-deployment -n nascon --timeout=60s
kubectl rollout status deployment/grafana-deployment -n nascon --timeout=60s

$minikubeIP = minikube ip

Write-Host "`n==========================================================" -ForegroundColor Green
Write-Host "🎉 DEPLOYMENT COMPLETE! ACCESS YOUR SERVICES:" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "🌐 NASCON Event Website (Frontend): http://$($minikubeIP):30080" -ForegroundColor Cyan
Write-Host "📊 Grafana Monitoring Dashboard:   http://$($minikubeIP):30030 (User: admin / Pass: admin)" -ForegroundColor Cyan
Write-Host "📈 Prometheus Server:               http://$($minikubeIP):30090" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "Tip: On Windows Docker Desktop driver, run in a separate terminal:" -ForegroundColor Yellow
Write-Host "     minikube service nascon-frontend-service -n nascon" -ForegroundColor Yellow
