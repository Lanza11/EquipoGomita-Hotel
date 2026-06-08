# Equipo_Gomita — Sistema de Reservas de Hotel
 
Aplicación web fullstack de administración hotelera desarrollada como proyecto evaluativo. 
Simula el sistema interno de un hotel ficticio, permitiendo
gestionar habitaciones, reservas, inventarios y usuarios desde un panel de administración
centralizado.

La aplicación diferencia dos tipos de usuarios: administradores con acceso completo a todas
las funcionalidades, y usuarios regulares con acceso restringido a transacciones y maestros.
Toda la información se persiste en una base de datos PostgreSQL alojada en Supabase, y el
sistema maneja autenticación propia mediante cookies de sesión firmadas, sin depender de
librerías externas de autenticación.
 
--------------
 
## Integrantes
 
Nombres:
- Juan David García García
- Mateo Vásquez
 
-----------------

## Credenciales de acceso
 
### Administrador
--------------
 Email: `admin@hotel.com`
 Contraseña  `12356`
 
### Usuario
--------------
 Email  `user@hotel.com` 
 Contraseña  `user123` 
 
--------------

## Cómo ejecutar el proyecto localmente
 
### 1. Clonar el repositorio
 
```bash
git clone https://github.com/<org>/Equipo_Gomita-HotelReservas.git
cd Equipo_Gomita-HotelReservas
```
 
### 2. Instalar dependencias
 
```bash
pnpm install
```
 
### 3. Configurar variables de entorno
 
Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:
 
```env
# Conexión pooler para la app en runtime (puerto 6543)
DATABASE_URL="postgresql://postgres.<ref>:<password>@aws-0-<region>.pooler.supabase.com:6543/postgres?pgbouncer=true"

```
### 4. Generar el cliente de Prisma y aplicar migraciones
 
```bash
npx prisma generate
npx prisma migrate dev --name migracion-inicial
```
 
### 5. Poblar la base de datos con usuarios demo
 
```bash
pnpm add -D tsx
npx prisma db seed
```
 
### 6. Iniciar el servidor de desarrollo
 
```bash
pnpm dev
```
 
Abre [http://localhost:3000](http://localhost:3000) en tu navegador.
 
--------------
 
## Despliegue
 
La aplicación está desplegada en Vercel: https://equipo-gomita-hotel.vercel.app/
 
 
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
