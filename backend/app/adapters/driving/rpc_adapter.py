import asyncio
import logging
from xmlrpc.server import SimpleXMLRPCDispatcher

from ..driven.database import connect_db

logger = logging.getLogger(__name__)


def run_async(coro):
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        return loop.run_until_complete(coro)
    finally:
        try:
            coro.close()
        except Exception:
            pass
        loop.close()


def get_task_service():
    from ...main import task_service

    return task_service


def list_tasks_rpc():
    async def _list():
        await connect_db()
        tasks = await get_task_service().list_tasks()
        return [
            {"id": t.id, "name": t.name, "type": t.task_type, "status": t.status}
            for t in tasks
        ]

    return run_async(_list())


def run_task_rpc(task_id):
    async def _run():
        await connect_db()
        result = await get_task_service().execute_task(task_id)
        if result is None:
            return {"status": "error", "message": "Task not found"}
        return {"status": "success", "result": result}

    return run_async(_run())


def get_history_rpc(limit=10):
    async def _history():
        await connect_db()
        history = await get_task_service().get_history(take=limit)
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


dispatcher = SimpleXMLRPCDispatcher(allow_none=True, encoding=None)
dispatcher.register_function(list_tasks_rpc, "tasks.list")
dispatcher.register_function(run_task_rpc, "tasks.run")
dispatcher.register_function(get_history_rpc, "tasks.history")


def handle_rpc_request(data):
    logger.debug(f"RPC Request: {data[:200]}...")
    response = dispatcher._marshaled_dispatch(data)
    logger.debug(f"RPC Response: {response[:200]}...")
    return response
