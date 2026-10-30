#!/usr/bin/env bash
# ==============================================================================
# 🌐 Expose Minikube Services to EC2 Public IP via kubectl port-forward
# This allows you to access Frontend, Prometheus, and Grafana from your laptop browser.
# ==============================================================================

echo "Killing any existing port-forward processes..."
pkill -f "kubectl port-forward" 2>/dev/null || true

echo "Starting port-forwarding to EC2 host interface (0.0.0.0)..."

# 1. Forward NASCON Frontend (Port 30080 -> Service Port 80)
nohup kubectl port-forward --address 0.0.0.0 service/nascon-frontend-service 30080:80 -n nascon > /dev/null 2>&1 &

# 2. Forward Prometheus (Port 30090 -> Service Port 9090)
nohup kubectl port-forward --address 0.0.0.0 service/prometheus-service 30090:9090 -n nascon > /dev/null 2>&1 &

# 3. Forward Grafana (Port 30030 -> Service Port 3000)
nohup kubectl port-forward --address 0.0.0.0 service/grafana-service 30030:3000 -n nascon > /dev/null 2>&1 &

sleep 2

# Retrieve EC2 Public IP using IMDSv2 / external check
EC2_PUBLIC_IP=$(curl -s http://checkip.amazonaws.com || curl -s ifconfig.me || echo "<YOUR-EC2-PUBLIC-IP>")

echo "=========================================================="
echo "🎉 SERVICES ARE NOW EXPOSED GLOBALLY ON YOUR EC2 INSTANCE:"
echo "=========================================================="
echo "🌐 NASCON Frontend Website: http://${EC2_PUBLIC_IP}:30080"
echo "📊 Grafana Dashboard:      http://${EC2_PUBLIC_IP}:30030 (User: admin / Pass: admin)"
echo "📈 Prometheus Server:      http://${EC2_PUBLIC_IP}:30090"
echo "🛠️ Jenkins Dashboard:      http://${EC2_PUBLIC_IP}:8085"
echo "=========================================================="
echo "Ensure your AWS EC2 Security Group allows inbound traffic on these ports!"
