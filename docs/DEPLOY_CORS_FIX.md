# Complete CORS Fix - Deployment Instructions

## Problem
CORS preflight requests are being blocked by Cloud Run authentication before they reach your code.

## Solution: Two-Part Fix

### Part 1: Cloud Run IAM - Make Service Public (REQUIRED)

**This is the critical fix. Your service must allow unauthenticated access for preflight requests.**

#### Step 1: Find Your Exact Service Name

The service name might differ from the function name. Find it with:

```bash
gcloud run services list --region=us-east1
```

Look for a service with a URL containing `ragquery` or check your Firebase console.

#### Step 2: Allow Public Access

Run this EXACT command (replace service name if different):

```bash
gcloud run services add-iam-policy-binding ragquery \
  --member="allUsers" \
  --role="roles/run.invoker" \
  --region=us-east1
```

**If the service name is different**, replace `ragquery` with the actual service name from Step 1.

**If the region is different** (us-east4, etc.), replace `us-east1` with your actual region.

#### Step 3: Verify It Worked

```bash
gcloud run services get-iam-policy ragquery --region=us-east1
```

You should see `allUsers` with role `roles/run.invoker`.

### Part 2: Deploy Updated Code (OPTIONAL - Already Fixed)

The code already has bulletproof OPTIONS handling. Just deploy:

```bash
cd functions
npm run build
firebase deploy --only functions:ragQuery
```

### Test After Both Fixes

After running the gcloud command and deploying, test in browser console:

```javascript
fetch('https://ragquery-fzjr3wuqta-ue.a.run.app/', {
  method: 'OPTIONS',
  headers: {
    'Origin': 'http://localhost:5174',
    'Access-Control-Request-Method': 'POST',
    'Access-Control-Request-Headers': 'Content-Type'
  }
})
.then(res => {
  console.log('✅ Status:', res.status); // Should be 204
  console.log('✅ CORS Headers:', {
    allowOrigin: res.headers.get('Access-Control-Allow-Origin'),
    allowCredentials: res.headers.get('Access-Control-Allow-Credentials'),
    allowMethods: res.headers.get('Access-Control-Allow-Methods'),
  });
})
.catch(err => console.error('❌ Error:', err));
```

If you see a `204` status with CORS headers, **Part 1 is fixed**. If not, the service name or region is wrong - check Step 1 again.

