# LocalCompass Deployment Setup Guide

## 🗄️ Database Setup Options

### Option 1: Neon Database (Recommended)
1. **Create Account**: Go to [neon.tech](https://neon.tech) and sign up
2. **Create Database**: 
   - Click "Create Database"
   - Choose a region close to your users
   - Database name: `localcompass`
3. **Get Connection Details**:
   - Copy the connection string from dashboard
   - It will look like: `postgresql://username:password@host/database?sslmode=require`

### Option 2: Vercel Postgres
1. **In Vercel Dashboard**:
   - Go to Storage tab
   - Click "Create Database" 
   - Choose "Postgres"
   - Name: `localcompass-db`
2. **Auto-generated variables** will be added to your project

### Option 3: Supabase
1. **Create Account**: Go to [supabase.com](https://supabase.com)
2. **New Project**: 
   - Organization: Your account
   - Name: `localcompass`
   - Database Password: Create a strong password
   - Region: Choose closest to your users
3. **Get Connection String**:
   - Go to Settings → Database
   - Copy "Connection string" under "Connection parameters"

## 🔧 Environment Variables Setup

Once you have your database, you'll have these values:

```bash
# From your database provider, you'll get:
DATABASE_URL=postgresql://username:password@host:5432/database?sslmode=require
PGHOST=your-db-host.amazonaws.com (or similar)
PGPORT=5432
PGUSER=your-username
PGPASSWORD=your-password
PGDATABASE=your-database-name

# Additional required variables:
GEMINI_API_KEY=your_gemini_api_key_here
SESSION_SECRET=your_random_session_secret_here
NODE_ENV=production
```

## 🚀 Deployment Steps

### 1. Get Google Gemini API Key
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create new API key
3. Copy the key

### 2. Deploy to Vercel
1. **Push to GitHub** (if not already done):
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Import to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import from GitHub: `JaswanthSudha/LocalCompass`
   - Framework: Other
   - Build Command: `npm run build`
   - Output Directory: `dist/public`

3. **Add Environment Variables in Vercel**:
   - Go to Settings → Environment Variables
   - Add each variable listed above

### 3. Initialize Database
After deployment, run database migration:
```bash
# Install Vercel CLI
npm i -g vercel

# Link your project
vercel link

# Run database push to create tables
vercel env pull .env.local
npm run db:push
```

## 📝 Example Environment Variables

**For Neon Database:**
```
DATABASE_URL=postgresql://username:password@ep-cool-lab-123456.us-east-1.aws.neon.tech/localcompass?sslmode=require
PGHOST=ep-cool-lab-123456.us-east-1.aws.neon.tech
PGPORT=5432
PGUSER=username
PGPASSWORD=your-password-here
PGDATABASE=localcompass
GEMINI_API_KEY=your-gemini-api-key
SESSION_SECRET=super-secret-random-string-here
NODE_ENV=production
```

## 🔍 Testing Your Deployment

1. **Check Database Connection**: Visit `https://your-app.vercel.app/api/health` (if you have health endpoint)
2. **Test Search**: Try the search functionality on your deployed app
3. **Check Logs**: Vercel Dashboard → Functions → View logs

## 💡 Pro Tips

1. **Security**: Never commit `.env` files with real credentials
2. **Database Scaling**: Neon auto-scales, perfect for growing apps
3. **Monitoring**: Use Vercel Analytics to monitor performance
4. **Backups**: Most providers auto-backup, but verify this

## 🆘 Troubleshooting

**Database Connection Issues:**
- Verify `DATABASE_URL` format is correct
- Check if SSL is required (usually yes for cloud databases)
- Ensure database allows external connections

**Build Failures:**
- Check all environment variables are set in Vercel
- Verify all dependencies are in `package.json`
- Check Vercel build logs for specific errors

Your LocalCompass app will be live at: `https://your-project-name.vercel.app`
