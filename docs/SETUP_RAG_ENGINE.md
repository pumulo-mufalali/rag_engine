# 🚀 RAG Engine Setup - Complete Guide

This guide provides step-by-step instructions to integrate Google Cloud RAG Engine with your Firebase app.

## 📋 Overview

**Architecture:**
```
React App (Firebase Hosting)
    ↓ HTTPS (Firebase Auth Token)
Cloud Function (Firebase Functions)
    ↓ REST API (Service Account)
RAG Engine (Google Cloud Vertex AI)
```

## ⚡ Quick Start (5 Steps)

### Step 1: Create RAG Engine in Google Cloud

1. **Go to Vertex AI Console**
   - Navigate: https://console.cloud.google.com/vertex-ai
   - Select your Firebase project

2. **Enable Vertex AI API**
   ```bash
   gcloud services enable aiplatform.googleapis.com
   ```

3. **Create RAG Engine**
   - Go to **Vertex AI** → **RAG** → **Create RAG Engine**
   - Name: `istock-rag-engine`
   - Location: `us-central1` (or your preferred region)
   - Upload your knowledge base (livestock health documents)
   - **Note your RAG Engine ID** after creation

### Step 2: Set Up Firebase Functions

```bash
# Navigate to functions directory
cd functions

# Install dependencies
npm install

# Build TypeScript
npm run build

# Deploy function
firebase deploy --only functions:askRag
```

### Step 3: Configure Environment Variables

**In Firebase Console:**
1. Go to **Functions** → **Configuration** → **Environment variables**
2. Add:
   - `RAG_ENGINE_PROJECT_ID` = Your Google Cloud project ID
   - `RAG_ENGINE_LOCATION` = `us-central1` (or your region)
   - `RAG_ENGINE_ID` = Your RAG Engine ID from Step 1

**Or via CLI:**
```bash
firebase functions:config:set \
  rag.engine_project_id="YOUR_PROJECT_ID" \
  rag.engine_location="us-central1" \
  rag.engine_id="YOUR_RAG_ENGINE_ID"
```

**In Frontend `.env`:**
```env
VITE_RAG_API_URL=https://us-central1-YOUR_PROJECT.cloudfunctions.net/askRag
```

### Step 4: Grant Permissions

```bash
# Grant Vertex AI User role to default Cloud Functions service account
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:YOUR_PROJECT_ID@appspot.gserviceaccount.com" \
  --role="roles/aiplatform.user"
```

### Step 5: Test It!

1. Start your app: `pnpm dev`
2. Log in
3. Ask a question in the chatbot
4. Check browser console for API calls
5. Check function logs: `firebase functions:log`

---

## 📚 Detailed Instructions

For comprehensive setup instructions, see:
- **[RAG_INTEGRATION_GUIDE.md](./docs/RAG_INTEGRATION_GUIDE.md)** - Complete integration guide
- **[RAG_QUICK_START.md](./docs/RAG_QUICK_START.md)** - Quick reference

---

## 🔍 Verification

After setup, verify:

1. **RAG Engine exists**: Check Vertex AI Console
2. **Function deployed**: `firebase functions:list`
3. **Environment vars set**: `firebase functions:config:get`
4. **Permissions granted**: Check IAM in Google Cloud Console
5. **Frontend URL set**: Check `.env` file

---

## 🐛 Troubleshooting

| Error | Solution |
|-------|----------|
| "RAG Engine not found" | Check `RAG_ENGINE_ID` env var |
| "Permission denied" | Grant `roles/aiplatform.user` to service account |
| "Authentication failed" | Ensure user is signed in |
| "Network error" | Check function URL in `.env` |
| "CORS error" | Add your domain to function CORS config |

---

## 📊 Testing

### Test Locally
```bash
# Start Firebase emulators
firebase emulators:start

# Test function locally
curl -X POST http://localhost:5001/YOUR_PROJECT/us-central1/askRag \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"data":{"query":"test question"}}'
```

### Test Production
1. Deploy function
2. Test via frontend
3. Check logs: `firebase functions:log --only askRag`

---

## 🔐 Security Checklist

- [x] Function requires authentication
- [x] Service account has minimal permissions (`aiplatform.user`)
- [x] CORS configured properly
- [x] Input validation in function
- [x] Error handling doesn't expose sensitive info

---

**Ready to go!** 🎉 Your RAG Engine is now integrated with your Firebase app.

