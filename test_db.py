import asyncio
import sys
sys.path.insert(0, "/Users/mcardenas/Documents/GitHub/psicologo-api")
from app.db.database import async_session_maker
from app.models.catalogo_carrera import Carrera
from app.models.catalogo_religion import Religion
from app.models.usuario import Usuario
from sqlalchemy import select

async def test():
    async with async_session_maker() as session:
        c = await session.execute(select(Carrera))
        print("Carreras:", c.scalars().all())
        r = await session.execute(select(Religion))
        print("Religiones:", r.scalars().all())
        u = await session.execute(select(Usuario))
        print("Usuarios:", u.scalars().all())

asyncio.run(test())
