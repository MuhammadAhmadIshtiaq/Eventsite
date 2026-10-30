# ☁️ Comprehensive Guide: Running NASCON 3-Tier Platform on AWS EC2

This guide takes you step-by-step from launching an AWS EC2 instance to running Jenkins, Minikube, the 3-Tier website, and the monitoring stack.

---

## 📋 Phase 1: Launching the AWS EC2 Instance

### 1. Instance Specifications (Important!)
Because you are running **Minikube (Kubernetes)**, **Jenkins (Java JVM)**, **Docker Engine**, **PostgreSQL**, **Node.js**, **Prometheus**, and **Grafana** together on one virtual machine, standard free-tier `t2.micro` will run out of RAM and freeze.

* **AMI (OS)**: Ubuntu Server 22.04 LTS (HVM) or 24.04 LTS (64-bit x86)
* **Instance Type**: 
  * Recommended: **`t3.large`** (2 vCPU, 8 GB RAM) or **`t3.xlarge`** (4 vCPU, 16 GB RAM)
  * Minimum: `t2.large` (2 vCPU, 8 GB RAM)
* **Storage (EBS)**: **35 GB or 40 GB gp3** (Docker images for Jenkins, K8s, and DB need ~15-20 GB)
* **Key Pair**: Select or create a `.pem` key pair (e.g. `nascon-key.pem`).

---

### 2. Configure Inbound Security Group Rules
In the **Network settings / Security Group** section of EC2, add the following Inbound Rules:

| Type | Port Range | Source | Purpose |
| :--- | :--- | :--- | :--- |
| **SSH** | `22` | `My IP` (or `0.0.0.0/0`) | Remote terminal access via SSH |
| **Custom TCP** | `8085` | `0.0.0.0/0` | Jenkins Web Dashboard |
| **Custom TCP** | `30080` | `0.0.0.0/0` | NASCON 3-Tier Event Website (Frontend) |
| **Custom TCP** | `30090` | `0.0.0.0/0` | Prometheus Monitoring Server |
| **Custom TCP** | `30030` | `0.0.0.0/0` | Grafana Monitoring Dashboard |
| **Custom TCP** | `8080` | `0.0.0.0/0` | Optional Docker Compose testing |

Click **Launch Instance**.

---

## 💻 Phase 2: Connecting and Transferring the Code

### 1. Connect to your EC2 Instance via SSH
Open PowerShell or Git Bash on your computer:
```powershell
ssh -i "path\to\nascon-key.pem" ubuntu@<YOUR-EC2-PUBLIC-IP>
```

### 2. Transfer the Project to EC2
You have two simple options:

#### Option A: Clone via GitHub (Recommended)
1. Push your local `Eventsite` repository to your GitHub account:
   ```powershell
   git remote add origin https://github.com/<YOUR-USERNAME>/<YOUR-REPO-NAME>.git
   git branch -M main
   git push -u origin main
   ```
2. On your EC2 SSH terminal, clone it:
   ```bash
   git clone https://github.com/<YOUR-USERNAME>/<YOUR-REPO-NAME>.git Eventsite
   cd Eventsite
   ```

#### Option B: Upload Directly via SCP (From your Windows Laptop)
From your local Windows PowerShell:
```powershell
scp -i "path\to\nascon-key.pem" -r c:\Users\hp\Downloads\Eventsite ubuntu@<YOUR-EC2-PUBLIC-IP>:~/Eventsite
```
Then on EC2:
```bash
cd ~/Eventsite
```

---

## ⚙️ Phase 3: One-Click Environment Setup on EC2

Run the included automated setup script to install **Docker**, **Kubectl**, **Minikube**, and **Node.js**:

```bash
chmod +x ec2-setup.sh deploy-minikube.sh expose-services-ec2.sh
./ec2-setup.sh
```

Once the script finishes, activate the Docker group permissions:
```bash
newgrp docker
```
*(Verify by running `docker ps` — it should succeed without `sudo`).*

---

## 🚀 Phase 4: Executing the 4 Tasks on EC2

### Task 1: Start Jenkins Server
1. Launch Jenkins container:
   ```bash
   cd ~/Eventsite/jenkins
   docker compose -f docker-compose.jenkins.yml up -d --build
   ```
2. Retrieve the Admin Password:
   ```bash
   docker exec -it jenkins-server cat /var/jenkins_home/secrets/initialAdminPassword
   ```
3. Open your browser on your laptop and visit:
   `http://<YOUR-EC2-PUBLIC-IP>:8085`
4. Paste the password, select **Install suggested plugins**, and create your admin account.
5. In Jenkins: **Manage Jenkins** ➔ **Plugins** ➔ **Available plugins**, install:
   - `Docker Pipeline`
   - `Kubernetes CLI`
   - `Prometheus metrics`

---

### Task 2: Create Jenkins CI/CD Pipeline
1. In Jenkins dashboard, click **New Item**.
2. Name it `nascon-pipeline`, select **Pipeline**, click **OK**.
3. Under the **Pipeline** configuration:
   - Select **Pipeline script** and copy-paste the contents of [`Jenkinsfile`](file:///c:/Users/hp/Downloads/Eventsite/Jenkinsfile).
4. Click **Save** and then click **Build Now**.

---

### Task 3: Deploy to Minikube on EC2
To deploy directly onto Minikube:

1. Run the Minikube deployment script:
   ```bash
   cd ~/Eventsite
   ./deploy-minikube.sh
   ```
   This will:
   - Start Minikube cluster using Docker driver.
   - Build backend and frontend images directly inside Minikube.
   - Apply all Kubernetes manifests (`k8s/`).

2. **Crucial for EC2**: Expose Minikube NodePorts to the EC2 Public IP:
   ```bash
   ./expose-services-ec2.sh
   ```
3. Open the website on your laptop:
   **`http://<YOUR-EC2-PUBLIC-IP>:30080`**

---

### Task 4: Monitoring with Prometheus & Grafana
1. Verify Prometheus server:
   **`http://<YOUR-EC2-PUBLIC-IP>:30090`**
   - In Prometheus, click **Status** ➔ **Targets**.
   - You will see `nascon-backend-api` and `jenkins-pipeline` actively being scraped.

2. Access Grafana Dashboard:
   **`http://<YOUR-EC2-PUBLIC-IP>:30030`**
   - **Login**: `admin` / `admin`
   - Prometheus is pre-configured as the default data source.
   - You can create graphs for pipeline duration, API response status codes, and database health.

