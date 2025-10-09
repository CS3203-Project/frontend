# 🕐 Sri Lanka Timezone Debug Test

## Quick Test Instructions

1. **Open Browser Console** - Press F12 and go to Console tab

2. **Send a New Message** - Type and send any message in the chat

3. **Check Console Output** - Look for debug logs showing timezone conversion

## Expected Debug Output

You should see logs like:
```
🇱🇰 [MessageThread] Sri Lanka Timezone Info:
   Browser Timezone: Asia/Colombo (or your local timezone)
   Current UTC Time: 2025-10-06T08:30:00.000Z
   Current Sri Lanka Time: 10/6/2025, 2:00:00 PM
   Test Conversion: 2025-10-06T08:30:00.000Z → 14:00

🌍 [MessageThread] Sri Lanka Time Conversion Debug:
   Raw Message Timestamp: 2025-10-06T08:30:00.000Z
   Parsed UTC Date: 2025-10-06T08:30:00.000Z
   UTC Hours:Minutes: 8:30
   Sri Lanka Full Time: 10/6/2025, 2:00:00 PM
   Formatted Display: 14:00
   Expected: UTC+5:30 (Add 5 hours 30 minutes to UTC)

🧮 Manual Calculation: 8:30 UTC → 14:00 Sri Lanka
```

## Verification Steps

1. **UTC Time**: If server shows 08:30 UTC
2. **Sri Lanka Time**: Should display 14:00 (2:00 PM)
3. **Calculation**: 08:30 + 5:30 = 14:00 ✅

## If Time Still Wrong

If you still see 5:30 hours behind:
- The issue might be in the server timestamp format
- Or the message data structure
- Enable debug mode and check console logs

## Current Settings

- **Forced Timezone**: Asia/Colombo (UTC+5:30)
- **Debug Mode**: ENABLED
- **Format**: 24-hour (14:00 instead of 2:00 PM)
- **Auto-detection**: DISABLED (using forced timezone)

---
*Debug mode is currently enabled. Remember to disable it for production!*