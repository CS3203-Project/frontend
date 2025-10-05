# Backend API Update Required

## Issue Identified
The messaging pagination was loading **oldest messages first** instead of **newest messages first**.

## Frontend Changes Made ✅
1. Updated API call to include `order=desc` parameter
2. Modified pagination logic to handle newest-first loading
3. Fixed loadMoreMessages to prepend older messages correctly

## Backend Changes Needed 🔧

The backend API at `http://localhost:3001/messaging/messages` needs to support:

```
GET /messages?conversationId={id}&page=1&limit=20&order=desc
```

### Expected Behavior:
- **Without `order` param OR `order=asc`**: Return oldest messages first (current behavior)
- **With `order=desc`**: Return newest messages first (NEW requirement)

### Implementation Example (if using SQL):
```sql
-- For order=desc (newest first)
SELECT * FROM messages 
WHERE conversation_id = ? 
ORDER BY created_at DESC 
LIMIT ? OFFSET ?

-- For order=asc (oldest first) - current default
SELECT * FROM messages 
WHERE conversation_id = ? 
ORDER BY created_at ASC 
LIMIT ? OFFSET ?
```

### Frontend Expectation:
1. **Page 1 with order=desc**: Returns the 20 most recent messages
2. **Page 2 with order=desc**: Returns the next 20 older messages
3. **And so on...**

This ensures users see the **latest conversation** immediately when opening a chat, just like WhatsApp/Telegram! 🎯