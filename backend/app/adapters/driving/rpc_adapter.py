import asyncio
import logging
from xmlrpc.server import SimpleXMLRPCDispatcher

from ...core.services.task_service import TaskService
from ..driven.database import connect_db
from ..driven.http_adapter import HttpAdapter
from ..driven.odoo_adapter import OdooAdapter
from ..driven.prisma_adapter import PrismaAdapter
from ..driven.s3_adapter import S3Adapter
from .websocket_adapter import WebSocketAdapter

logger = logging.getLogger(__name__)
prisma_adapter = PrismaAdapter()
http_adapter = HttpAdapter()
odoo_adapter = OdooAdapter()
s3_adapter = S3Adapter()
ws_adapter = WebSocketAdapter()
task_service = TaskService(
    repository=prisma_adapter,
    external_api=http_adapter,
    notification=http_adapter,
    broadcast=ws_adapter,
    odoo_port=odoo_adapter,
    storage=s3_adapter,
)
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


dispatcher.register_function(list_tasks_rpc, "tasks.list")
dispatcher.register_function(run_task_rpc, "tasks.run")
dispatcher.register_function(get_history_rpc, "tasks.history")


def handle_rpc_request(data):
    logger.debug(f"RPC Request: {data[:200]}...")
    response = dispatcher._marshaled_dispatch(data)
    logger.debug(f"RPC Response: {response[:200]}...")
    return response
