# Cloud Run IAM Setup - Make Function Publicly Accessible

## Problem
Your Firebase Function (Cloud Run service) requires authentication, which blocks OPTIONS preflight requests from browsers. The preflight request fails with CORS errors because it never reaches your code.

## Solution: Allow Unauthenticated Invocations

Run the following gcloud command to make your Cloud Run service publicly accessible:

### Command

```bash
gcloud run services add-iam-policy-binding ragquery \
  --member="allUsers" \
  --role="roles/run.invoker" \
  --region=us-east1
```

**Note:** Replace `us-east1` with your actual region if different. Based on your URL `ragquery-fzjr3wuqta-ue.a.run.app`, the region is likely `us-east1`.

### Alternative: Using Firebase CLI

If you prefer using Firebase CLI:

```bash
# First, find your project ID
firebase projects:list

# Then allow unauthenticated access
gcloud run services add-iam-policy-binding ragquery \
  --member="allUsers" \
  --role="roles/run.invoker" \
  --region=us-east1 \
  --project=YOUR_PROJECT_ID
```

### Verify the Change

After running the command, verify that the service is publicly accessible:

```bash
gcloud run services get-iam-policy ragquery --region=us-east1
```

You should see `allUsers` listed with the `roles/run.invoker` role.

### For Multiple Functions

If you have multiple functions (e.g., `ragQuery` and `root`), you need to allow access to each:

```bash
# For ragQuery function
gcloud run services add-iam-policy-binding ragquery \
  --member="allUsers" \
  --role="roles/run.invoker" \
  --region=us-east1

# For root function (if you created it)
gcloud run services add-iam-policy-binding root \
  --member="allUsers" \
  --role="roles/run.invoker" \
  --region=us-east1
```

## Finding Your Function Names

To find all your deployed Cloud Run services:

```bash
gcloud run services list --region=us-east1
```

## Security Note

⚠️ **Security Warning**: Making your function publicly accessible means anyone can call it. If your function handles sensitive operations:

1. **Add authentication** in your code (verify Firebase Auth tokens)
2. **Rate limiting** to prevent abuse
3. **Input validation** on all requests
4. Consider using **Firebase App Check** for additional protection

## Test After Setup

After running the IAM command, test from your browser console:

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
  console.log('Status:', res.status);
  console.log('Headers:', [...res.headers.entries()]);
})
.catch(err => console.error('Error:', err));
```

You should see a `204` response with proper CORS headers.

