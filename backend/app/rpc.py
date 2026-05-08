import asyncio
import logging
from xmlrpc.server import SimpleXMLRPCDispatcher

from .adapters.driven.http_adapter import HttpAdapter
from .adapters.driven.odoo_adapter import OdooAdapter
from .adapters.driven.prisma_adapter import PrismaAdapter
from .adapters.driving.websocket_adapter import WebSocketAdapter
from .core.services.task_service import TaskService
from .database import connect_db

logger = logging.getLogger(__name__)

# Initialize dependencies for RPC (Standalone for now)
prisma_adapter = PrismaAdapter()
http_adapter = HttpAdapter()
odoo_adapter = OdooAdapter()
ws_adapter = (
    WebSocketAdapter()
)  # Won't actually broadcast to active WS if used this way, but fulfills interface

task_service = TaskService(
    repository=prisma_adapter,
    external_api=http_adapter,
    notification=http_adapter,
    broadcast=ws_adapter,
    odoo_port=odoo_adapter,
)

# Dispatcher for XML-RPC
dispatcher = SimpleXMLRPCDispatcher(allow_none=True, encoding=None)


def run_async(coro):
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        return loop.run_until_complete(coro)
    finally:
        loop.close()


def list_tasks_rpc():
    async def _list():
        await connect_db()
        tasks = await task_service.list_tasks()
        return [
            {"id": t.id, "name": t.name, "type": t.task_type, "status": t.status}
            for t in tasks
        ]

    return run_async(_list())


def run_task_rpc(task_id):
    async def _run():
        await connect_db()
        result = await task_service.execute_task(task_id)
        if result is None:
            return {"status": "error", "message": "Task not found"}
        return {"status": "success", "result": result}

    return run_async(_run())


def get_history_rpc(limit=10):
    async def _history():
        await connect_db()
        history = await task_service.get_history(take=limit)
        return [
            {
                "id": h.id,
                "task_name": h.task_name,
                "result": h.result,
                "timestamp": h.timestamp.isoformat(),
            }
            for h in history
        ]

    return run_async(_history())


# Register functions
dispatcher.register_function(list_tasks_rpc, "tasks.list")
dispatcher.register_function(run_task_rpc, "tasks.run")
dispatcher.register_function(get_history_rpc, "tasks.history")


def handle_rpc_request(data):
    return dispatcher._marshaled_dispatch(data)
