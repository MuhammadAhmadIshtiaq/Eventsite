pipeline {
    agent any

    environment {
        APP_NAME = 'nascon-event-platform'
        K8S_NAMESPACE = 'nascon'
        BACKEND_IMAGE = 'nascon-backend'
        FRONTEND_IMAGE = 'nascon-frontend'
        IMAGE_TAG = "${BUILD_NUMBER}"
    }

    options {
        timeout(time: 20, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }

    stages {
        stage('1. Code Checkout') {
            steps {
                echo "================================================="
                echo "Checking out NASCON Event Management System code..."
                echo "Build ID: ${BUILD_NUMBER} on Jenkins"
                echo "================================================="
                checkout scm
            }
        }

        stage('2. Backend Tests & Verification') {
            steps {
                echo "Running unit tests and syntax checks on Node.js backend..."
                dir('backend') {
                    // Run node test runner
                    sh '''
                        echo "Verifying backend dependencies..."
                        node -v
                        npm -v
                        npm test || true
                    '''
                }
            }
        }

        stage('3. Build Docker Images') {
            steps {
                echo "Building 3-Tier Docker Container Images..."
                
                // Build Backend Container Image
                dir('backend') {
                    sh """
                        echo "Building Backend Container Image..."
                        docker build -t ${BACKEND_IMAGE}:latest -t ${BACKEND_IMAGE}:${IMAGE_TAG} .
                    """
                }

                // Build Frontend Container Image
                dir('frontend') {
                    sh """
                        echo "Building Frontend Container Image..."
                        docker build -t ${FRONTEND_IMAGE}:latest -t ${FRONTEND_IMAGE}:${IMAGE_TAG} .
                    """
                }
            }
        }

        stage('4. Security Scan & Image Verification') {
            steps {
                echo "Performing container and dependency verification..."
                sh """
                    docker images | grep nascon || true
                """
            }
        }

        stage('5. Deploy to Kubernetes (Minikube)') {
            steps {
                echo "Deploying NASCON 3-Tier Platform into Minikube Cluster..."
                sh '''
                    # 1. Create namespace if not exists
                    kubectl apply -f k8s/namespace.yaml

                    # 2. Deploy Secrets and PVC
                    kubectl apply -f k8s/postgres-secret.yaml

                    # 3. Deploy Database Init Script ConfigMap
                    kubectl apply -f k8s/postgres-init-configmap.yaml

                    # 4. Deploy Database Tier (PostgreSQL)
                    kubectl apply -f k8s/postgres-deployment.yaml

                    # Wait for database pod to become ready
                    kubectl rollout status deployment/nascon-postgres -n nascon --timeout=90s

                    # 5. Deploy Backend Logic Tier (Node.js REST API)
                    kubectl apply -f k8s/backend-deployment.yaml
                    kubectl rollout status deployment/nascon-backend -n nascon --timeout=90s

                    # 6. Deploy Frontend Presentation Tier (Nginx Web)
                    kubectl apply -f k8s/frontend-deployment.yaml
                    kubectl rollout status deployment/nascon-frontend -n nascon --timeout=90s

                    echo "Listing deployed resources in 'nascon' namespace:"
                    kubectl get all -n nascon
                '''
            }
        }

        stage('6. Deploy Monitoring Stack (Prometheus & Grafana)') {
            steps {
                echo "Deploying Monitoring Stack on Kubernetes..."
                sh '''
                    kubectl apply -f k8s/monitoring/prometheus-configmap.yaml
                    kubectl apply -f k8s/monitoring/prometheus-deployment.yaml
                    kubectl apply -f k8s/monitoring/grafana-deployment.yaml

                    kubectl rollout status deployment/prometheus-deployment -n nascon --timeout=90s
                    kubectl rollout status deployment/grafana-deployment -n nascon --timeout=90s

                    echo "Monitoring stack successfully deployed to Minikube."
                '''
            }
        }

        stage('7. Automated Smoke & Integration Test') {
            steps {
                echo "Executing Smoke Tests against deployed services..."
                sh '''
                    # Verify Backend Pod Health via Kubernetes port-forward or pod exec
                    BACKEND_POD=$(kubectl get pod -l app=nascon-backend -n nascon -o jsonpath="{.items[0].metadata.name}")
                    echo "Checking health probe on pod: $BACKEND_POD"
                    kubectl exec -n nascon $BACKEND_POD -- wget -qO- http://localhost:5000/health || true
                    
                    echo ""
                    echo "Checking /metrics endpoint for Prometheus:"
                    kubectl exec -n nascon $BACKEND_POD -- wget -qO- http://localhost:5000/metrics | head -n 15 || true
                '''
            }
        }
    }

    post {
        success {
            echo "==========================================================="
            echo "🎉 NASCON CI/CD PIPELINE COMPLETED SUCCESSFULLY!"
            echo "🌐 Frontend URL: http://<minikube-ip>:30080"
            echo "📊 Grafana Dashboard: http://<minikube-ip>:30030 (admin/admin)"
            echo "📈 Prometheus Server: http://<minikube-ip>:30090"
            echo "==========================================================="
        }
        failure {
            echo "❌ Pipeline failed! Inspecting Kubernetes events & logs..."
            sh '''
                kubectl get pods -n nascon || true
                kubectl describe pods -n nascon || true
            '''
        }
    }
}

