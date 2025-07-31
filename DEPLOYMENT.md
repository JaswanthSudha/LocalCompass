# LocalBot Vercel Deployment Guide

## 📋 Prerequisites
- GitHub account
- Vercel account (sign up at vercel.com)
- Google Gemini API key
- Database (if using PostgreSQL)

## 🚀 Step-by-Step Deployment

### 1. Prepare Your Repository

#### Push to GitHub:
```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### 2. Configure Environment Variables

You'll need these environment variables in Vercel:

#### Required Variables:
- `GEMINI_API_KEY` - Your Google Gemini API key
- `NODE_ENV` - Set to "production"

#### Database Variables (if using PostgreSQL):
- `DATABASE_URL` - Full PostgreSQL connection string
- `PGHOST` - Database host
- `PGPORT` - Database port (usually 5432)
- `PGUSER` - Database username
- `PGPASSWORD` - Database password
- `PGDATABASE` - Database name

#### Optional:
- `SESSION_SECRET` - Random string for session security

### 3. Deploy to Vercel

#### Option A: Import from GitHub (Recommended)
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Vercel auto-detects the framework (Node.js)
5. Configure project settings:
   - **Framework Preset**: Other
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist/public`
   - **Install Command**: `npm install`

#### Option B: Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

### 4. Add Environment Variables in Vercel

#### Via Vercel Dashboard:
1. Go to your project dashboard
2. Navigate to Settings → Environment Variables
3. Add each variable:
   - Name: `GEMINI_API_KEY`
   - Value: Your actual API key
   - Environment: Production, Preview, Development

#### Via Vercel CLI:
```bash
vercel env add GEMINI_API_KEY
vercel env add NODE_ENV
vercel env add DATABASE_URL
```

### 5. Database Setup (If Using PostgreSQL)

#### Option A: Neon Database (Free)
1. Create account at [neon.tech](https://neon.tech)
2. Create new database
3. Copy connection string
4. Add to Vercel as `DATABASE_URL`

#### Option B: Vercel Postgres
1. In Vercel dashboard, go to Storage
2. Create Postgres database
3. Environment variables are auto-added

### 6. Deploy and Test

1. **Deploy**: Push to GitHub or run `vercel --prod`
2. **Check logs**: Visit Vercel dashboard → Functions tab
3. **Test API**: Visit `https://your-app.vercel.app/api/search`
4. **Test frontend**: Visit `https://your-app.vercel.app`

## 🔧 Troubleshooting

### Common Issues:

#### Build Failures:
- Check build logs in Vercel dashboard
- Ensure all dependencies are in package.json
- Verify TypeScript configuration

#### API Errors:
- Check environment variables are set correctly
- Verify API keys are valid
- Check function logs in Vercel dashboard

#### Database Connection:
- Verify DATABASE_URL format
- Check database is accessible from external connections
- Ensure SSL is configured if required

### Build Configuration:

If you encounter build issues, add this to your project root:

**build.sh** (if needed):
```bash
#!/bin/bash
npm install
npm run build
```

### Environment Variable Format:

**DATABASE_URL example**:
```
postgresql://username:password@host:5432/database
```

## 📊 Monitoring

### Check Deployment Status:
- Visit Vercel dashboard
- Monitor function invocations
- Check error rates and performance

### Logs:
- Runtime logs: Vercel dashboard → Functions
- Build logs: Vercel dashboard → Deployments

## 💰 Cost Estimation

### Vercel Free Tier:
- 100GB bandwidth per month
- 100GB-hours of function execution
- Unlimited static requests
- Perfect for personal projects

### When You Might Need Pro ($20/month):
- High traffic (>100GB bandwidth)
- Commercial use
- Advanced analytics
- Team collaboration

## 🎯 Your LocalBot Deployment

Your LocalBot app will be available at:
- `https://your-project-name.vercel.app`
- Custom domain (if configured)

Features included:
- Automatic HTTPS
- Global CDN
- Serverless functions for your API
- Environment variable management
- Git integration for auto-deploys

## 🔄 Continuous Deployment

Once set up, every push to your main branch will automatically deploy to Vercel!