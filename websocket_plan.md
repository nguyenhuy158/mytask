# WebSocket Implementation Plan for TaskHub

This plan outlines the steps to integrate real-time updates using WebSockets in the TaskHub application.

## 1. Backend Integration (FastAPI)

### Connection Management
Add a `ConnectionManager` to `backend/app/main.py` to handle multiple clients.
- `connect(websocket: WebSocket)`: Accept connection and track.
- `disconnect(websocket: WebSocket)`: Remove from tracking.
- `broadcast(message: dict)`: Send JSON data to all connected clients.

### WebSocket Endpoint
Create a new endpoint:
- `GET /ws`: Handles the initial handshake and maintains the connection.

### Broadcasting Events
Update the following logic to notify clients:
- **Task Completion:** When a manual or scheduled task completes, broadcast the result and updated history.
- **System Events:** (Optional) Broadcast status changes or new environments added.

## 2. Frontend Integration (React)

### WebSocket Connection
Update `frontend/src/App.tsx` to include WebSocket logic:
- Connect to `ws://task.local/api/ws` (or relative path through Nginx).
- Listen for messages of type `TASK_COMPLETED` or `HISTORY_UPDATED`.
- Update state variables `results` and `history` automatically when a message arrives.

### Real-time UI Updates
- Remove the manual `setTimeout(fetchHistory, 1000)` calls.
- Show a toast notification when a background task completes.

## 3. Infrastructure (Nginx)

Update `nginx.conf` to allow WebSocket "Upgrade" for the backend path.

```nginx
location /api {
    rewrite ^/api/(.*) /$1 break;
    proxy_pass http://backend:8000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "Upgrade";
    proxy_set_header Host $host;
}
```

## 4. Verification Steps
1. Start the services using Docker Compose.
2. Open two browser tabs.
3. Run a task in one tab.
4. Verify that the result appears instantly in both tabs without manual refresh.
