# ✅ KameHouse Vercel Deployment Checklist

Use this checklist to ensure a smooth deployment to Vercel.

## Pre-Deployment

- [ ] Code is committed and pushed to GitHub
- [ ] All tests are passing locally
- [ ] Environment variables are documented
- [ ] Database migration files are ready
- [ ] Production database is set up

## Backend Deployment

- [ ] Create new Vercel project for backend
- [ ] Set Root Directory to `backend`
- [ ] Configure Build Command: `npm run build && npx prisma generate`
- [ ] Set Output Directory: `dist`
- [ ] Add environment variables:
  - [ ] DATABASE_URL
  - [ ] JWT_SECRET (use: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
  - [ ] JWT_EXPIRATION
  - [ ] PORT
  - [ ] NODE_ENV
  - [ ] FRONTEND_URL (update after frontend deployment)
- [ ] Deploy backend
- [ ] Copy backend URL

## Database Setup

- [ ] Run migrations: `npx prisma migrate deploy`
- [ ] (Optional) Seed database: `npx prisma db seed`
- [ ] Verify database connection from backend

## Frontend Deployment

- [ ] Create new Vercel project for frontend
- [ ] Set Root Directory to `frontend`
- [ ] Configure Build Command: `npm run build`
- [ ] Set Output Directory: `dist`
- [ ] Framework Preset: Vite
- [ ] Add environment variables:
  - [ ] VITE_API_URL (your backend URL + /api)
- [ ] Deploy frontend
- [ ] Copy frontend URL

## Post-Deployment

- [ ] Update backend FRONTEND_URL environment variable
- [ ] Redeploy backend to apply CORS changes
- [ ] Test user registration
- [ ] Test user login
- [ ] Test household creation
- [ ] Test core features:
  - [ ] Habits
  - [ ] Chores
  - [ ] Rooms
  - [ ] Tasks
  - [ ] Notifications
- [ ] Monitor logs for errors
- [ ] Set up custom domain (optional)

## Security Verification

- [ ] JWT_SECRET is strong and random
- [ ] DATABASE_URL uses SSL
- [ ] No secrets in git repository
- [ ] CORS is configured correctly
- [ ] Environment variables are "Production" only

## Monitoring Setup

- [ ] Enable Vercel Analytics
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Configure uptime monitoring
- [ ] Set up database backup strategy

## Documentation

- [ ] Update README with production URLs
- [ ] Document deployment process
- [ ] Create runbook for common issues
- [ ] Share credentials securely with team

---

**Deployment Date**: ___________
**Deployed By**: ___________
**Backend URL**: ___________
**Frontend URL**: ___________
**Database Provider**: ___________

🎉 Congratulations on your KameHouse deployment!
