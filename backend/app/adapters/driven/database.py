from prisma import Prisma

db = Prisma()


async def connect_db():
    if not db.is_connected():
        await db.connect()


async def disconnect_db():
    if db.is_connected():
        await db.disconnect()


async def get_db():
    await connect_db()
    return db
