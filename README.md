# Trabajo Practico de Repaso - Operacion Rescate II

Este proyecto fue creado para practicar depuracion de backend con Node.js, Express, JWT, autenticacion y autorizacion.

Importante: este backend tiene errores intencionales. La idea NO es rehacerlo, sino analizarlo, detectar problemas y corregirlos.

## Requisitos

- Node.js 18+
- npm

## Instalacion

1. Copiar variables de entorno:

```bash
cp .env.example .env
```

2. Instalar dependencias:

```bash
npm install
```

3. Ejecutar el proyecto:

```bash
npm run dev
```

## Objetivo para estudiantes

- Lograr registro y login funcional.
- Proteger rutas correctamente con JWT.
- Corregir respuestas HTTP.
- Documentar cada error encontrado.

## Estructura

- src/server.js
- src/app.js
- src/routes
- src/controllers
- src/middleware
- src/utils
- src/data
- docs/REGISTRO_ERRORES_TEMPLATE.md

# Registro de Problemas y Soluciones

| N° | Archivo | Problema encontrado | Cómo lo detectaron | Solución aplicada |
|:--:|:---|:---|:---|:---|
| 1 | `.gitignore` | No incluía .env; el archivo de secretos quedaba versionado en el repositorio | Revisión manual del repositorio clonado | Se agregó .env y .env.local al .gitignore |
| 2 | `.env` | El archivo con el JWT_SECRET real estaba commiteado en git | Se encontró trackeado al clonar el proyecto | Se eliminó del repositorio y se creó .env.example con placeholders |
| 3 | `src/app.js` | Faltaba express.json(); ningún POST/PUT podía leer req.body | Postman devolvía "Faltan datos" aun enviando el body completo | Se agregó app.use(express.json()) |
| 4 | `src/utils/token.js` | module.export (sin "s") en vez de module.exports; signToken se importaba como undefined | Al registrarse/loguearse el server tiraba TypeError: signToken is not a function | Se corrigió a module.exports |
| 5 | `src/utils/token.js` | Usaba process.env.JWT_SECRETT (typo), variable inexistente; siempre firmaba con el valor por defecto hardcodeado | Comparando .env contra el código, el nombre no coincidía | Se corrigió a process.env.JWT_SECRET |
| 6 | `src/utils/token.js` | El token expiraba en "2s", dejando la sesión inutilizable | Se detectó al recibir jwt expired segundos después de loguearse | Se cambió expiresIn a "1h" |
| 7 | `src/utils/token.js` | El payload solo tenía role, sin id; req.user.id quedaba undefined en rutas protegidas | GET /me devolvía siempre "Usuario no encontrado" | Se agregó id y email al payload del token |
| 8 | `src/middleware/authMiddleware.js` | Usaba jwt.decode() en vez de jwt.verify(): no validaba la firma, cualquier token (incluso forjado) era aceptado | Se armó un JWT a mano con role: admin y pasó sin problema | Se reemplazó por jwt.verify() dentro de un try/catch |
| 9 | `src/middleware/authMiddleware.js` | La condición if (!token \|\| decoded) dejaba pasar como invitado a cualquier request sin token | GET /me sin header Authorization devolvía 200 en vez de 401 | Se reescribió: sin token o token inválido → 401 |
| 10 | `src/routes/userRoutes.js` | En GET /me los middlewares estaban invertidos (getProfile, authMiddleware) | req.user llegaba undefined al controller | Se invirtió el orden: authMiddleware, getProfile |
| 11 | `src/routes/userRoutes.js` | GET /orders no tenía middleware de autenticación | Se pudo pedir /api/users/orders sin token y devolvía 200 | Se agregó authMiddleware |
| 12 | `src/routes/adminRoutes.js` | GET /all no tenía ningún middleware; cualquiera sin loguearse listaba todos los usuarios | Se probó la ruta sin header Authorization y devolvía el listado completo | Se agregaron authMiddleware + nuevo requireAdmin (chequeo de rol) |
| 13 | `src/controllers/authController.js (register)` | Faltaba return tras el 400 de "Faltan datos"; la función seguía ejecutándose | Registro incompleto generaba error o respuesta duplicada | Se agregó return |
| 14 | `src/controllers/authController.js (register)` | Devolvía 200 en vez de 409 cuando el email ya existía | No cumplía "responder con códigos HTTP correctos" del enunciado | Se cambió a res.status(409) |
| 15 | `src/controllers/authController.js (register)` | La respuesta incluía el usuario completo, exponiendo el hash de password | Inspección del JSON devuelto por POST /register | Se creó utils/sanitizeUser.js (toPublicUser) y se usó en la respuesta |
| 16 | `src/controllers/authController.js (login)` | Faltaba return cuando el usuario no existía; seguía llamando bcrypt.compare sobre user undefined | Loguearse con email inexistente tiraba TypeError | Se agregó return con 401 |
| 17 | `src/controllers/authController.js (login)` | bcrypt.compare(user.password, password) con argumentos invertidos (debe ser compare(plano, hash)) | El login con la contraseña correcta fallaba | Se corrigió a bcrypt.compare(password, user.password) |
| 18 | `src/controllers/authController.js (login)` | Faltaba return tras el 401 de contraseña incorrecta; igual generaba y devolvía un token | Con password incorrecta el server tiraba ERR_HTTP_HEADERS_SENT | Se agregó return |
| 19 | `src/controllers/authController.js (login)` | La respuesta exponía el usuario completo con el hash | Inspección del JSON de POST /login | Se aplicó toPublicUser() |
| 20 | `src/controllers/userController.js (getProfile)` | GET /me devolvía el hash de password | Inspección de la respuesta | Se aplicó toPublicUser() |
| 21 | `src/controllers/userController.js (updateMe)` | IDOR: tomaba req.body.userId para decidir qué usuario editar, permitiendo modificar el perfil de otro usuario (incluso el admin) | PUT /me con {"userId":"1", ...} y un token de usuario común modificaba el registro equivocado | Se eliminó userId del body; siempre se usa req.user.id del token verificado |
| 22 | `src/controllers/userController.js (updateMe)` | También exponía el hash de password en la respuesta | Inspección de la respuesta | Se aplicó toPublicUser() |
| 23 | `src/controllers/adminController.js (listUsers)` | El listado de usuarios incluía el hash de password de todos | GET /api/users/all devolvía los hashes de bcrypt | Se mapeó la lista con toPublicUser() |
| 24 | `src/middleware/requireAdmin.js (nuevo)` | No existía forma de distinguir "no autenticado" (401) de "no autorizado por rol" (403) en la ruta de admin | Un usuario común autenticado podía listar todos los usuarios igual | Se creó middleware que valida req.user.role === "admin" |

