# 📋 Documentación Técnica Completa — Gestor Psicólogo Front

## 1. Descripción General

### Propósito del Proyecto
Sistema de gestión psicológica para el **Instituto Tecnológico de Villahermosa (ITVH)**, diseñado para administrar el programa de psicoterapia a la población estudiantil. Permite gestionar pacientes, citas, sesiones, horarios, genogramas y resúmenes clínicos con IA.

### Tipo de Aplicación
**SPA (Single Page Application)** construida con React 19 + Vite 8. No utiliza SSR ni static generation; es una aplicación web pura que consume una API REST externa.

### Stack Tecnológico

| Capa | Tecnología | Versión |
|---|---|---|
| **Framework** | React | 19.2.4 |
| **Bundler** | Vite | 8.0.1 |
| **Lenguaje** | TypeScript | 5.9.3 |
| **Estilos** | Tailwind CSS + CSS personalizado | 3.4.19 |
| **Estado global** | Zustand | 5.0.12 |
| **Server state** | TanStack Query (React Query) | 5.91.2 |
| **Routing** | React Router DOM | 7.13.1 |
| **HTTP client** | Axios | 1.13.6 |
| **Validación Forms** | React Hook Form + Zod + Hookform Resolvers | 7.71.2 / 4.3.6 / 5.2.2 |
| **UI Icons** | Lucide React | 0.577.0 |
| **Gráficos** | Recharts | 3.8.0 |
| **Diagrama/Grafo** | @xyflow/react (React Flow) | 12.10.2 |
| **Markdown rendering** | react-markdown | 10.1.0 |
| **CSS Utils** | clsx | 2.1.1 |
| **Fonts** | Google Fonts (Inter, Outfit) | — |

---

## 2. Arquitectura del Frontend

### Estructura de Carpetas

```
src/
├── api/                    # Clientes HTTP/API modules
│   ├── axiosClient.ts      # Instancia Axios con interceptores
│   ├── authApi.ts
│   ├── pacientesApi.ts
│   ├── citasApi.ts
│   ├── horariosApi.ts
│   ├── notasApi.ts
│   ├── usuariosApi.ts
│   ├── catalogosApi.ts
│   ├── estadisticasApi.ts
│   ├── resumenesApi.ts
│   └── genogramaApi.ts     # ⚠️ No usa axiosClient (excepción notable)
│
├── components/
│   ├── genograma/          # Componentes del genograma familiar
│   │   ├── GenogramaEditor.tsx
│   │   ├── CustomNode.tsx
│   │   └── CustomEdge.tsx
│   ├── layout/             # Layout wrappers
│   │   ├── AppLayout.tsx   # Layout principal (sidebar + outlet)
│   │   ├── Sidebar.tsx     # Navegación lateral
│   │   ├── Topbar.tsx      # Header por página
│   │   └── PatientLayout.tsx # Layout exclusivo portal paciente
│   └── ui/                 # Componentes UI atómicos/reutilizables
│       ├── Badge.tsx
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── DataTable.tsx
│       ├── EmptyState.tsx
│       ├── Input.tsx
│       ├── Modal.tsx
│       ├── SearchInput.tsx
│       ├── Select.tsx
│       ├── StatCard.tsx
│       ├── Textarea.tsx
│       └── TimePicker.tsx
│
├── features/               # Componentes de negocio encapsulados
│   ├── pacientes/
│   │   └── PacienteFormFields.tsx   # Form reutilizable de paciente
│   └── sesiones/
│       └── VoiceDictation.tsx       # Dictado por voz (Web Speech API)
│
├── hooks/                  # Custom hooks (TanStack Query wrappers)
│   ├── useAuth.ts
│   ├── usePacientes.ts
│   ├── useCitas.ts
│   ├── useHorarios.ts
│   ├── useNotas.ts
│   ├── useUsuarios.ts
│   ├── useCatalogos.ts
│   ├── useEstadisticas.ts
│   ├── useGenograma.ts
│   └── useResumenes.ts
│
├── pages/                  # Componentes de página (route components)
│   ├── Bienvenida/
│   ├── Citas/
│   ├── Dashboard/
│   ├── Estadisticas/
│   ├── Horarios/
│   ├── Login/
│   ├── Pacientes/         # List, Detalle, Nuevo, Editar
│   ├── PortalPaciente/    # Dashboard exclusivo para pacientes
│   ├── Sesiones/
│   └── Usuarios/
│
├── router/
│   ├── index.tsx           # createBrowserRouter principal
│   └── ProtectedRoute.tsx  # HOC de protección de rutas
│
├── store/                  # Zustand stores (estado global)
│   ├── authStore.ts       # Token, usuario, roles, login/logout
│   └── uiStore.ts         # Estado de UI (sidebar abierto/cerrado)
│
├── lib/
│   └── queryClient.ts     # Configuración de React Query
│
├── types/
│   └── index.ts            # Todos los tipos TypeScript del dominio
│
├── App.tsx                 # Root component (providers)
├── main.tsx                # Entry point
└── index.css               # Tailwind + estilos globales + sistema editorial
```

