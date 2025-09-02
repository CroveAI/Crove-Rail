# Quick Database Setup với ElephantSQL (Free)

1. Vào https://www.elephantsql.com/
2. Sign up / Login
3. Create New Instance (Free - Tiny Turtle)
4. Choose region: Singapore
5. Copy DATABASE URL

## Set DATABASE_URL cho Azure:

```bash
az webapp config appsettings set \
  --resource-group Crove \
  --name crove-dev \
  --settings \
  DATABASE_URL="[PASTE_ELEPHANTSQL_URL_HERE]"

# Restart app
az webapp restart --resource-group Crove --name crove-dev
```

ElephantSQL Free tier:
- 20 MB data
- 5 concurrent connections
- Đủ cho testing/demo