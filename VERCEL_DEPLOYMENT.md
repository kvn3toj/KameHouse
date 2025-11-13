# 🚀 KameHouse Vercel Deployment Guide

This guide will help you deploy KameHouse to Vercel with a production-ready setup.

## 📋 Prerequisites

- Vercel account (sign up at https://vercel.com)
- GitHub repository with KameHouse code
- PostgreSQL database (Vercel Postgres, Supabase, or other provider)

## 🗄️ Step 1: Set Up PostgreSQL Database

### Option A: Vercel Postgres (Recommended)

1. Go to your Vercel dashboard
2. Navigate to Storage → Create Database → Postgres
3. Follow the setup wizard
4. Copy the `DATABASE_URL` connection string

### Option B: External Provider (Supabase, Railway, etc.)

1. Create a PostgreSQL database on your preferred provider
2. Get the connection string in this format:
   ```
   postgresql://user:password@host:5432/database_name
   ```

## 🔧 Step 2: Deploy Backend to Vercel

### Method 1: Deploy from GitHub (Recommended)

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "feat: Prepare for Vercel deployment"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Select "KameHouse" project
   - Configure project settings:
     - **Framework Preset**: Other
     - **Root Directory**: `backend`
     - **Build Command**: `npm run build && npx prisma generate`
     - **Output Directory**: `dist`

3. **Set Environment Variables**

   Click "Environment Variables" and add:

   ```env
   DATABASE_URL=your_postgresql_connection_string
   JWT_SECRET=your-super-secret-jwt-key-min-32-chars
   JWT_EXPIRATION=7d
   PORT=3000
   NODE_ENV=production
   FRONTEND_URL=https://your-frontend-domain.vercel.app
   ```

   **Important**: Generate a secure JWT_SECRET:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete
   - Copy your backend URL (e.g., `https://kamehouse-backend.vercel.app`)

### Method 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to backend directory
cd backend

# Login to Vercel
vercel login

# Deploy
vercel --prod

# Set environment variables
vercel env add DATABASE_URL
vercel env add JWT_SECRET
vercel env add JWT_EXPIRATION
vercel env add NODE_ENV
vercel env add FRONTEND_URL
```

## 🎨 Step 3: Deploy Frontend to Vercel

1. **Create a new Vercel project for frontend**
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Configure project settings:
     - **Framework Preset**: Vite
     - **Root Directory**: `frontend`
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`

2. **Set Environment Variables**

   ```env
   VITE_API_URL=https://your-backend-domain.vercel.app/api
   ```

3. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete
   - Copy your frontend URL

## 🔄 Step 4: Run Database Migrations

After backend deployment, run Prisma migrations:

```bash
# Navigate to backend directory
cd backend

# Set DATABASE_URL environment variable
export DATABASE_URL="your_production_database_url"

# Run migrations
npx prisma migrate deploy

# (Optional) Seed initial data
npx prisma db seed
```

Or use Vercel CLI:

```bash
vercel env pull .env.production
npx prisma migrate deploy
```

## 🔗 Step 5: Update CORS and API URLs

1. **Update Backend Environment Variables in Vercel**
   - Go to your backend project in Vercel
   - Settings → Environment Variables
   - Update `FRONTEND_URL` with your actual frontend URL

2. **Redeploy Backend**
   - Go to Deployments
   - Click "..." on latest deployment → Redeploy

3. **Update Frontend Environment Variables**
   - Go to your frontend project in Vercel
   - Settings → Environment Variables
   - Update `VITE_API_URL` if needed

4. **Redeploy Frontend**

## ✅ Step 6: Verify Deployment

1. **Test Backend**
   ```bash
   curl https://your-backend-domain.vercel.app/api/health
   ```

2. **Test Frontend**
   - Open your frontend URL in browser
   - Try to register a new user
   - Try to login
   - Create a household
   - Test core features

## 🔐 Security Checklist

- ✅ Strong JWT_SECRET (min 32 characters, random)
- ✅ DATABASE_URL uses SSL connection
- ✅ CORS configured with specific frontend URL
- ✅ Environment variables set as "Production" only
- ✅ No secrets committed to git
- ✅ Database connection pooling enabled

## 📊 Monitoring and Logs

### View Deployment Logs
1. Go to your project in Vercel dashboard
2. Click "Deployments"
3. Click on a deployment
4. View "Build Logs" and "Function Logs"

### Monitor Database
1. Use Prisma Studio locally:
   ```bash
   DATABASE_URL="your_production_url" npx prisma studio
   ```

2. Or use your database provider's dashboard

## 🐛 Troubleshooting

### Backend Issues

**Problem**: "Cannot connect to database"
- **Solution**: Verify DATABASE_URL is correct and database is accessible
- Check if database allows connections from Vercel IPs

**Problem**: "JWT authentication fails"
- **Solution**: Ensure JWT_SECRET is set correctly in environment variables

**Problem**: "Prisma Client not generated"
- **Solution**: Add `npx prisma generate` to build command

### Frontend Issues

**Problem**: "API calls fail with CORS error"
- **Solution**: Update FRONTEND_URL in backend environment variables
- Verify CORS configuration in `main.ts`

**Problem**: "Environment variables undefined"
- **Solution**: Ensure all VITE_* variables are set in Vercel project settings
- Redeploy after adding environment variables

**Problem**: "404 on page refresh"
- **Solution**: Vercel handles this automatically for Vite apps
- If issue persists, add `vercel.json` to frontend:
  ```json
  {
    "rewrites": [
      { "source": "/(.*)", "destination": "/index.html" }
    ]
  }
  ```

## 🔄 Continuous Deployment

Once set up, every push to your main branch will automatically:
1. Build your application
2. Run tests (if configured)
3. Deploy to production

To deploy to preview environments:
```bash
git checkout -b feature/new-feature
git push origin feature/new-feature
```
Vercel will create a preview deployment automatically.

## 📱 Custom Domain (Optional)

1. Go to your project in Vercel
2. Settings → Domains
3. Add your custom domain
4. Update DNS records as instructed
5. Update environment variables with new domain

## 💰 Cost Considerations

### Vercel
- **Hobby Plan**: Free (Good for development/personal use)
  - 100GB bandwidth/month
  - Serverless Function execution time limits

- **Pro Plan**: $20/month (Recommended for production)
  - Unlimited bandwidth
  - Higher function execution limits
  - Team collaboration

### Database
- **Vercel Postgres**: Free tier available, pay-as-you-grow
- **Supabase**: Free tier available (500MB database)
- **Railway**: Free tier available ($5 credit/month)

## 🎯 Next Steps

1. Set up monitoring (Vercel Analytics, Sentry)
2. Configure custom domain
3. Set up backup strategy for database
4. Implement CI/CD tests
5. Add performance monitoring
6. Set up error tracking

## 📚 Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Prisma Deployment Guide](https://www.prisma.io/docs/guides/deployment/deployment)
- [NestJS Production Best Practices](https://docs.nestjs.com/fundamentals/deployment)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)

---

**Need Help?** Create an issue in the repository or contact the CoomUnity team.

🎮 Happy Deploying! May the Kame energy be with you! 🐢✨
