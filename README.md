#Equipo_Gomita — Sistema de Reservas de Hotel
 
Aplicación web fullstack de administración hotelera desarrollada con **Next.js 15**, **React**, **TailwindCSS**, **Prisma** y **Supabase (PostgreSQL)**.
 
Permite gestionar habitaciones, reservas, inventarios (maestros y movimientos) y usuarios con roles diferenciados.
 
--------------
 
##Integrantes
 
Nombres:
- Juan David García García
- Mateo Vásquez
 
-----------------

##Credenciales de acceso
 
### Administrador
--------------
 Email: `admin@hotel.com`
 Contraseña  `admin123`
 
### Usuario
--------------
 Email  `user@hotel.com` 
 Contraseña  `user123` 
 
--------------

## Contiene variables de entorno de supabase
 
```env
DATABASE_URL="postgresql://postgres.<ref>:<password>@aws-0-<region>.pooler.supabase.com:6543/postgres?pgbouncer=true"

--------------
 
## Despliegue
 
La aplicación está desplegada en Vercel:
 
 
## Estructura del proyecto
 
```
app/
  (auth)/login/       → Página de inicio de sesión
  (main)/
    transacciones/    → Gestión de movimientos de inventario
    maestros/         → Gestión de categorías de inventario
    users/            → Gestión de usuarios (solo ADMIN)
    habitaciones/     → Gestión de habitaciones del hotel
    reservas/         → Gestión de reservas
  api/                → Endpoints del backend (REST)
components/           → Componentes reutilizables (sidebar, dialogs, tablas)
lib/                  → auth.ts (sesión), prisma.ts (cliente BD)
prisma/               → schema.prisma y migraciones
```