### Patrón Arquitectónico

El proyecto sigue un patrón **Layered + Feature-based**:

- **`api/`** — Capa de infraestructura HTTP. Cada módulo representa un recurso del dominio.
- **`hooks/`** — Capa de lógica de negocio basada en TanStack Query. Cada hook envuelve operaciones CRUD de su recurso correspondiente.
- **`features/`** — Componentes reutilizables que encapsulan lógica de negocio compleja (formularios de paciente, dictado de voz).
- **`pages/`** — Componentes de vista. orquestan hooks y componentes UI. No contienen lógica de negocio compleja.
- **`components/ui/`** — Componentes UI puros, sin dependencia de lógica de negocio.
- **`components/layout/`** — Wrappers de layout que proporcionan estructura visual.

### Flujo de datos entre capas

```
Pages → Hooks (TanStack Query) → API modules → axiosClient → Backend API
         ↓
       Zustand stores (authStore, uiStore) ← App.tsx (hydrate on mount)
```

---

## 3. Componentes

### Layout Components

| Componente | Descripción | Props |
|---|---|---|
| `AppLayout` | Layout principal con sidebar colapsable. Renderiza `<Outlet>` dentro de `<Sidebar>`. | Ninguna |
| `Sidebar` | Navegación lateral. Muestra/oculta items según rol del usuario. Cierra al hacer click en mobile overlay. | Ninguna |
| `Topbar` | Header por página con título, subtítulo y toggle de sidebar. | `title`, `subtitle` |
| `PatientLayout` | Layout minimalista para portal de pacientes. Incluye navbar superior con logout. | Ninguna |

### UI Components (atoms/molecules)

| Componente | Descripción |
|---|---|
| `Badge` | Etiqueta con variants: default, success, warning, danger, info, editorial, accent |
| `Button` | Botón con variants: primary, secondary, outline, danger, ghost. Soporta `isLoading` |
| `Card` | Contenedor visual. Variants: default, editorial |
| `DataTable` | Tabla genérica con columnas configurables, soporte de `onRowClick`, loading state, empty state |
| `EmptyState` | Estado vacío con icono, título, descripción y acción opcional |
| `Input` | Input con label, error y helper text. Wrappea `forwardRef` |
| `Modal` | Modal con portal. Soporta variants default y `ai-header` (gradiente oscuro para IA). Cierra con Escape y click fuera |
| `SearchInput` | Input con icono de búsqueda y debounce de 300ms |
| `Select` | Select con label, error y placeholder. Maneja `null` value de react-hook-form |
| `StatCard` | Tarjeta de estadísticas con icono, label, valor y subtítulo |
| `Textarea` | Textarea con label y error |
| `TimePicker` | Selector de hora personalizado (7:00 - 19:30 en intervalos de 30 min) |

### Feature Components

