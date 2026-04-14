import asyncio
import sys
import os

# Put the backend API path into sys path
sys.path.insert(0, "/Users/marcoscardenas/Documents/GitHub/psicologo-api")

from app.db.database import async_session_maker
from app.models.paciente import Paciente
from sqlalchemy import select

async def main():
    async with async_session_maker() as session:
        result = await session.execute(select(Paciente).where(Paciente.numero_control == "22300608"))
        paciente = result.scalar_one_or_none()
        if paciente:
            print(f"ENCONTRADO: {paciente.nombres} {paciente.apellido_paterno}")
            print(f"Num Control: '{paciente.numero_control}'")
            print(f"Fecha Nacimiento: '{paciente.fecha_nacimiento}' (Tipo: {type(paciente.fecha_nacimiento)})")
        else:
            print("NO ENCONTRADO en la DB. Verificando todos los pacientes...")
            result = await session.execute(select(Paciente))
            todos = result.scalars().all()
            for p in todos:
                print(f" - Control: {p.numero_control} | Nacimiento: {p.fecha_nacimiento}")

asyncio.run(main())
