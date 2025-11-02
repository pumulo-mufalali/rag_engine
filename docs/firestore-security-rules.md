# Firestore Security Rules

This document provides Firestore security rules for the iStock application. Copy and paste these rules into your Firebase Console under Firestore Database > Rules.

## Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper function to check if user owns the document
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // Users collection - users can read/write their own profile
    match /users/{userId} {
      allow read: if isOwner(userId);
      allow write: if isOwner(userId);
    }
    
    // Chats collection - users can read/write their own chats
    match /chats/{chatId} {
      allow read, write: if isAuthenticated() && resource.data.userId == request.auth.uid;
      allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
    }
    
    // Feed optimizations collection - users can read/write their own optimizations
    match /feedOptimizations/{feedId} {
      allow read, write: if isAuthenticated() && resource.data.userId == request.auth.uid;
      allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
    }
    
    // Ingredients collection - users can read/write their own ingredients
    match /ingredients/{ingredientId} {
      allow read, write: if isAuthenticated() && resource.data.userId == request.auth.uid;
      allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
    }
    
    // Deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## How to Apply These Rules

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Firestore Database** in the left sidebar
4. Click on the **Rules** tab
5. Paste the rules above
6. Click **Publish**

## Testing Rules

You can test your rules using the Rules Playground in Firebase Console:
1. Click on **Rules** tab
2. Click **Rules Playground**
3. Test different scenarios (authenticated/unauthenticated users, different user IDs)

## Important Notes

- **Users collection**: Users can only access their own profile
- **Chats collection**: Users can only access chats where `userId` matches their auth ID
- **Feed Optimizations**: Users can only access their own feed optimizations
- **Ingredients**: Users can only access their own ingredients
- All writes require authentication
- All documents must include a `userId` field that matches the authenticated user's ID

## Rules Explanation

### `isAuthenticated()`
Checks if the user is logged in via Firebase Auth.

### `isOwner(userId)`
Checks if the current user's ID matches the document owner's ID.

### Collection-Specific Rules

Each collection uses similar patterns:
- **Read**: User must be authenticated AND document's `userId` must match user's ID
- **Write**: User must be authenticated AND document's `userId` must match user's ID
- **Create**: New documents must have `userId` matching authenticated user's ID

## Security Best Practices

1. **Always validate userId on create**: Prevents users from creating documents with someone else's userId
2. **Use resource.data for existing documents**: Validates ownership before allowing updates/deletes
3. **Use request.resource.data for new documents**: Validates userId on creation
4. **Principle of least privilege**: Users can only access their own data

## Troubleshooting

If you're getting permission denied errors:

1. Check that the user is authenticated (Firebase Auth)
2. Verify that documents include a `userId` field matching the user's auth ID
3. Check that security rules are published
4. Review Firebase Console logs for specific error messages

