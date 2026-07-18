# Maprobacion - Asamblea

Frontend de Jefatura para aprobación de Solicitud de Transporte, Combustible y Mantenimiento.

## Stack

- React 18 + TypeScript
- Vite + Tailwind CSS
- React Router DOM v7
- Leaflet (mapas)
- Framer Motion (animaciones)
- Zustand / Context API
- PWA (vite-plugin-pwa)

## Arquitectura

```
src/
├── app/            # Providers globales (AuthProvider, NotificationProvider)
├── features/       # Módulos de negocio (Aprobacion, Auth)
│   ├── Aprobacion/
│   │   ├── api/          # Capa de API (dashboardApi, solicitudApi, etc.)
│   │   ├── components/   # Componentes de UI específicos del módulo
│   │   ├── hooks/        # Custom hooks (useAprobacion, useReasignacion, etc.)
│   │   ├── pages/        # Páginas/rutas
│   │   └── types/        # Tipos TypeScript del módulo
│   └── Auth/
│       ├── context/      # AuthContext (login, logout, sesión)
│       └── pages/        # LoginPage
├── shared/         # Código reutilizable entre features
│   ├── api/        # Mapper de datos API (apiMapper)
│   ├── auth/       # Utilidades de autenticación (hasJefaturaAccess)
│   ├── components/ # Componentes globales (NotificationPanel, Pagination, etc.)
│   └── notifications/ # Sistema de notificaciones (cache, types, useNotifications)
└── widgets/        # Compuestos de UI (Sidebar, DashboardLayout)
```

## Comandos

```bash
npm install          # Instalar dependencias
npm run dev          # Desarrollo local
npm run build        # Build de producción
npm run preview      # Previsualizar build
npm run lint         # Linting (max 42 warnings)
npm run lint:fix     # Auto-fix linting
npm test             # Tests (vitest)
npm run test:watch   # Tests en watch mode
npm run validate     # Lint + Test + Build (CI)
```

## Configuración

### Variables de entorno

Crea un archivo `.env` en la raíz:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

### Path aliases

Los aliases están configurados en `tsconfig.json` y `vite.config.ts`:

- `@/` → `src/`

## Test

```bash
npm test                   # Ejecutar todos los tests
npm run test:coverage      # Con cobertura de código
```

La suite incluye tests para:

- `shared/auth/roles.ts` — control de acceso por roles
- `shared/notifications/cache.ts` — caché de notificaciones con localStorage
- `shared/notifications/` — hook useNotifications + NotificationProvider
- `shared/api/apiMapper.ts` — mapeo de datos de API
- `features/Auth/` — autenticación

### Configuración de tests

- Framework: Vitest
- DOM: jsdom
- Setup: `src/test/setup.ts` (localStorage polyfill)
- Matcher: jest-dom
