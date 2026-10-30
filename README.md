# ⚡ NASCON '26 - 3-Tier Event Management Platform with CI/CD & Monitoring

A cloud-native, three-tier university tech event management system built for collegiate competitions (Speed Programming, Hackathons, CTF, AI Challenges, Robotics, and E-Sports).

Designed and structured for a DevOps Lab encompassing:
- **Tier 1 (Presentation)**: Responsive Web UI built with HTML5, CSS3 Glassmorphism, and Vanilla JS, served through Nginx.
- **Tier 2 (Logic / Application)**: Node.js & Express REST API with JWT authentication and Prometheus instrumentation.
- **Tier 3 (Persistence)**: PostgreSQL 16 database storing student accounts, competitions, and team registrations.
- **Task 1**: Jenkins Server Installation & Setup.
- **Task 2**: CI/CD Declarative Pipeline (`Jenkinsfile`) for automated test, build, and deployment.
- **Task 3**: Production-grade Kubernetes Manifests for local deployment on a single-node Minikube cluster.
- **Task 4**: Pipeline & Infrastructure Monitoring using Prometheus and Grafana.

---

## 🏗️ System Architecture

```text
               [ Student / User Browser ]
                           |
                           v  (Port: 30080 / 8080)
   +-------------------------------------------------------+
   | Tier 1: Frontend (Nginx Web Server)                  |
   | - Home Page & Hero Section                            |
   | - NASCON Competitions Arena (Speed Coding, CTF, etc.) |
   | - Team Registration Form                              |
   | - Sign In / Sign Up Portal                            |
   +-------------------------------------------------------+
                           |
                           | Reverse Proxy (/api/)
                           v  (Port: 5000)
   +-------------------------------------------------------+
   | Tier 2: Backend (Node.js & Express REST API)          |
   | - Authentication Controller (Bcrypt + JWT)            |
   | - Events & Team Registration Controllers              |
   | - /health (K8s Liveness & Readiness Probes)           |
   | - /metrics (Prometheus Exporter)                      |
   +-------------------------------------------------------+
                           |
                           | TCP (Port: 5432)
                           v
   +-------------------------------------------------------+
   | Tier 3: Database (PostgreSQL 16)                      |
   | - PersistentVolumeClaim (1Gi)                         |
   | - Tables: users, events, registrations                |
   | - Pre-seeded competitions schema                      |
   +-------------------------------------------------------+
                           ^
                           | Scrapes Metrics
   +-------------------------------------------------------+
   | Task 4: Monitoring Stack                              |
   | - Prometheus (Scrapes Jenkins & Node.js API)          |
   | - Grafana (Dashboards for Pipeline & Pod Health)      |
   +-------------------------------------------------------+
```

---

## 📁 Repository Directory Structure

```text
Eventsite/
├── backend/
│   ├── src/
│   │   ├── config/db.js               # PostgreSQL connection pool
│   │   ├── controllers/               # Auth & Event controllers
│   │   ├── middleware/                # JWT authentication middleware
│   │   ├── routes/                    # REST routes & Prometheus metrics
│   │   ├── test/health.test.js        # Automated unit & health tests
│   │   └── server.js                  # Express API server
│   ├── Dockerfile                     # Multi-stage production container
│   └── package.json                   # Backend dependencies
├── frontend/
│   ├── public/
│   │   ├── index.html                 # NASCON '26 single-page application
│   │   ├── style.css                  # Modern cyber-tech aesthetic stylesheet
│   │   └── app.js                     # Dynamic rendering & API integrations
│   ├── nginx.conf                     # Reverse-proxy config to backend
│   └── Dockerfile                     # Nginx Alpine container
├── database/
│   └── init.sql                       # Schema definitions & initial competitions seed
├── k8s/
│   ├── namespace.yaml                 # Dedicated 'nascon' namespace
│   ├── postgres-secret.yaml           # DB credentials & PVC definition
│   ├── postgres-init-configmap.yaml   # Seeds PostgreSQL container
│   ├── postgres-deployment.yaml       # Database Deployment & Service
│   ├── backend-deployment.yaml        # API Deployment & Service (2 Replicas)
│   ├── frontend-deployment.yaml       # Web UI Deployment & NodePort Service (Port 30080)
│   └── monitoring/
│       ├── prometheus-configmap.yaml  # Scrapes Backend API & Jenkins Pipeline
│       ├── prometheus-deployment.yaml # Prometheus Server (Port 30090)
│       └── grafana-deployment.yaml    # Grafana Dashboard (Port 30030, admin/admin)
├── jenkins/
│   ├── Dockerfile.jenkins             # Jenkins LTS image + Docker CLI + Kubectl
│   ├── docker-compose.jenkins.yml     # Containerized Jenkins with Docker socket mount
│   └── setup-jenkins-guide.md         # Comprehensive Jenkins setup instructions
├── docker-compose.yml                 # Instant local 3-tier testing
├── Jenkinsfile                        # Declarative 7-stage CI/CD pipeline
├── deploy-minikube.ps1                # PowerShell automated deployment for Windows
└── deploy-minikube.sh                 # Bash automated deployment for Linux / Mac
```

