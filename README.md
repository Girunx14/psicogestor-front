# Gestor Psicólogo - Frontend

Esta es la aplicación web (frontend) para el sistema de gestión de consultas y pacientes de psicología.

## Tecnologías que usamos

Empezamos este proyecto con [Vite](https://vitejs.dev/) y nos armamos de un buen stack moderno para que el proyecto vuele:

- **Framework principal:** [React 19](https://react.dev/)
- **Lenguaje:** [TypeScript](https://www.typescriptlang.org/)
- **Estilos:** [Tailwind CSS](https://tailwindcss.com/)
- **Rutas:** [React Router v7](https://reactrouter.com/)
- **Estado Global:** [Zustand](https://zustand-demo.pmnd.rs/)
- **Datos y Caché:** [TanStack React Query](https://tanstack.com/query/latest)
- **Formularios:** [React Hook Form](https://react-hook-form.com/) junto con [Zod](https://zod.dev/) para validar
- **Gráficos:** [Recharts](https://recharts.org/)
- **Iconos:** [Lucide React](https://lucide.dev/)
- **Peticiones HTTP:** [Axios](https://axios-http.com/)

## Lo que necesitas para echarlo a andar

Antes de meter las manos, asegúrate de tener instalado en tu compu:
- [Node.js](https://nodejs.org/) (recomendable la versión 18 en adelante)
- Tu gestor de paquetes favorito (usualmente ya viene con `npm`)

## Así lo configuras rápidamente

1. Asegúrate de estar parado dentro de la carpeta del proyecto (`gestor-psicologo-front`).
2. Dale una pasada con npm para descargar todo lo necesario:

```bash
npm install
```

3. Revisa o crea el archivo `.env` en la raíz. Ahí es donde le decimos al frontend en dónde buscar a tu API (backend):

```env
VITE_API_URL=http://localhost:8000
```
*(Si tu backend vive en otro puerto o dirección, nomás cámbiasela ahí).*

## Para correrlo y ver los cambios en vivo

Para levantar todo el entorno local y programar a gusto:

```bash
npm run dev
```

La consola te soltará una dirección (normalmente algo como `http://localhost:5173`). Ábrela en el navegador y con eso ya estarás viendo la app. Cualquier cosa que modifiques en el código se actualizará sola frente a ti.

## Para construir la versión final (Producción)

Cuando ya tengas todo listo y lo quieras subir a algún dominio, corre:

```bash
npm run build
```

Esto va a agarrar todo el código, lo comprimirá y te dejará lista una carpeta `dist`. Esos archivitos son los que subes al servidor de tu preferencia (como Vercel, Netlify o tu propio host).
