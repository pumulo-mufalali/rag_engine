# RAG Engine Quick Start Guide

## 🚀 Fast Setup (5 Steps)

### 1. Set Up RAG Engine in Google Cloud Console

1. Go to [Vertex AI Console](https://console.cloud.google.com/vertex-ai)
2. Navigate to **RAG** section
3. Create new RAG Engine:
   - Name: `istock-rag-engine`
   - Location: `us-central1` (or your preferred region)
   - Upload knowledge base (livestock health documents)
4. Note your **RAG Engine ID** (visible after creation)

### 2. Configure Environment Variables

```bash
# In Firebase Console → Functions → Configuration
# Or via CLI:
firebase functions:config:set \
  rag.engine_project_id="YOUR_PROJECT_ID" \
  rag.engine_location="us-central1" \
  rag.engine_id="YOUR_RAG_ENGINE_ID"
```

### 3. Set Up Cloud Functions

```bash
cd functions
npm install
npm run build
firebase deploy --only functions:askRag
```

### 4. Update Frontend Environment

Add to `apps/web/.env`:

```env
VITE_RAG_API_URL=https://us-central1-YOUR_PROJECT.cloudfunctions.net/askRag
```

### 5. Test It!

1. Start your app: `pnpm dev`
2. Log in
3. Ask a question in the chatbot
4. You should get real RAG responses!

---

## 🔍 Verification Checklist

- [ ] RAG Engine created in Vertex AI
- [ ] Cloud Function deployed successfully
- [ ] Environment variables set
- [ ] `VITE_RAG_API_URL` in frontend `.env`
- [ ] Service account has `roles/aiplatform.user` permission
- [ ] Function logs show successful calls

---

## 🐛 Quick Troubleshooting

**"RAG Engine not found"**
→ Check `RAG_ENGINE_ID` environment variable

**"Permission denied"**
→ Grant `roles/aiplatform.user` to function service account

**"Authentication failed"**
→ Ensure user is signed in, check Firebase Auth token

---

See [RAG_INTEGRATION_GUIDE.md](./RAG_INTEGRATION_GUIDE.md) for detailed instructions.

