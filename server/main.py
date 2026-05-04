import uvicorn
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import json
import asyncio

from database import init_db
from routers import auth, instances, computation, results, algorithm

app = FastAPI(title="山地光伏电站设计优化系统", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(instances.router)
app.include_router(computation.router)
app.include_router(results.router)
app.include_router(algorithm.router)


@app.on_event("startup")
def on_startup():
    init_db()


@app.get("/api/health")
def health():
    return {"status": "ok", "service": "mountain-pv-backend"}


# WebSocket连接管理
class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, client_id: str):
        await websocket.accept()
        self.active_connections[client_id] = websocket
        print(f"WebSocket client connected: {client_id}")

    def disconnect(self, client_id: str):
        if client_id in self.active_connections:
            del self.active_connections[client_id]
            print(f"WebSocket client disconnected: {client_id}")

    async def send_progress(self, client_id: str, progress: int, stage: str, stage_progress: int):
        if client_id in self.active_connections:
            await self.active_connections[client_id].send_json({
                "type": "progress",
                "progress": progress,
                "stage": stage,
                "stage_progress": stage_progress
            })

    async def send_complete(self, client_id: str, result: dict):
        if client_id in self.active_connections:
            await self.active_connections[client_id].send_json({
                "type": "complete",
                "result": result
            })

    async def send_error(self, client_id: str, error: str):
        if client_id in self.active_connections:
            await self.active_connections[client_id].send_json({
                "type": "error",
                "error": error
            })


manager = ConnectionManager()


@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await manager.connect(websocket, client_id)
    try:
        while True:
            # 保持连接，等待客户端消息
            data = await websocket.receive_text()
            try:
                message = json.loads(data)
                # 处理客户端消息
                if message.get("type") == "ping":
                    await websocket.send_json({"type": "pong"})
                elif message.get("type") == "status":
                    await websocket.send_json({
                        "type": "status",
                        "connected": True,
                        "client_id": client_id
                    })
            except json.JSONDecodeError:
                await websocket.send_json({"type": "error", "error": "Invalid JSON"})
    except WebSocketDisconnect:
        manager.disconnect(client_id)
    except Exception as e:
        print(f"WebSocket error for {client_id}: {e}")
        manager.disconnect(client_id)


@app.post("/api/ws/send-progress/{client_id}")
async def send_progress_to_client(client_id: str, progress: int, stage: str, stage_progress: int):
    """供其他API调用，向指定客户端发送进度更新"""
    await manager.send_progress(client_id, progress, stage, stage_progress)
    return {"status": "sent"}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8004, reload=True)
