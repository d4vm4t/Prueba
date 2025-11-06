# Backend de suscripción (desarrollo rápido)

## Requisitos
- Node.js 18+

## Instalación
```bash
cd /home/d4vm4t/Desktop/Prueba_git/prueba
npm install
```

## Ejecutar API
```bash
npm run start
# API en http://localhost:3000
```

La base de datos SQLite se crea automáticamente en `users.db`.

## Endpoints
- POST `/api/auth/register` { name, email, password }
- POST `/api/auth/login` { email, password }

La página `suscripcion.html` apunta por defecto a `http://localhost:3000/api`.

