# 🛠️ Jenkins CI/CD Setup & Execution Guide for NASCON

This guide provides step-by-step instructions for **Task 1**, **Task 2**, **Task 3**, and **Task 4**.

---

## 📋 Table of Contents
1. [Task 1: Jenkins Installation & Configuration](#task-1-jenkins-installation--configuration)
2. [Task 2: Creating the CI/CD Pipeline in Jenkins](#task-2-creating-the-cicd-pipeline-in-jenkins)
3. [Task 3: Minikube Kubernetes Deployment](#task-3-minikube-kubernetes-deployment)
4. [Task 4: Monitoring Software on the Pipeline (Prometheus + Grafana)](#task-4-monitoring-software-on-the-pipeline-prometheus--grafana)

---

## Task 1: Jenkins Installation & Configuration

We provide a tailored Docker Compose configuration in `jenkins/docker-compose.jenkins.yml` that mounts the host's Docker socket and `kubectl` configuration so Jenkins can build images and interact with Minikube.

### Option A: Running Jenkins via Docker (Recommended for Lab)

1. **Start the Jenkins Container**:
   Open PowerShell or Terminal in the project root:
   ```powershell
   cd jenkins
   docker compose -f docker-compose.jenkins.yml up -d --build
   ```

2. **Retrieve the Initial Admin Password**:
   ```powershell
   docker exec -it jenkins-server cat /var/jenkins_home/secrets/initialAdminPassword
   ```
   Copy the 32-character hexadecimal password printed in the terminal.

3. **Access the Jenkins Web UI**:
   - Open your browser at: [http://localhost:8085](http://localhost:8085)
   - Paste the initial admin password.
   - Choose **"Install suggested plugins"**.
   - Create your Admin User account (e.g., username `admin`, password `admin123`).

4. **Install Required Plugins for the Pipeline**:
   - In Jenkins Dashboard, navigate to: **Manage Jenkins** ➔ **Plugins** ➔ **Available plugins**.
   - Search and select:
     - `Docker Pipeline`
     - `Kubernetes CLI`
     - `Prometheus metrics` *(Required for Task 4 monitoring)*
   - Click **Install without restart**.

---

## Task 2: Creating the CI/CD Pipeline in Jenkins

1. **Create a New Item**:
   - Click **New Item** on the Jenkins Dashboard.
   - Enter name: `nascon-pipeline`
   - Select **Pipeline** project type.
   - Click **OK**.

2. **Configure Pipeline Definition**:
   - In the job configuration page, scroll down to the **Pipeline** section.
   - Set **Definition** to: `Pipeline script from SCM` (or select `Pipeline script` to paste the contents of `Jenkinsfile` directly).
   - If using `Pipeline script from SCM`:
     - SCM: `Git`
     - Repository URL: Path or URL to your Git repository (e.g., `file:///var/jenkins_home/workspace/Eventsite` or your GitHub/GitLab repository URL).
     - Script Path: `Jenkinsfile`
   - If using `Pipeline script`:
     - Open the project `Jenkinsfile` and copy-paste its entire contents into the script box.

3. **Trigger the Pipeline**:
   - Click **Save**.
   - Click **Build Now** in the left sidebar.
   - Watch the Pipeline Stage View execute:
     - `1. Code Checkout`
     - `2. Backend Tests & Verification`
     - `3. Build Docker Images`
     - `4. Security Scan & Image Verification`
     - `5. Deploy to Kubernetes (Minikube)`
     - `6. Deploy Monitoring Stack (Prometheus & Grafana)`
     - `7. Automated Smoke & Integration Test`

---

## Task 3: Minikube Kubernetes Deployment

To execute or test the Kubernetes deployment directly on Minikube:

### Prerequisites:
- Minikube installed (`winget install Kubernetes.minikube` or `choco install minikube`).
- Docker Desktop or Hyper-V running.

### 1-Click Deployment Script:
Run the PowerShell script:
```powershell
.\deploy-minikube.ps1
```
*(Or `./deploy-minikube.sh` on Linux/macOS/Git Bash)*

### Manual Step-by-Step Commands:
1. Start Minikube:
   ```bash
   minikube start --driver=docker
   ```

2. Point Docker CLI to Minikube's Docker daemon:
   ```bash
   # On Windows PowerShell:
   & minikube -p minikube docker-env --shell powershell | Invoke-Expression

   # On Linux/macOS:
   eval $(minikube docker-env)
   ```

3. Build images into Minikube's Docker daemon:
   ```bash
   docker build -t nascon-backend:latest ./backend
   docker build -t nascon-frontend:latest ./frontend
   ```

4. Apply the Kubernetes manifests:
   ```bash
   kubectl apply -f k8s/namespace.yaml
   kubectl apply -f k8s/postgres-secret.yaml
   kubectl apply -f k8s/postgres-init-configmap.yaml
   kubectl apply -f k8s/postgres-deployment.yaml
   kubectl apply -f k8s/backend-deployment.yaml
   kubectl apply -f k8s/frontend-deployment.yaml
   ```

5. Access the Frontend Application:
   ```bash
   minikube service nascon-frontend-service -n nascon
   ```
   Or access directly at: `http://<minikube-ip>:30080`

---

## Task 4: Monitoring Software on the Pipeline (Prometheus + Grafana)

Task 4 requires monitoring the pipeline and application deployments.

### 1. Enable Jenkins Prometheus Metrics Exporter:
1. In Jenkins: **Manage Jenkins** ➔ **System** (or **Configure System**).
2. Scroll to the **Prometheus** section.
3. Keep default settings:
   - Path: `/prometheus`
   - Use default JVM and build metrics collection.
4. Verify by opening in browser: `http://localhost:8085/prometheus` (you will see Prometheus metric exposition text).

### 2. Deploy Prometheus & Grafana in Minikube:
```bash
kubectl apply -f k8s/monitoring/prometheus-configmap.yaml
kubectl apply -f k8s/monitoring/prometheus-deployment.yaml
kubectl apply -f k8s/monitoring/grafana-deployment.yaml
```

### 3. Access Prometheus:
```bash
minikube service prometheus-service -n nascon
```
Or open: `http://<minikube-ip>:30090`
- Query custom metrics:
  - `nascon_http_requests_total`
  - `nascon_registrations_total`
  - `default_jenkins_builds_duration_milliseconds_summary`
  - `jenkins_executor_count_value`

### 4. Access Grafana Dashboard:
```bash
minikube service grafana-service -n nascon
```
Or open: `http://<minikube-ip>:30030`
- **Default Login**:
  - Username: `admin`
  - Password: `admin`
- Prometheus is **pre-configured as the default data source** via `k8s/monitoring/grafana-deployment.yaml`.
- You can create a new dashboard or visualize:
  - CI/CD build run times & success rates.
  - NASCON backend API request throughput.
  - PostgreSQL container resource consumption.

