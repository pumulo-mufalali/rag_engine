# Exact gcloud Command to Fix CORS

## Problem
Your Cloud Run service `ragquery` requires authentication, which blocks OPTIONS preflight requests before they reach your code.

## Solution: Make Service Public

Run this EXACT command in your terminal:

```bash
gcloud run services add-iam-policy-binding ragquery \
  --member="allUsers" \
  --role="roles/run.invoker" \
  --region=us-east1
```

## Verify the Command Worked

After running the command, verify it succeeded:

```bash
gcloud run services get-iam-policy ragquery --region=us-east1
```

You should see `allUsers` with role `roles/run.invoker`.

## If Service Name is Different

If the service name isn't exactly `ragquery`, find it first:

```bash
gcloud run services list --region=us-east1
```

Then replace `ragquery` in the command above with the actual service name.

## If Region is Different

If your region is not `us-east1`, replace it in the command above. Common regions:
- `us-east1` (default)
- `us-east4`
- `us-central1`
- `europe-west1`