| Componente | Descripción |
|---|---|
| `PacienteFormFields` | Formulario completo de registro/edición de paciente. Incluye validación Zod, auto-cálculo de edad, secciones: datos personales, académicos, origen, familiares. Usa `Controller` de react-hook-form para selects. |
| `VoiceDictation` | Componente de dictate por voz usando Web Speech API (`SpeechRecognition`). Soporta `onTranscript` para poblar campos. Solo renderiza si el navegador soporta la API. |
| `GenogramaEditor` | Editor visual de genograma familiar usando `@xyflow/react`. Permite añadir nodos de miembros familiares, conectar con relaciones (matrimonio, descendencia, conflicto), editar y guardar. Usa `ReactFlowProvider` wrapper. |
| `CustomNode` | Nodo visual del genograma (rectángulo para hombre, círculo para mujer). Muestra tipo, nombre, edad. Soporta estado "fallecido". |
| `CustomEdge` | Arista visual del genograma con estilos diferenciados por tipo de relación (matrimonio con ticks, conflicto con flecha, distante con dashed line). |

### Comunicación entre componentes

- **Props drilling controlado**: Los componentes de página pasan datos a componentes hijos vía props.
- **TanStack Query**: Los datos del servidor se comparten vía hooks (`usePacientes`, `useCitas`, etc.) sin necesidad de prop drilling.
- **Zustand stores**: Estado global compartido (`authStore` para auth, `uiStore` para UI) accesible desde cualquier componente.
- **react-hook-form**: Los formularios comparten estado vía `useForm`. Los campos de un mismo formulario se comunican internamente.

---

## 4. Manejo de Estado

### Estado Local (useState)

Utilizado para:
- Estado de modales (`modalOpen`, `showDeleteModal`)
- Estado de formularios locales
- Toggle de UI (sidebar, menús)
- Navegación de páginas (pagination)

### Estado Global — Zustand

**`authStore.ts`**
```typescript
{
  token: string | null
  user: User | null
  isAuthenticated: boolean
  login: (token, user) => void   // Persiste en localStorage
  logout: () => void            // Limpia localStorage y estado
  hydrate: () => void           // Restaura sesión desde localStorage (called on App mount)
  isAdmin: () => boolean
  isPsicologo: () => boolean
  hasRole: (role) => boolean
}
```

**`uiStore.ts`**
```typescript
{
  sidebarOpen: boolean
  toggleSidebar: () => void
  closeSidebar: () => void
}
```

### Estado de Server — TanStack Query

Maneja todo el estado de datos remotos:
- **Queries**: GET data con cache automático, `staleTime` configurado
- **Mutations**: POST/PATCH/DELETE con invalidación de queries dependientes

Configuración global en `queryClient.ts`:
```typescript
staleTime: 5 * 60 * 1000  // 5 minutos
retry: 1                  // Un retry en caso de error
refetchOnWindowFocus: false
```

---

## 5. Consumo de APIs

### Cliente HTTP — Axios

**`axiosClient.ts`** configura una instancia Axios con:
- `baseURL`: `VITE_API_URL` (default: `http://localhost:8000/api/v1`)
- `timeout`: 15000ms
- **Request interceptor**: Adjunta `Authorization: Bearer {token}` desde `localStorage`
- **Response interceptor**: Maneja 401 (limpia token y redirige a `/login`) y 429 (rate limit — no hace nada especial, solo rechaza)

### Estructura de módulos API

Cada módulo sigue el mismo patrón:
```typescript
export const resourceApi = {
  getAll: async (params) => { const response = await axiosClient.get('/resource/', { params }); return response.data; },
  getById: async (id) => { ... },
  create: async (data) => { ... },
  update: async (id, data) => { ... },
  delete: async (id) => { ... },
};
```

### Módulos API

| Módulo | Recursos | Archivo |
|---|---|---|
| `authApi` | Login usuario, Login paciente | `authApi.ts` |
| `pacientesApi` | CRUD pacientes, paginación, búsqueda | `pacientesApi.ts` |
| `citasApi` | CRUD citas, mis-citas, urgencia, emergencia | `citasApi.ts` |
| `horariosApi` | CRUD horarios, horarios disponibles para paciente | `horariosApi.ts` |
| `notasApi` | CRUD notas de evolución por paciente | `notasApi.ts` |
| `usuariosApi` | CRUD usuarios del sistema | `usuariosApi.ts` |
| `catalogosApi` | Catálogos globales (carreras, religiones, sexos, semestres) | `catalogosApi.ts` |
| `estadisticasApi` | Estadísticas por paciente | `estadisticasApi.ts` |
| `resumenesApi` | Resumen clínico por paciente, generación IA | `resumenesApi.ts` |
| `genogramaApi` | GET/SAVE genograma por paciente | `genogramaApi.ts` ⚠️ No usa axiosClient |

