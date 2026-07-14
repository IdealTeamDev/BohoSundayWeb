# Documentación Técnica: Boho Sunday Web

Esta documentación detalla la arquitectura, las dependencias, el modelo de datos, el sistema de bloqueo de boletas y los flujos críticos de la plataforma de venta de entradas y reservas de camas/mesas para **Boho Sunday** (Casa Candela).

---

## 1. Arquitectura y Construcción del Proyecto

El proyecto está construido bajo una pila moderna de desarrollo web, priorizando la velocidad de carga, la persistencia de datos distribuida y una experiencia de usuario fluida:

*   **Framework Principal**: [Next.js v16.2.7](https://nextjs.org) utilizando el nuevo **App Router**. Esto permite tener componentes del servidor (Server Components) para peticiones de datos rápidas, y API Routes optimizadas para los servicios internos.
*   **Lenguaje**: [TypeScript](https://www.typescriptlang.org/) para tipado estático y robustez del código.
*   **Estilos**: [Tailwind CSS v4](https://tailwindcss.com/) configurado mediante PostCSS, ofreciendo un sistema de diseño dinámico e interactivo.
*   **Enrutamiento e Internacionalización (i18n)**: Rutas dinámicas localizadas en `app/[locale]` para soportar Español (`es`) e Inglés (`en`). Se implementa un [middleware.ts](file:///C:/Users/Usuario/Documents/IdealTeamGit/Repositorio%20Boho/BohoSundayWeb/middleware.ts) que reescribe de forma transparente las rutas sin locale agregando `/es` como idioma predeterminado.
*   **Sincronización de Contenidos (CMS)**: Integración con **WordPress REST API** (Advanced Custom Fields - ACF) para gestionar camas y mesas en tiempo real.

---

## 2. Dependencias del Proyecto (package.json)

A continuación se detallan las librerías utilizadas y la razón de su integración:

| Dependencia | Propósito | Razón de Uso |
| :--- | :--- | :--- |
| `next` | Framework Web | Motor principal de la aplicación, manejo de páginas, renderizado en servidor (SSR) y APIs. |
| `react` y `react-dom` | Librería UI | Base de la interfaz de usuario. |
| `@supabase/supabase-js` | Cliente de Base de Datos | Cliente oficial para conectarse a Supabase (PostgreSQL), realizar consultas y gestionar persistencia. |
| `mercadopago` | SDK de Pasarela (Backend) | Procesamiento de pagos, creación de transacciones PSE/tarjeta en el servidor y webhooks. |
| `@mercadopago/sdk-react` | Componentes de Pasarela (Frontend) | Renderizado de Checkout Bricks (formulario de tarjetas seguro e integrado en la UI). |
| `nodemailer` | Envío de Correos | Permite el envío de emails transaccionales (confirmaciones de compra con QRs y alertas de sistema). |
| `uuid` | Identificadores Únicos | Generación de tokens de sesión para el bloqueo de tickets y tokens de autenticación de staff. |
| `pg` | Controlador Postgres (Raw) | Utilizado estrictamente en scripts de inicialización (`scripts/setup_db.js`) para manipulación directa del motor PostgreSQL. |
| `@primer/octicons-react` | Biblioteca de Iconos | Iconografía nativa de GitHub para elementos visuales. |

---

## 3. Base de Datos (Supabase / PostgreSQL)

El proyecto utiliza **Supabase** como base de datos en la nube (PostgreSQL). Las conexiones y consultas se manejan mediante el SDK oficial en [lib/supabase.ts](file:///C:/Users/Usuario/Documents/IdealTeamGit/Repositorio%20Boho/BohoSundayWeb/lib/supabase.ts).

### Estructura de Tablas Críticas

#### A. `ticket_locks` (Control de Bloqueo de Boletas)
Esta tabla rastrea los bloqueos temporales de boletas y mesas durante el proceso de compra.
*   `lock_key` (TEXT, PK): Identificador único del bloqueo. Para individuales es `${ticketId}_${sessionToken}`, para camas es el `ticketId`.
*   `ticket_id` (TEXT): ID del ticket comprado.
*   `session_token` (TEXT): Token de la sesión de checkout (`uuidv4`).
*   `quantity` (INTEGER): Cantidad de boletas bloqueadas.
*   `status` (TEXT): Estado del bloqueo (`locked` para reservas activas o `sold` para bloqueos permanentes de camas).
*   `expires_at` (TIMESTAMP WITH TIME ZONE): Fecha y hora límite en que el bloqueo se liberará.

#### B. `purchased_tickets` (Ventas Aprobadas)
Almacena la información de las entradas vendidas con éxito.
*   `order_id` (TEXT, PK): ID único de la orden (`ORD-...`).
*   `ticket_id` (TEXT): ID de la boleta comprada.
*   `ticket_name` (TEXT): Nombre descriptivo de la boleta.
*   `ticket_number` (INTEGER): Número asociado al boleto.
*   `zone` (TEXT): Zona del evento (ej. `general`, `vip`, `candelaria`).
*   `buyer_name` (TEXT): Nombre del comprador.
*   `buyer_email` (TEXT): Correo electrónico del comprador.
*   `buyer_phone` (TEXT): Teléfono de contacto.
*   `total_accesos` (INTEGER): Total de accesos/personas permitidas por el boleto comprado.
*   `accesos_restantes` (INTEGER): Accesos pendientes por registrar (utilizado para el control de entrada).
*   `status` (TEXT): Estado de la orden (generalmente `paid`).
*   `checksum` (TEXT): Hash criptográfico SHA-256 (`16` caracteres) para validar la integridad del boleto en el ingreso.
*   `payment_ref` (TEXT): ID de referencia del pago generado por la pasarela.
*   `language` (TEXT): Idioma de la compra (`ES` o `EN`).
*   `created_at` (TIMESTAMP WITH TIME ZONE): Fecha y hora del registro.

#### C. `boleteria_individual` (Control de Stock de Boletas)
Configuración dinámica del stock y precios de las entradas individuales (`early`, `anytime`).
*   `id` (TEXT, PK): ID de la boleta.
*   `name` (TEXT): Nombre público.
*   `price` (NUMERIC): Precio en COP.
*   `stock` (INTEGER): Cantidad total disponible para la venta.
*   `wp_post_id` (INTEGER): ID del post de WordPress asociado.

#### D. `staff_users` (Autenticación del Personal de Control)
Creado mediante el script [setup_db.js](file:///C:/Users/Usuario/Documents/IdealTeamGit/Repositorio%20Boho/BohoSundayWeb/scripts/setup_db.js) para validar al personal en la portería del evento.
*   `id` (UUID, PK): ID interno.
*   `name` (TEXT): Nombre del usuario.
*   `username` (TEXT, UNIQUE): Usuario para login (ej. `admin`, `portero1`).
*   `pin_hash` (TEXT): Hash SHA-256 del PIN de seguridad.
*   `role` (TEXT): Rol (`admin`, `bouncer`).
*   `is_active` (BOOLEAN): Estado del usuario.
*   `created_at` (TIMESTAMP WITH TIME ZONE).

---

## 4. Sistema de Bloqueo Temporal (Ticket Locking)

El sistema de bloqueo evita la sobreventa (overselling) y asegura que, cuando un cliente inicia el proceso de pago, sus boletas o la cama seleccionada queden reservadas para él por un tiempo limitado.

### Detalles de la Implementación
Toda la lógica de reserva reside en el archivo [lockStore.ts](file:///C:/Users/Usuario/Documents/IdealTeamGit/Repositorio%20Boho/BohoSundayWeb/lib/lockStore.ts).

> [!IMPORTANT]
> **Tiempo del Bloqueo**: Se define en `10 minutos` mediante la constante `LOCK_DURATION_MS = 10 * 60 * 1000`.

### Flujo de Operaciones:

1.  **Limpieza Automática (`cleanExpiredLocks`)**:
    Antes de adquirir cualquier nuevo bloqueo o consultar disponibilidad, el servidor realiza una limpieza en Supabase eliminando los registros de bloqueos cuya columna `expires_at` sea inferior a la hora actual y tengan estado `locked`.
2.  **Lógica para Boletas Individuales (`early` / `anytime`)**:
    *   Calcula el stock disponible: `Stock Total` - `Boletas Vendidas (purchased_tickets)` - `Boletas Bloqueadas por otros usuarios (ticket_locks con status locked)`.
    *   Si la cantidad solicitada supera el stock disponible, la solicitud se rechaza retornando un código `409 Conflict`.
    *   Si hay disponibilidad, realiza un *upsert* en `ticket_locks` registrando la llave única (`${ticketId}_${sessionToken}`) y los minutos de expiración.
3.  **Lógica para Camas y Mesas**:
    *   Comprueba si la cama ya posee un registro con status `sold` (vendida permanentemente) o si está bloqueada activamente por otra sesión.
    *   Si está libre, realiza un *upsert* asociando la cama al `sessionToken` del cliente con expiración de 10 minutos.

---

## 5. Integración de Pasarelas de Pago

El checkout soporta dos pasarelas de pago y se inicializa en `/api/checkout/payment-session` validando primero que la sesión aún retenga el bloqueo del ticket.

### A. MercadoPago
1.  **Frontend**: Utiliza los componentes oficiales de **Checkout Bricks** para recolectar de manera segura los datos de la tarjeta de crédito o la institución financiera (PSE) en un formulario integrado.
2.  **Procesamiento Backend** ([process-payment/route.ts](file:///C:/Users/Usuario/Documents/IdealTeamGit/Repositorio%20Boho/BohoSundayWeb/app/api/checkout/process-payment/route.ts)):
    *   Conecta mediante la librería `mercadopago` con las credenciales de producción.
    *   Crea el pago en MercadoPago. Si se usa PSE, genera una URL externa (`external_resource_url`) a la cual se redirige al cliente para autorizar en su banco.
3.  **Seguridad en Webhooks (IPN)** ([webhooks/mercadopago/route.ts](file:///C:/Users/Usuario/Documents/IdealTeamGit/Repositorio%20Boho/BohoSundayWeb/app/api/checkout/webhooks/mercadopago/route.ts)):
    *   Al recibir una notificación asíncrona de MercadoPago, **el sistema no confía en el cuerpo recibido de manera directa**.
    *   El servidor realiza una petición GET segura de verificación a `https://api.mercadopago.com/v1/payments/{paymentId}` usando el token Bearer oficial para recuperar los datos reales de la transacción.
    *   Compara el monto abonado (`transaction_amount`) contra el precio esperado para evitar fraudes por manipulación del cliente.

### B. Wompi
1.  **Firma de Integridad**: Wompi requiere una firma SHA-256 para asegurar que el monto y la orden no sean alterados durante el viaje al servidor de pagos. Se genera de la siguiente manera:
    $$\text{Signature} = \text{SHA256}(\text{orderId} + \text{amountInCents} + \text{currency} + \text{wompiIntegrityKey})$$
2.  **Redirección**: El backend construye la URL de pago con los parámetros firmados y redirige al usuario a la interfaz oficial de Wompi.
3.  **Verificación Webhook** ([webhooks/wompi/route.ts](file:///C:/Users/Usuario/Documents/IdealTeamGit/Repositorio%20Boho/BohoSundayWeb/app/api/checkout/webhooks/wompi/route.ts)):
    *   Verifica criptográficamente el checksum del webhook calculando el SHA-256 localmente utilizando la clave `WOMPI_EVENTS_SECRET`.

> [!TIP]
> **Modo de Pruebas (Bypass)**: Si se configura la variable de entorno `BYPASS_PAYMENT=true`, el sistema aprueba instantáneamente la compra sin redirigir a pasarelas reales, ideal para pruebas locales rápidas del flujo de éxito.

---

## 6. Procesos Post-Venta

Una vez que cualquiera de las pasarelas confirma el pago como exitoso (`approved` o `APPROVED`):

1.  **Aprobación del Pedido**: Se marca la orden como aprobada en el sistema persistente local JSON ([data/orders.json](file:///C:/Users/Usuario/Documents/IdealTeamGit/Repositorio%20Boho/BohoSundayWeb/data/orders.json)) y se almacena en la tabla `purchased_tickets` de Supabase.
2.  **Bloqueo Definitivo**: El bloqueo temporal en `ticket_locks` se actualiza a un estado `sold` y su fecha de expiración se extiende a 100 años en el futuro para asegurar que no pueda ser liberado ni vuelto a comprar.
3.  **Descuento de Stock en WordPress** ([tickets.ts](file:///C:/Users/Usuario/Documents/IdealTeamGit/Repositorio%20Boho/BohoSundayWeb/lib/tickets.ts) -> `decreaseWordPressStock`):
    *   Si es boleta individual, realiza una petición POST autenticada a la API de WordPress para disminuir la cantidad restante en el ACF correspondiente.
    *   Si es una Cama o Mesa, actualiza la propiedad `available` a `false` en WordPress para deshabilitar su venta visual en el mapa interactivo.
4.  **Generación de Correo y Cola (Queue)** ([emailQueue.ts](file:///C:/Users/Usuario/Documents/IdealTeamGit/Repositorio%20Boho/BohoSundayWeb/lib/emailQueue.ts)):
    *   Se añade la tarea de envío a una cola en memoria con lógica de **reintentos exponenciales** (hasta 3 intentos con pausas de 2s, 4s y 8s si falla la red SMTP).
    *   Se genera un código QR usando la API `api.qrserver.com` apuntando a la URL única del ticket (`/api/qrs/{orderId}`).
    *   El correo se despacha con la plantilla HTML correspondiente en el idioma seleccionado (diseños cargados en [emailService.ts](file:///C:/Users/Usuario/Documents/IdealTeamGit/Repositorio%20Boho/BohoSundayWeb/lib/emailService.ts)).
    *   Se notifica a los administradores de forma separada:
        *   `alejandra@idealteamcolombia.com` recibe los detalles del pedido junto con el bloque **JSON** completo para sus registros técnicos.
        *   `coordinacionreservas@casacandela.co` recibe la misma notificación con los datos legibles del pedido y el código QR adjunto, pero **sin** el bloque JSON.

---

## 7. Sistema de Ingreso (Check-In QR)

Cuando el cliente llega al evento, el personal de portería escanea el código QR del boleto.

1.  **Escaneo**: El QR dirige al lector a la URL `/api/qrs/{orderId}`.
2.  **Obtención de Datos**: La API `/api/qrs/[orderId]` verifica el registro correspondiente en la tabla `purchased_tickets` de Supabase y retorna un JSON estructurado con el nombre del comprador, zona asignada, total de accesos permitidos, y accesos restantes.
3.  **Autenticación de Porteros**:
    *   El dispositivo del portero debe enviar un encabezado de autorización `x-admin-token`.
    *   Este token se valida en [authStore.ts](file:///C:/Users/Usuario/Documents/IdealTeamGit/Repositorio%20Boho/BohoSundayWeb/lib/authStore.ts) desencriptando la información (Base64) y comparándola con los hashes almacenados en la tabla `staff_users`.
4.  **Consumo de Accesos (POST)**:
    *   Al validar el pase, el portero envía la cantidad de accesos a consumir.
    *   La API reduce el conteo en la columna `accesos_restantes` de la tabla `purchased_tickets`.
    *   Si se intenta utilizar más accesos de los permitidos, el sistema arroja un error impidiendo el paso.

---

## 8. Cron Programado (Emails Automatizados)

Ubicado en [app/api/cron/send-scheduled-email/route.ts](file:///C:/Users/Usuario/Documents/IdealTeamGit/Repositorio%20Boho/BohoSundayWeb/app/api/cron/send-scheduled-email/route.ts), este módulo permite realizar campañas de correo automáticas (ej. un recordatorio masivo a los compradores 24 horas antes del evento).

*   **Destinatario**: Configurado para `alejandra@idealteamcolombia.com`.
*   **Fecha de Disparo**: Programada de forma estricta para el `25 de Julio de 2026, 2:00 PM` (Hora Colombia, `UTC-5`).
*   **Protecciones**:
    *   Verificación estricta del año actual (`2026`).
    *   Banderas booleanas en memoria (`hasBeenSentInContainerES` / `hasBeenSentInContainerEN`) para prevenir que el servicio cron dispare correos duplicados ante llamadas repetitivas.
    *   Parámetro de anulación rápida `?force=true` para disparar el flujo manualmente en entornos de depuración.
