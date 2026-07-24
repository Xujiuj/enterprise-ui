# Enterprise UI deployment

This directory contains the standalone delivery scripts for the enterprise UI only.

The built nginx image proxies API requests to `enterprise-backend:8080`. Deploy the enterprise backend on the same `FX_DOCKER_NETWORK`, or use the top-level `deploy/` directory for the full four-service stack.

## Windows

```powershell
Copy-Item .env.example .env
.\deploy.ps1
```

## Linux

```bash
cp .env.example .env
chmod +x ./*.sh
./deploy.sh
```
