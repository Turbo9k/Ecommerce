# Deployment Guide

## Vercel Deployment

Your application has been configured for Vercel deployment. The project is linked to: **iansia/ecommerce-platform**

### Current Status

- ✅ Project linked to Vercel
- ✅ Build configuration added (`vercel.json`)
- ⚠️ Environment variables need to be configured
- ⚠️ Build is failing - likely due to missing environment variables

### Required Environment Variables

You need to set the following environment variables in your Vercel project:

1. **STRIPE_SECRET_KEY** (Required)
   - Your Stripe secret key (starts with `sk_test_` for test mode or `sk_live_` for production)
   - Get it from: https://dashboard.stripe.com/apikeys

2. **JWT_SECRET** (Required)
   - A random secret string for JWT token signing
   - Generate one with: `openssl rand -base64 32`
   - Or use any secure random string

3. **STRIPE_WEBHOOK_SECRET** (Optional but recommended)
   - Required for Stripe webhook verification
   - Get it from Stripe Dashboard → Developers → Webhooks
   - You'll need to create a webhook endpoint first

### How to Set Environment Variables in Vercel

1. Go to your Vercel dashboard: https://vercel.com/iansia/ecommerce-platform
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable:
   - **Name**: `STRIPE_SECRET_KEY`
   - **Value**: Your Stripe secret key
   - **Environment**: Production, Preview, Development (select all)
4. Repeat for `JWT_SECRET` and `STRIPE_WEBHOOK_SECRET`
5. Click **Save**

### After Setting Environment Variables

1. Go to **Deployments** tab
2. Find the latest failed deployment
3. Click the **⋯** menu → **Redeploy**
4. Or push a new commit to trigger a new deployment

### Stripe Webhook Configuration

After deployment, you'll need to configure your Stripe webhook:

1. Get your production URL from Vercel (e.g., `https://your-app.vercel.app`)
2. Go to Stripe Dashboard → Developers → Webhooks
3. Click **Add endpoint**
4. Endpoint URL: `https://your-app.vercel.app/api/stripe/webhook`
5. Select events to listen to:
   - `charge.refunded`
   - `refund.updated`
   - `charge.refund.updated`
6. Copy the **Signing secret** and add it as `STRIPE_WEBHOOK_SECRET` in Vercel

### Alternative: Deploy via Vercel Dashboard

1. Push your code to GitHub (if not already):
   ```bash
   git push origin main
   ```

2. Go to https://vercel.com/new
3. Import your GitHub repository
4. Vercel will auto-detect Next.js
5. Add environment variables during setup
6. Click **Deploy**

### Troubleshooting

If the build still fails after setting environment variables:

1. Check build logs in Vercel dashboard
2. Verify all required environment variables are set
3. Ensure `STRIPE_SECRET_KEY` is valid
4. Check that `JWT_SECRET` is set (even if it's just a placeholder for now)

### Production Checklist

- [ ] Set all required environment variables
- [ ] Configure Stripe webhook endpoint
- [ ] Test authentication flow
- [ ] Test checkout process
- [ ] Verify admin dashboard access
- [ ] Test order management features

### Current Deployment URLs

- **Production**: https://ecommerce-platform-d8ey2hme2-iansia.vercel.app
- **Dashboard**: https://vercel.com/iansia/ecommerce-platform

