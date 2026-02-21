# CI/CD Pipelines — Automate Docker Build/Push + EC2 Redeploy

Two GitHub Actions pipelines to fully automate deployment. Infra changes and app code changes are handled separately.

## GitHub Secrets Required

Add these to your GitHub repo → Settings → Secrets → Actions:

- `AWS_ACCESS_KEY_ID` — IAM user with ECR push + SSM + EC2 describe permissions
- `AWS_SECRET_ACCESS_KEY` — corresponding secret
- `AWS_REGION` — `us-east-1`
- `AWS_ACCOUNT_ID` — your 12-digit AWS account ID

---

## Pipeline 1 — Infra Pipeline (`infra-pipeline.yml`)

**Trigger**: Push to `main` where files changed inside `terra-config/**` or `scripts/**`

**Steps**:

1. Checkout code
2. Configure AWS credentials
3. Setup Terraform
4. `terraform init`
5. `terraform validate`
6. `terraform plan`
7. `terraform apply -auto-approve`

---

## Pipeline 2 — App Pipeline (`app-pipeline.yml`)

**Trigger**: Push to `main` where files changed inside `web/**` or `nginx/**`

**Flow**:

```
Code push → GitHub Actions → Build Docker images
                           → Tag with git SHA (auto-versioning)
                           → Push to ECR
                           → SSM command to EC2:
                               docker-compose pull
                               docker-compose up -d
```

**Key design decisions**:

- **Auto-tagging**: Uses git commit SHA as the image tag (e.g. `a1b2c3d`) — no manual version bumping
- **Selective build**: Only rebuilds if the relevant folder (`web/` or `nginx/`) changed
- **EC2 discovery**: Finds EC2 instances by project tag, not hardcoded instance IDs
- **SSM deploy**: Updates `docker-compose.yml` on EC2 via SSM, pulls new images, restarts

---

## Verification Plan

### Test Infra Pipeline

- Make a trivial change to a `.tf` file → push to `main` → confirm pipeline runs `terraform plan/apply`

### Test App Pipeline

- Change `server.js` title text → push to `main` → confirm Docker build, ECR push, and EC2 restart → visit public IP to see change

## Full Flow

1. Infra Pipeline (first time)
   terra-config changes → terraform apply → EC2 created → user_data pulls images → App is live ✅

2. App Pipeline (subsequent code changes)
   web/ or nginx/ changes → Build images → Push to ECR → SSM deploy to EC2 → App updated ✅
