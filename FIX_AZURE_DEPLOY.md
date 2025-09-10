# Fix Azure Deployment Issues

## Problem
GitHub Actions deployment is failing with error:
```
Login failed with Error: Using auth-type: SERVICE_PRINCIPAL. 
Not all values are present. Ensure 'client-id' and 'tenant-id' are supplied.
```

## Solution

### Option 1: Create New Azure Service Principal

1. **Login to Azure CLI:**
```bash
az login
```

2. **Get your subscription ID:**
```bash
az account show --query id -o tsv
```

3. **Create service principal with correct format:**
```bash
# Replace YOUR_SUBSCRIPTION_ID with actual ID
az ad sp create-for-rbac \
  --name "github-actions-crove" \
  --role contributor \
  --scopes /subscriptions/YOUR_SUBSCRIPTION_ID/resourceGroups/Crove \
  --sdk-auth
```

4. **Copy the JSON output** (should look like this):
```json
{
  "clientId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "clientSecret": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "subscriptionId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "tenantId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "activeDirectoryEndpointUrl": "https://login.microsoftonline.com",
  "resourceManagerEndpointUrl": "https://management.azure.com/",
  "activeDirectoryGraphResourceId": "https://graph.windows.net/",
  "sqlManagementEndpointUrl": "https://management.core.windows.net:8443/",
  "galleryEndpointUrl": "https://gallery.azure.com/",
  "managementEndpointUrl": "https://management.core.windows.net/"
}
```

5. **Update GitHub secret:**
```bash
# Delete old secret
gh secret delete AZURE_CREDENTIALS --repo CroveAI/Crove

# Add new secret (paste the JSON when prompted)
gh secret set AZURE_CREDENTIALS --repo CroveAI/Crove
```

### Option 2: Use Alternative Deployment Method

Since Docker Hub credentials are working, we can simplify the deployment:

1. **Update the workflow to use SSH instead of Azure CLI:**

Edit `.github/workflows/deploy-azure-vm.yml`:
- Remove Azure login step
- Use SSH action instead of Azure CLI

2. **Add SSH key to GitHub secrets:**
```bash
# Generate SSH key if not exists
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github-actions -N ""

# Add public key to Azure VM
ssh-copy-id -i ~/.ssh/github-actions.pub joy@52.172.194.116

# Add private key to GitHub
gh secret set SSH_PRIVATE_KEY --repo CroveAI/Crove < ~/.ssh/github-actions
```

### Option 3: Manual Deployment Until Fixed

Use the deployment script:
```bash
./deploy-beta.sh
```

Or trigger deployment manually via SSH:
```bash
ssh joy@52.172.194.116 "cd /home/joy/crove && git pull && docker-compose -f docker-compose.production.yml up -d --build"
```

## Verification

After fixing, test the deployment:

1. **Trigger GitHub Actions manually:**
```bash
gh workflow run "Deploy to Azure VM" --repo CroveAI/Crove
```

2. **Watch the run:**
```bash
gh run watch --repo CroveAI/Crove
```

3. **Check deployment status:**
```bash
curl -I https://beta.crove.com
```

## Current Status

- ✅ Docker Hub credentials: Working
- ✅ Docker image build: Working  
- ❌ Azure login: Failed (incorrect credential format)
- ❌ VM deployment: Not reached due to Azure login failure

## Next Steps

1. Fix Azure credentials (recommended)
2. Or switch to SSH-based deployment
3. Or use manual deployment until resolved