### Manejo de Errores

- **401**: Interceptado por axiosClient → limpia localStorage → redirige a `/login`
- **429**: Mostrado como mensaje "Demasiados intentos" en el formulario de login
- **Errores de validación de Zod**: Mostrados inline en cada campo del formulario
- **Errores de API**: capturados en `onError` de las mutaciones y mostrados como mensajes de alerta en la UI

### Estructura de Respuestas

El backend retorna respuestas paginadas con esta estructura:
```typescript
interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}
```

---

## 6. Navegación

### Sistema de Rutas

Utiliza `createBrowserRouter` de React Router DOM v7 con una estructura jerárquica de rutas:

```
/login                          → LoginPage (pública)
/portal                         → PatientLayout (protegido, rol: paciente)
  └── /portal                   → DashboardPacientePage
/                               → AppLayout (protegido, rol: psicologo/admin)
  └── /bienvenida               → BienvenidaPage
  └── /dashboard                → DashboardPage
  └── /pacientes                → PacientesListPage
  └── /pacientes/nuevo          → PacienteNuevoPage
  └── /pacientes/:id            → PacienteDetallePage
  └── /pacientes/:id/editar     → PacienteEditarPage
  └── /pacientes/:id/notas/nueva → NuevaSesionPage
  └── /citas                    → CitasPage
  └── /horarios                 → HorariosPage
  └── /estadisticas             → EstadisticasPage
  └── /usuarios                 → UsuariosPage (protegido, rol: administrador)
```

### Protección de Rutas

**`ProtectedRoute.tsx`** es un componente wrapper que:
1. Verifica `isAuthenticated` del `authStore` → si no está autenticado, redirige a `/login`
2. Si se especifica `requiredRole`, verifica con `hasRole()` → si no tiene el rol, redirige a `/bienvenida`
3. Renderiza el children si pasa ambas verificaciones

### Redirecciones por Rol

- **Login automático**: Si el usuario ya está autenticado e intenta acceder a `/login`, se redirige a `/portal` (si es paciente) o `/bienvenida` (si es psicólogo/admin).
- **Portal paciente**: Solo usuarios con `rol.nombre === 'paciente'` pueden acceder al `/portal`.
- **Ruta `/`**: Siempre redirige a `/bienvenida`.

---

## 7. UI/UX y Estilos

### Framework de Estilos

