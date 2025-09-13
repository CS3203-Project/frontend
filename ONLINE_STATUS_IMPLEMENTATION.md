# Online Status Implementation

This document outlines the user online/presence detection system implemented in the messaging system.

## Overview

The online status feature tracks which users are currently connected to the application via WebSocket connections and displays this information in the messaging interface.

## Implementation Details

### Backend (Communication Service)

**File:** `/communication/src/modules/messeging/messaging.gateway.ts`

The messaging gateway tracks online users using:
- `connectedUsers: Map<string, string>` - Maps userId to socketId
- `activeConversations: Map<string, string>` - Tracks which conversation each user is viewing

**Key Methods:**
- `handleConnection()` - Tracks when users connect
- `handleDisconnect()` - Removes users when they disconnect and broadcasts offline status
- `handleUserJoin()` - Associates a user ID with their socket connection and broadcasts online status
- `handleGetOnlineUsers()` - Returns list of currently online user IDs

**WebSocket Events:**
- `users:online` - Client requests list of online users
- `users:online-list` - Server responds with array of online user IDs
- `user:online` - Server broadcasts when a user comes online (real-time)
- `user:offline` - Server broadcasts when a user goes offline (real-time)

### Frontend Implementation

#### MessagingProvider (`/frontend/src/components/Messaging/MessagingProvider.tsx`)

**New Features Added:**
- `onlineUsers: string[]` - Array of currently online user IDs
- `checkUserOnlineStatus(userId: string): boolean` - Helper function to check if user is online
- Periodic polling every 30 seconds to refresh online user list
- WebSocket event listener for `users:online-list`

#### MessageThread (`/frontend/src/components/Messaging/MessageThread.tsx`)

**Enhanced Features:**
- Real-time online status for the current conversation partner
- Dynamic status indicator (green/animated for online, gray for offline)
- Automatic status updates when contact comes online/offline

#### ConversationHub (`/frontend/src/Pages/ConversationHub.tsx`)

**New Features:**
- Online status indicators next to each contact in conversation list
- Green dot overlay on avatar when contact is online

#### OnlineStatus Component (`/frontend/src/components/Messaging/OnlineStatus.tsx`)

**Reusable Component Features:**
- Customizable size (sm, md, lg)
- Optional text display
- Automatic status updates
- Consistent styling across the app

## Usage Examples

### Basic Online Status Indicator
```tsx
import { OnlineStatus } from './components/Messaging/OnlineStatus';

<OnlineStatus userId="user123" />
```

### With Text and Custom Size
```tsx
<OnlineStatus 
  userId="user123" 
  showText={true} 
  size="lg" 
  className="my-custom-class" 
/>
```

### Check Status Programmatically
```tsx
import { useMessaging } from './components/Messaging/MessagingProvider';

const { checkUserOnlineStatus } = useMessaging();
const isOnline = checkUserOnlineStatus('user123');
```

## WebSocket Events

### Client → Server (WebSocket)
- `users:online` - Request current online users list (WebSocket event, not HTTP)

### Server → Client (WebSocket)  
- `users:online-list` - Array of online user IDs (response to request)
- `user:online` - Real-time broadcast when a user comes online
- `user:offline` - Real-time broadcast when a user goes offline

**Note**: All communication uses WebSocket events, not traditional HTTP REST API calls.

## Technical Details

### Update Frequency & Mechanism
- **Real-time updates** via WebSocket events when users connect/disconnect (instant)
- **Initial sync** via WebSocket request when connection is established  
- **No HTTP polling** - all communication uses WebSocket events
- **Automatic UI updates** when online status changes (no manual refresh needed)

### Performance Considerations
- Minimal overhead: only sends user IDs (not full user objects)
- Efficient lookup using JavaScript Set/Map operations
- Batched updates to prevent excessive re-renders

### Reliability
- Handles WebSocket disconnections gracefully
- Falls back to periodic polling if real-time updates fail
- No data persistence required (memory-only tracking)

## Future Enhancements

Possible improvements that could be added:

1. **Last Seen Timestamps** - Track when users were last online
2. **Away/Busy Status** - More granular presence states
3. **User Activity Indicators** - Show typing indicators, last activity
4. **Privacy Controls** - Allow users to hide their online status
5. **Mobile Push Integration** - Different status for mobile vs web clients

## Dependencies

- Socket.IO for WebSocket connections
- React hooks for state management  
- TypeScript for type safety

## Files Modified

1. `/frontend/src/components/Messaging/MessagingProvider.tsx`
2. `/frontend/src/components/Messaging/MessageThread.tsx`
3. `/frontend/src/Pages/ConversationHub.tsx`
4. `/frontend/src/components/Messaging/OnlineStatus.tsx` (new file)

## Testing & Debugging

### OnlineStatusDebug Component

A debug component is available to help verify real-time functionality:

```tsx
import { OnlineStatusDebug } from './components/Messaging/OnlineStatusDebug';

// Add anywhere in your app to see real-time online status updates
<OnlineStatusDebug />
```

### Manual Testing Steps

To test the real-time online status feature:

1. **Open multiple browser tabs/windows** with different user accounts
2. **Watch the debug component** - you should see users appear/disappear without refreshing
3. **Start conversations** between users and observe status in terminal header
4. **Close one tab** and watch status change to offline immediately (or within 5 seconds)
5. **Terminal header** should show ONLINE/OFFLINE for conversation partner in real-time

### Expected Behavior

- ✅ **Instant updates** when someone connects (via `user:online` WebSocket event)
- ✅ **Instant updates** when someone disconnects (via `user:offline` WebSocket event)  
- ✅ **Pure WebSocket communication** - no HTTP REST API calls
- ✅ **No page refresh required** - status changes automatically
- ✅ **Visual feedback** - green animated dots for online, gray static for offline

### Communication Flow

```
User Connects:
Browser → WebSocket → Server → Broadcast `user:online` → All Clients → UI Updates

User Disconnects:  
Browser Closes → Server Detects → Broadcast `user:offline` → All Clients → UI Updates
```
