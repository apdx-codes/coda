# Deployment Guide

This guide covers deploying and running Coda in various environments.

## Local Development

### Prerequisites

- Node.js 18+ and npm
- At least one AI provider API key
- Git

### Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd coda
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment:
```bash
cp env.example .env
```

4. Edit `.env` with your API keys:
```
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
```

5. Start development servers:
```bash
npm run dev
```

This starts:
- API server on http://localhost:3000
- Web UI on http://localhost:3001

## Production Deployment

### Build for Production

```bash
npm run build
```

This builds all packages:
- `packages/core/dist` - Core library
- `packages/api/dist` - API server
- `packages/web/.next` - Web UI

### Environment Variables

Required environment variables for production:

```
NODE_ENV=production
PORT=3000

# AI Provider Keys (at least one required)
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
GOOGLE_AI_API_KEY=
XAI_API_KEY=

# Optional: Local AI
LOCAL_AI_ENDPOINT=
LOCAL_AI_MODEL=

# Solana Configuration
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_NETWORK=devnet
```

### Running in Production

#### API Server

```bash
cd packages/api
npm start
```

Or with PM2:

```bash
pm2 start packages/api/dist/index.js --name coda-api
```

#### Web UI

```bash
cd packages/web
npm start
```

Or use a static hosting service by deploying the `.next` folder.

## Docker Deployment

### Dockerfile

Create a `Dockerfile` in the root:

```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
COPY turbo.json ./
COPY packages ./packages

RUN npm install
RUN npm run build

FROM node:18-alpine

WORKDIR /app
COPY --from=builder /app/packages/api/dist ./api
COPY --from=builder /app/packages/core/dist ./core
COPY --from=builder /app/node_modules ./node_modules

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "api/index.js"]
```

### Build and Run

```bash
docker build -t coda-api .
docker run -p 3000:3000 --env-file .env coda-api
```

### Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
    restart: unless-stopped

  web:
    build:
      context: .
      dockerfile: Dockerfile.web
    ports:
      - "3001:3001"
    environment:
      - NEXT_PUBLIC_API_URL=http://api:3000
    depends_on:
      - api
    restart: unless-stopped
```

Run with:

```bash
docker-compose up -d
```

## Cloud Deployment

### AWS EC2

1. Launch EC2 instance (t3.medium or larger)
2. Install Node.js 18+
3. Clone repository
4. Configure environment variables
5. Build and run:

```bash
npm install
npm run build
pm2 start packages/api/dist/index.js
```

6. Configure security group:
- Inbound: Port 3000 (API)
- Inbound: Port 3001 (Web UI)

### AWS ECS/Fargate

1. Build Docker image
2. Push to ECR
3. Create ECS task definition
4. Configure environment variables
5. Create ECS service
6. Configure Application Load Balancer

### Google Cloud Run

1. Build container:
```bash
gcloud builds submit --tag gcr.io/PROJECT_ID/coda-api
```

2. Deploy:
```bash
gcloud run deploy coda-api \
  --image gcr.io/PROJECT_ID/coda-api \
  --platform managed \
  --region us-central1 \
  --set-env-vars OPENAI_API_KEY=sk-...
```

### Vercel (Web UI)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy web UI:
```bash
cd packages/web
vercel
```

3. Configure environment variables in Vercel dashboard

### Heroku

1. Create Heroku app:
```bash
heroku create coda-api
```

2. Set environment variables:
```bash
heroku config:set OPENAI_API_KEY=sk-...
```

3. Deploy:
```bash
git push heroku main
```

## Reverse Proxy Configuration

### Nginx

```nginx
server {
    listen 80;
    server_name coda.example.com;

    location /api/ {
        proxy_pass http://localhost:3000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Apache

```apache
<VirtualHost *:80>
    ServerName coda.example.com

    ProxyPreserveHost On
    ProxyPass /api http://localhost:3000/api
    ProxyPassReverse /api http://localhost:3000/api

    ProxyPass / http://localhost:3001/
    ProxyPassReverse / http://localhost:3001/
</VirtualHost>
```

## SSL/TLS Configuration

### Let's Encrypt with Certbot

```bash
sudo certbot --nginx -d coda.example.com
```

### Manual Certificate

```nginx
server {
    listen 443 ssl;
    server_name coda.example.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # ... proxy configuration
}
```

## Performance Optimization

### API Server

1. Enable compression:
```typescript
import compression from 'compression';
app.use(compression());
```

2. Add caching:
```typescript
import { cacheMiddleware } from './middleware/cache';
app.use('/api/providers', cacheMiddleware(60));
```

3. Rate limiting:
```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

app.use(limiter);
```

### Web UI

1. Enable compression in Next.js config:
```javascript
module.exports = {
  compress: true,
  // ... other config
}
```

2. Optimize images:
```javascript
import Image from 'next/image';
```

3. Use CDN for static assets

## Monitoring

### Health Checks

```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "status": "ok",
  "version": "0.1.0",
  "enabledProviders": ["openai"],
  "solanaNetwork": "devnet"
}
```

### Logging

Configure structured logging:

```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

### Metrics

Track key metrics:
- Request count
- Response time
- Error rate
- AI provider usage
- Token consumption

## Backup and Recovery

### Configuration Backup

Backup `.env` file securely:
```bash
cp .env .env.backup
chmod 600 .env.backup
```

### Database Backup

If you extend Coda with a database, implement regular backups:
```bash
# Example for PostgreSQL
pg_dump coda > backup.sql
```

## Security Best Practices

1. Never commit `.env` to version control
2. Use secrets management (AWS Secrets Manager, etc.)
3. Enable HTTPS in production
4. Implement rate limiting
5. Validate all inputs
6. Keep dependencies updated
7. Use security headers
8. Monitor for vulnerabilities

## Troubleshooting

### API Server Won't Start

Check:
- Port 3000 is available
- At least one AI provider is configured
- Node.js version is 18+

### Provider Not Available

Check:
- API key is correct
- API key has sufficient quota
- Network connectivity
- Provider service status

### Build Failures

Try:
```bash
npm run clean
rm -rf node_modules
npm install
npm run build
```

### Memory Issues

Increase Node.js memory:
```bash
NODE_OPTIONS=--max-old-space-size=4096 npm start
```

## Scaling

### Horizontal Scaling

Run multiple API server instances:

```bash
pm2 start packages/api/dist/index.js -i 4
```

Use load balancer to distribute traffic.

### Vertical Scaling

Increase server resources:
- CPU: 2+ cores recommended
- RAM: 4GB+ recommended
- Storage: 20GB+ recommended

### Caching Layer

Add Redis for caching:

```typescript
import Redis from 'ioredis';

const redis = new Redis();

async function getCached(key: string) {
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);
  return null;
}
```

## Maintenance

### Updates

1. Pull latest changes:
```bash
git pull origin main
```

2. Install dependencies:
```bash
npm install
```

3. Build:
```bash
npm run build
```

4. Restart:
```bash
pm2 restart coda-api
```

### Monitoring Logs

```bash
pm2 logs coda-api
```

### Health Monitoring

Set up automated health checks:

```bash
*/5 * * * * curl -f http://localhost:3000/api/health || alert
```

