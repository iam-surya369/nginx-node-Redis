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
