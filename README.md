# Request Counter: Nginx + Node.js + Redis

A high-performance, containerized application demonstrating **automated infrastructure** and **modern CI/CD** practices. This project uses Nginx to load balance traffic across scalable Node.js instances, which communicate with a shared Redis database for persistence.

## 🏗 System Architecture

- **Frontend/Proxy:** Nginx (Acts as a Reverse Proxy & Round-Robin Load Balancer)
- **Backend:** Node.js (Two identical instances: `web1` and `web2`)
- **Data Store:** Redis (Global state for the request counter)
- **Infrastructure:** Terraform (Automated AWS EC2 provisioning)
- **CI/CD:** GitHub Actions (Secure deployment via OIDC)

---

## Prerequisites

Ensure you have the following installed:

- [Docker & Docker Compose](https://docs.docker.com/get-docker/)
- [Terraform](https://developer.hashicorp.com/terraform/downloads) (for AWS deployment)
- [AWS CLI](https://aws.amazon.com/cli/) (configured with appropriate permissions)

---

## 🚀Deployment Workflow

terraform apply
│
├─► Creates ECR repo
├─► Creates VPC, subnets, SGs
├─► Creates EC2 instance(s)
│ └─► user_data runs setup.tftpl:
│ ├─► Installs Docker
│ ├─► Writes docker-compose.yml (with ECR image URLs)
│ ├─► Authenticates to ECR
│ └─► Pulls & starts: redis + web1 + web2 + nginx
│
└─► (You separately push Docker images to ECR)

## How aws commands are executed on the ec2 server without configuring aws creds

EC2 Instance boots
│
▼
AWS automatically injects temporary credentials
into the EC2 Instance Metadata Service (IMDS)
│
▼
http://169.254.169.254/latest/meta-data/iam/security-credentials/ec2-role
│
▼
AWS CLI automatically reads from IMDS
(no ~/.aws/credentials file needed!)
│
▼
aws ecr get-login-password --region us-east-1
✅ Works! Uses the role's permissions

## IAM Policies and what they allow

- AmazonEC2ContainerRegistryReadOnly:
  Pull images from ECR (ecr:GetAuthorizationToken, ecr:BatchGetImage, etc.)

- AmazonSSMManagedInstanceCore:
  Connect to the instance via AWS SSM Session Manager (no SSH key needed)

---

## Existing Implementation Plan:

CI/CD Pipelines for nginx-node-redis (EC2 + Docker Compose)
Two separate GitHub Actions pipelines — one for infrastructure changes, one for application code changes. Both run on push to main.

User Review Required
IMPORTANT

The following GitHub Actions Secrets must be configured in your repo before the pipelines work:

AWS_ACCESS_KEY_ID — IAM user key with ECR push + SSM + EC2 describe permissions
AWS_SECRET_ACCESS_KEY — corresponding secret
AWS_REGION — e.g. us-east-1
The IAM user running the pipeline is separate from the EC2 instance role. It only needs permissions to: push to ECR, run SSM commands, and describe EC2 instances.

IMPORTANT

The infra pipeline runs terraform apply automatically on merge to main. If you want a manual approval gate before apply, let me know and I'll add a workflow_dispatch trigger or an environment protection rule.

Proposed Changes
Pipeline 1 — Infrastructure (infra-pipeline.yml)
[NEW]
infra-pipeline.yml
Trigger: Push to main where files changed inside terra-config/\*\*

Steps:

Checkout code
Configure AWS credentials (from GitHub Secrets)
Setup Terraform
terraform init (connects to S3 backend)
terraform fmt --check (lint)
terraform validate
terraform plan (shows what will change)
terraform apply -auto-approve
Pipeline 2 — Application (app-pipeline.yml)
[NEW]
app-pipeline.yml
Trigger: Push to main where files changed inside web/** or nginx/**

Steps:

Checkout code
Configure AWS credentials (from GitHub Secrets)
Login to ECR
Build
web/Dockerfile
→ tag as node-app-latest
Build
nginx/Dockerfile
→ tag as nginx-proxy-latest
Push both images to ECR
Get EC2 instance IDs (via aws ec2 describe-instances filtered by project tag)
Send SSM run-command to each EC2:
bash
cd /home/ubuntu/app
aws ecr get-login-password --region $REGION | docker login ...
docker-compose pull
docker-compose up -d
Wait for SSM command to complete and report success/failure
Verification Plan
Manual Verification (no automated tests exist in this project)
Pipeline 1 (Infra):

Make a trivial change to
terra-config/terraform.tfvars
(e.g. add a comment)
Push to main → GitHub Actions tab should show infra-pipeline triggered
Confirm all steps pass and terraform apply shows No changes or applies correctly
Pipeline 2 (App):

Make a trivial change to
web/server.js
(e.g. change the page title text)
Push to main → GitHub Actions tab should show app-pipeline triggered
Confirm Docker build, ECR push, and SSM restart all succeed
Visit http://<EC2_PUBLIC_IP> and confirm the change is live