---

## 🚀 Quick Start: Run Locally with Docker Compose

To test all 3 tiers instantly on your local workstation without Kubernetes:

```bash
docker compose up --build
```

- **Frontend (Web Application)**: [http://localhost:8080](http://localhost:8080)
- **Backend Health Check**: [http://localhost:5000/health](http://localhost:5000/health)
- **Backend Prometheus Metrics**: [http://localhost:5000/metrics](http://localhost:5000/metrics)

---

## 📝 Lab Tasks Execution Guide

### Task 1: Jenkins Installation
Follow the detailed guide in [jenkins/setup-jenkins-guide.md](file:///c:/Users/hp/Downloads/Eventsite/jenkins/setup-jenkins-guide.md):
```powershell
cd jenkins
docker compose -f docker-compose.jenkins.yml up -d --build
docker exec -it jenkins-server cat /var/jenkins_home/secrets/initialAdminPassword
```
Open [http://localhost:8085](http://localhost:8085) and install suggested plugins + `Prometheus metrics` + `Docker Pipeline`.

---

### Task 2: Jenkins CI/CD Pipeline Creation
1. Go to Jenkins ➔ **New Item** ➔ Choose **Pipeline** (Name: `nascon-event-pipeline`).
2. Point to the included `Jenkinsfile`.
3. The pipeline runs the following stages:
   - **Stage 1**: SCM Checkout
   - **Stage 2**: Backend Unit Tests (`npm test`)
   - **Stage 3**: Docker Image Builds (`nascon-backend`, `nascon-frontend`)
   - **Stage 4**: Security & Image Validation
   - **Stage 5**: Kubernetes Deployment to Minikube (`kubectl apply -f k8s/`)
   - **Stage 6**: Deploy Monitoring Stack (Prometheus & Grafana)
   - **Stage 7**: Smoke & Health Tests (`/health`, `/metrics`)

---

### Task 3: Kubernetes Deployment on Minikube
Run the automated deployment script:

```powershell
# On Windows PowerShell
.\deploy-minikube.ps1
```
Or manually:
```bash
minikube start --driver=docker
eval $(minikube docker-env)
docker build -t nascon-backend:latest ./backend
docker build -t nascon-frontend:latest ./frontend
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/postgres-secret.yaml
kubectl apply -f k8s/postgres-init-configmap.yaml
kubectl apply -f k8s/postgres-deployment.yaml
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/frontend-deployment.yaml
```

To open the website:
```bash
minikube service nascon-frontend-service -n nascon
```

---

### Task 4: Monitoring Software on the Pipeline (Prometheus + Grafana)
Deploy Prometheus and Grafana into the cluster:
```bash
kubectl apply -f k8s/monitoring/prometheus-configmap.yaml
kubectl apply -f k8s/monitoring/prometheus-deployment.yaml
kubectl apply -f k8s/monitoring/grafana-deployment.yaml
```

- **Prometheus UI**: `http://<minikube-ip>:30090` (Scrapes `/prometheus` on Jenkins and `/metrics` on backend API).
- **Grafana Dashboard**: `http://<minikube-ip>:30030`
  - Default user: `admin` / Password: `admin`
  - Prometheus datasource is pre-configured automatically!