**Tailwind CSS v3** con configuración extendida:
- Palette de colores custom: `primary` (#1B396A), `secondary` (#807E82), `surface` (#EEF2F8)
- Familia tipográfica: `Inter` como font principal, `Outfit` para títulos editorial
- Plugins: Ninguno (sin plugins adicionales)

### Sistema de Diseño Editorial

El proyecto implementa un **sistema de diseño editorial "Clinical Premium"** en `index.css` con clases custom en el layer `components`:

| Clase | Descripción |
|---|---|
| `.card-editorial` | Tarjeta con borde sutil, sombra en hover, transición |
| `.patient-header` | Hero de paciente con línea superior decorativa (gradient dorado) |
| `.patient-avatar` | Avatar circular con gradiente azul oscuro |
| `.note-card` | Tarjeta de nota con hover elevado y transform |
| `.btn-ai-glow` | Botón con efecto glow para acciones de IA |
| `.btn-ai-premium` | Botón premium para resúmenes IA |
| `.btn-action-primary/outline/danger` | Botones de acción editorial |
| `.modal-ai-header` | Header de modal con gradiente oscuro y shimmer animation |
| `.ai-animate-in` | Animaciones de entrada escalonadas para contenido IA |
| `.resumen-markdown` | Estilos custom para renderizado de markdown (listas, headings, blockquotes) |
| `.separator-decorator` | Separador visual con puntos decorativos |
| `.section-title` | Título de sección con línea de gradiente |

### Variables CSS Custom

- `--primary`: #1B396A (azul institucional)
- `--secondary`: #807E82 (gris)
- `--surface`: #EEF2F8 (fondo claro)
- También disponibles como tokens Tailwind: `primary-50` hasta `primary-900`, `secondary-50` hasta `secondary-900`

### Diseño Responsivo

- Mobile-first approach con breakpoints `sm`, `md`, `lg`, `xl`
- Sidebar colapsable: visible en desktop (`lg`), overlay en mobile
- Grids adaptativos: 1 columna mobile → 2/4 columnas desktop
- Topbar con menú hamburguesa en mobile

---

## 8. Problemas Detectados

### 🔴 Problemas de Compatibilidad de Tipos en Resolvers

**Ubicación**: `PacienteFormFields.tsx:55`, `CitasPage.tsx:107`, `HorariosPage.tsx:40`, `NuevaSesionPage.tsx:46`, `DashboardPacientePage.tsx:39`, `LoginPage.tsx:11`

Todos los `useForm` que usan `zodResolver` tienen un **cast `as any` o `as never`** para el resolver:
```typescript
// ❌ Mal - type safety completamente comprometidos
resolver: zodResolver(pacienteSchema) as any

// ❌ También incorrecto
resolver: zodResolver(notaSchema) as never
```

El resolver de `@hookform/resolvers` v5 devuelve tipos incompatibles con React Hook Form v7. La solución correcta sería usar el typing correcto de Zod resolver.

### 🔴 GenogramaAPI no usa axiosClient

**Ubicación**: `src/api/genogramaApi.ts`

El módulo `genogramaApi` usa `axios` directamente en lugar de `axiosClient`:
```typescript
// ❌ Inconsistente con el resto de la app
import axios from 'axios';
const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';
// No adjunta automáticamente el token (tiene su propia función authHeaders())
```

Esto significa que:
1. No tiene el mismo timeout de 15s
2. Maneja headers de auth manualmente
3. Es inconsistente con el patrón del resto de la app

### 🟡 Consistencia de Colors en Código Hardcodeado

**Ubicación**: Múltiples archivos (PacientesListPage, CitasPage, EstadisticasPage, etc.)

Se mezclan colores hex hardcodeados con tokens Tailwind:
```typescript
// ❌ Hardcoded
className="bg-[#1A365D]"
className="text-[#1B396A]"
border-t-4 border-t-[#1A365D]"

// ✅ Consistente con design tokens
className="bg-primary"
className="text-primary"
border-t-4 border-t-primary"
```

El color `#1A365D` (usado en algunos archivos) no existe en la paleta — debería ser `#1B396A` para consistencia.

### 🟡 Fallback con `(as any)` en render de DataTable

**Ubicación**: `DataTable.tsx:76`
```typescript
// ❌ Unsafe cast
String((item as Record<string, unknown>)[col.key] ?? '')
```

Cuando una columna no tiene `render` function, se hace un cast inseguro. Si la columna existe pero tiene un valor complejo (objeto, array), se convierte a string incorrectamente.

### 🟡 Inconsistencia en propiedad `rol_id` de User

**Ubicación**: `useAuth.ts:76` y `types/index.ts:15-16`

Para pacientes, el código hace:
```typescript
rol_id: 3, // Assuming 3 is Paciente — HARDCODED
rol: { id: 3, nombre: 'paciente' }
```

Esto asume que el rol 3 siempre es paciente, pero ese mapping no está centralizado ni es verificable. Si el backend cambia ese ID, todo se rompe.

### 🟡 Dependencias circulares potenciales en hooks

**Ubicación**: `useCitas.ts`, `usePacientes.ts`

Las mutations invalidan queries con queries keys genéricas:
```typescript
queryClient.invalidateQueries({ queryKey: ['citas'] });
queryClient.invalidateQueries({ queryKey: ['horarios'] });
```

No invalidan por ID específico, lo que podría causar cache inconsistency en escenarios de alta concurrencia.

### 🟡 `console.log` de debug遗留 en producción

**Ubicación**: `PacienteNuevoPage.tsx:16`, `HorariosPage.tsx:58`
```typescript
console.log('Datos enviados:', JSON.stringify(data, null, 2));
console.log('Submitting horario:', { ... });
```

### 🟡 Polling en `useUrgenciaActiva`

**Ubicación**: `useCitas.ts:76`
```typescript
refetchInterval: 15000, // Poll every 15 seconds
```

El polling de urgencia cada 15 segundos podría saturar el servidor si hay muchos usuarios concurrentes. No hay mecanismo de decremento o cancelación automática cuando la urgencia se resuelve.

### 🟡 `zodResolver` vs `@hookform/resolvers` v5 Type Mismatch

La versión `@hookform/resolvers` 5.x tiene cambios incompatibles con la forma en que se usan. Esto explica los `as any` persistentes.

### 🟡 Funciones de parseo de fecha duplicadas

**Ubicación**: `PacienteDetallePage.tsx:89`, `EstadisticasPage.tsx:29`, `HorariosPage.tsx:130`

```typescript
// Duplicada en al menos 3 archivos
const parseLocalDate = (dateStr: string) => {
  const [y, m, d] = dateStr.split('-');
  return new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
};
```

Violación DRY. Debería estar en un módulo util shared.

---

## 9. Recomendaciones

### Arquitectura y Escalabilidad

1. **Extraer parseo de fechas a un módulo `utils/`**:
   ```
   src/utils/dateUtils.ts
   ```
   Funciones como `parseLocalDate`, `formatLocalDate`, `formatBirthdate` deben ser utilitarias compartilhadas.

2. **Centralizar el mapa de roles (`rolMap`)**:
   En `types/index.ts` o un archivo de constantes:
   ```typescript
   export const ROLE_MAP: Record<string, number> = {
     administrador: 1, psicologo: 2, asistente: 3,
     desarrollo_academico: 4, paciente: 5,
   };
   ```
   Eliminaría los magic numbers hardcodeados.

3. **Corregir `genogramaApi.ts`** para usar `axiosClient`:
   ```typescript
   import axiosClient from './axiosClient';
   // Usar axiosClient.get/post/put en lugar de axios directo
   ```

4. **Crear un `ApiProvider` o interceptor centralizado** para manejar errores de forma consistente en toda la app, en lugar de capturarlos en cada mutation individual.

### Type Safety

5. **Resolver incompatibilidad de `@hookform/resolvers` v5 + Zod v4**:
   - Investigar si usar una versión específica compatible
   - O crear un wrapper type-safe para los resolvers
   - Eliminar todos los `as any` y `as never` en resolvers

6. **Typed hooks para API**:
   ```typescript
   // En lugar de Record<string, unknown>
   // Usar tipos específicos de params
   interface GetPacientesParams { page: number; per_page: number; buscar?: string; }
   ```

### Performance

7. **Eliminar polling de urgencia** o implementar con WebSocket/SSE para notificaciones push en tiempo real en lugar de polling cada 15 segundos.

8. **Implementar `queryClient.invalidateQueries` por ID específico**:
   ```typescript
   // En lugar de invalidar todas las queries de un tipo
   queryClient.invalidateQueries({ queryKey: ['paciente', id] });
   // Especificar en lugar de genérico
   ```

### Mantenimiento

9. **Remover todos los `console.log` de debug** antes de producción.

10. **Consolidar colores hardcodeados** a tokens Tailwind:
    - Buscar todos los `#[0-9A-Fa-f]{6}` en el código
    - Reemplazar por tokens existentes (`primary`, `secondary`, etc.)
    - Si el color no existe, agregarlo a `tailwind.config.js`

11. **Crear componente `PageHeader` reutilizable** que encapsule el patrón común de header con título, subtítulo y botón de toggle sidebar para eliminar código duplicado en páginas.

### Código Duplicado Específico

12. **Función `getCarreraNombre`** está duplicada en:
    - `PacientesListPage.tsx`
    - `PacienteDetallePage.tsx`
    - `EstadisticasPage.tsx`
    
    Debe ser un helper centralizado o un hook `useCatalogos` con util function.

13. **Lógica de parseo de fecha en BienvenidaPage** (`horariosList.forEach` con `(h as any).hora`) refleja inconsistencia en el formato de campos entre API y UI. Estandarizar en backend o usar transformaciones en el cliente de forma centralizada.

---

## 10. Evaluación General

### Nivel del Proyecto

**Intermedio → Avanzado**

El proyecto demuestra solidez en varios aspectos:
- Arquitectura bien separada (API, hooks, components, pages)
- Patrones consistentes (hooks de React Query, stores de Zustand)
- Sistema de diseño implementado (aunque con deuda técnica)
- Validación de formularios robusta (Zod + React Hook Form)
- Múltiples features complejas (genograma visual, resúmenes IA, stats, etc.)

### Fortalezas

- **Buena separación de responsabilidades** — cada capa tiene un propósito claro
- **Estado de servidor bien manejado** con TanStack Query (cache, invalidación, deduplicación)
- **Autenticación y autorización** bien implementadas (JWT + roles + protección de rutas)
- **UX cuidada** — loading states, empty states, modales, feedback visual
- **Diseño editorial distintivo** — el sistema visual "Clinical Premium" es consistente y profesional
- **Feature de IA** (resúmenes clínicos con markdown rendering) añade valor diferenciador

### Lo que le falta para Producción

| Área | Qué falta |
|---|---|
| **Testing** | No se encontró suite de tests. Falta unit tests (Vitest/Jest) para hooks y componentes, e2e tests (Playwright) para flujos críticos (login, crear paciente, agendar cita). |
| **Error Boundaries** | No hay `ErrorBoundary` para capturar errores de React y mostrar fallback amigable en lugar de pantalla en blanco. |
| **Manejo de carga/optimistic updates** | Las mutations no usan `onMutate`/`onError` de TanStack Query para optimistic updates, lo que causa experiencia de usuario menos responsiva. |
| **Gestión de variables de entorno** | `VITE_API_URL` no tiene validación ni schema. Si no está definida, el fallback a `localhost:8000` podría apuntar a entorno incorrecto en producción. |
| **SEO / Meta tags** | No hay react-helmet ni meta tags para redes sociales. |
| **Dark mode** | No hay soporte para tema oscuro. El sistema de diseño está hardcodeado a colores claros. |
| **Accesibilidad (a11y)** | Algunos inputs faltan `aria-label`, los estados de error usan `role="alert"` pero no siempre. El contraste en algunos elementos podría no cumplir WCAG AA. |
| **PWA / Offline** | No es una PWA. No hay service worker, manifest, ni soporte offline. |
| **Segmentación de bundles** | No hay lazy loading de rutas. Todo el bundle se descarga al inicio. Should use `React.lazy` + `Suspense` para páginas. |
| **Logs/Monitoreo** | No hay integración con servicios de logging (Sentry, LogRocket) o analytics. |

### Deuda Técnica Crítica

1. **Type safety comprometida** — múltiples `as any` en resolvers que ocultan bugs potenciales
2. **`genogramaApi.ts` inconsistente** — no usa el cliente HTTP centralizado
3. **Colores hardcodeados** — mezcla de tokens y hex literals que rompe consistencia visual
4. **Funciones duplicadas** — parseo de fechas, `getCarreraNombre`, etc. en múltiples archivos

### Resumen Numérico

- **~30 páginas/components principales**
- **11 módulos de API** (10 usan axiosClient + 1 usa axios directo ⚠️)
- **10 hooks de TanStack Query** para diferentes recursos
- **2 stores de Zustand** (auth + UI)
- **17+ componentes UI reutilizables**
- **2 features complexes** (Genograma con React Flow, VoiceDictation con Web Speech API)
- **1 sistema de diseño editorial** con +50 clases CSS custom