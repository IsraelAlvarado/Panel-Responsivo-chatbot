
---

```markdown
# 🌹 Rosita App — Panel de Administración

> Panel web responsivo y reactivo diseñado para la gestión y administración de un chatbot automatizado (Botpress) y sus servicios parroquiales integrados.

![Angular](https://img.shields.io/badge/Angular-NgModule-red?logo=angular)
![Node.js](https://img.shields.io/badge/Node.js-Backend-green?logo=node.js)
![MariaDB](https://img.shields.io/badge/MariaDB-Database-blue?logo=mariadb)
![Botpress](https://img.shields.io/badge/Botpress-Chatbot-purple?logo=openai)

---

## 📋 Contenido / Contents

- [Descripción](#-descripción)
- [Arquitectura](#-arquitectura)
- [Módulos del Panel](#-módulos-del-panel)
- [Getting Started](#-getting-started)
- [Variables de Entorno](#-variables-de-entorno)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Servicios e Integraciones](#-servicios-e-integraciones)
- [Tech Stack](#-tech-stack)

---

## 📌 Descripción

**Rosita** es una plataforma administrativa desarrollada en Angular que centraliza la gestión de flujos de información para un asistente virtual interactivo. Permite al equipo de gestión coordinar las solicitudes del chatbot, responder preguntas frecuentes, registrar inscripciones a eventos o grupos, administrar intenciones de servicios, y automatizar el envío de notificaciones push masivas.

El backend en Node.js actúa como orquestador seguro: sincroniza el historial de conversaciones, se conecta a la base de datos remota mediante un túnel SSH robusto y expone una API REST consumida por el frontend de forma eficiente.

---

## 🏛 Arquitectura


```

Frontend (Angular NgModule)
│
├── Facades (BehaviorSubject state)
├── Standalone Components
└── HttpClient → REST API
│
Backend (Node.js / Express)
│
├── SSH Tunnel → MariaDB (Remoto)
├── Botpress Cloud API
├── OneSignal API
└── Google Drive API

```

* **Patrón de estado:** Facades optimizadas con `BehaviorSubject` (arquitectura ligera sin sobrecarga de NgRx).
* **Routing:** Angular Router simplificado con navegación fluida y unificada.
* **Styling:** Tailwind CSS + SCSS encapsulado por componente.

---

## 🧩 Módulos del Panel

| Pestaña | Funcionalidad |
|---------|--------------|
| 📊 **Dashboard** | Métricas en tiempo real: volumen de chats, flujos completados, pendientes, usuarios activos, actividad semanal y analítica de consultas frecuentes. |
| 💬 **Historial de Chats** | Trazabilidad completa de conversaciones con filtros avanzados, auditoría de mensajes y control de depuración. |
| ⚙️ **Configuración** | Panel centralizado para el mantenimiento de catálogos y reglas de negocio del bot. |

### Módulos de Configuración Específica

| Módulo | Descripción |
|--------|-------------|
| 📄 **FAQs** | CRUD dinámico de preguntas frecuentes clasificadas por categorías para alimentar la base de conocimiento del chatbot. |
| 👥 **Grupos y Comunidades** | Gestión integral de colectivos, membresías y control estadístico de usuarios registrados. |
| 📅 **Eventos** | Calendario y agenda global con filtros avanzados por tipo de actividad y estado de publicación. |
| 📝 **Inscripciones** | Consolidación de registros de usuarios con flujos automatizados de exportación hacia almacenamiento en la nube. |
| ⛪ **Intenciones y Solicitudes** | Administración de peticiones con control de estados, horarios asignados y reportería interna. |
| 🔔 **Notificaciones Push** | Motor de plantillas OneSignal para el diseño, edición y envío masivo de alertas a usuarios suscritos. |

---

## 🚀 Getting Started

### Prerrequisitos

* Node.js (versión LTS recomendada)
* Angular CLI
* Acceso SSH configurado en el servidor de destino

### Instalación y Despliegue Local

1. **Clonar el repositorio:**
   ```bash
   git clone <repo-url>
   cd rosita-app

```

2. **Configuración del Backend:**
```bash
cd backend
npm install
cp .env.example .env  # Configurar las variables correspondientes
npm start

```


3. **Configuración del Frontend:**
```bash
cd ../Rosita
npm install
ng serve

```



### Compilación para Producción

Para desplegar la aplicación optimizada, compila el frontend e intégralo con el servidor backend:

```bash
cd Rosita
ng build --configuration production

```

> **Nota:** El backend está diseñado para servir de forma estática los archivos compilados del frontend desde el directorio de distribución final.

---

## 🔐 Variables de Entorno

El proyecto requiere un archivo `.env` en la raíz de la carpeta `backend/` con la siguiente estructura (reemplazar con los valores del entorno correspondiente):

```env
# Configuración del Servidor
PORT=

# Base de Datos (Vía túnel SSH local)
DB_HOST=
DB_PORT=
DB_USER=
DB_PASSWORD=
DB_NAME=

# Configuración del Túnel SSH
SSH_HOST=
SSH_PORT=
SSH_USERNAME=
SSH_PASSWORD=

# Integración Botpress Cloud
BOTPRESS_TOKEN=
BOTPRESS_BOT_ID=
BOTPRESS_WORKSPACE_ID=
BOTPRESS_URL=

# Integración OneSignal
ONESIGNAL_REST_API_KEY=
ONESIGNAL_APP_ID=
ONESIGNAL_EXTERNAL_ID=

```

### Configuración del Entorno en Frontend (`Rosita/src/environments/`)

La aplicación maneja el direccionamiento de la API de forma dinámica:

* **Desarrollo:** Configurar la URL completa del endpoint local en las variables de entorno de Angular.
* **Producción:** Configurar la ruta relativa (`/api`), permitiendo que el propio servidor Node.js actúe como proxy inverso y evite problemas de CORS.

---

## 📂 Estructura del Proyecto

```
rosita-app/
├── backend/
│   └── src/
│       ├── config/
│       │   ├── database.js          # Pool de conexiones MariaDB e inicialización de túnel
│       │   └── env.js               # Validación y tipado de variables de entorno
│       ├── controllers/             # Controladores lógicos por entidad
│       ├── models/                  # Consultas SQL nativas y optimizadas
│       ├── routes/                  # Enrutadores Express estructurados
│       └── services/
│           ├── sshTunnel.service.js # Orquestador del ciclo de vida del túnel SSH
│           └── databaseInit.service.js
│
└── Rosita/
    └── src/app/
        ├── config/
        │   └── google-drive.config.ts
        ├── rosita/
        │   ├── components/          # Componentes Standalone (vistas independientes y modales)
        │   │   ├── dashboard/
        │   │   ├── chats-list/
        │   │   ├── chat-modal/
        │   │   └── ...
        │   ├── facades/             # Capa de abstracción de estado reactivo
        │   │   ├── chats.facade.ts
        │   │   └── dashboard.facade.ts
        │   └── rosita.component.ts
        ├── services/                # Clientes HTTP dedicados para APIs externas e internas
        │   ├── chat.service.ts
        │   └── google-drive.service.ts
        └── environments/

```

---

## ⚙️ Servicios e Integraciones

### 🔒 SSH Tunnel Service

Componente encargado de establecer un puente seguro con la base de datos MariaDB remota antes de inicializar el pool de conexiones de la aplicación. Cuenta con políticas de reconexión automática y comprobación de estado (*health checks*) a intervalos regulares.

### 🤖 Botpress Integration

Conexión directa con Botpress Cloud API para la extracción de logs de chat, envío de interacciones manuales y depuración de flujos. El dashboard sincroniza y procesa periódicamente esta información para la toma de decisiones.

### 🔔 Notificaciones Push (OneSignal)

Mapeo e interacción con la API REST de OneSignal para segmentar, programar y lanzar notificaciones directas a los clientes registrados en la base de datos de mensajería.

### 📁 Google Drive API

Módulo que permite la exportación directa de bases de datos de inscritos hacia hojas de cálculo mediante la integración nativa de Google Picker API y autenticación segura basada en OAuth2 GIS.

---

## 🛠 Tech Stack

| Capa | Tecnología |
| --- | --- |
| **Frontend** | Angular (v15+) + Tailwind CSS + SCSS |
| **Arquitectura Frontend** | Standalone Components + Patrón Facade |
| **Gestión de Estado** | Reactivo con `BehaviorSubject` |
| **Backend** | Node.js + Express (ES Modules) |
| **Base de Datos** | MariaDB |
| **Acceso a Datos** | `mysql2/promise` (Consultas preparadas de alto rendimiento) |
| **Mensajería e IA** | Botpress Cloud API |
| **Notificaciones** | OneSignal REST API |
| **Reportes** | Google Drive API + XLSX Integration |

---

*Desarrollado para la optimización de procesos de comunicación y gestión comunitaria digital.*

```

```
## Link Vercel

https://rosita-ochre.vercel.app/

## Preview

<img width="764" height="448" alt="image" src="https://github.com/user-attachments/assets/b16f457c-799c-440a-9ea3-5f9a2ab6a86f" />
<img width="766" height="457" alt="image" src="https://github.com/user-attachments/assets/279d05a7-1c8f-4000-974b-e1156d9e2024" />
<img width="963" height="499" alt="image" src="https://github.com/user-attachments/assets/08a4d2e7-e9b6-4b32-a80f-73d2dd17c730" />
<img width="680" height="264" alt="image" src="https://github.com/user-attachments/assets/80d94207-4dbf-44e9-925c-103709912916" />
<img width="817" height="457" alt="image" src="https://github.com/user-attachments/assets/ef01fb06-f9f2-4bad-bd1a-4ebd009f8db8" />
<img width="720" height="531" alt="image" src="https://github.com/user-attachments/assets/60453be0-6914-4f5c-af47-c9524386571e" />
<img width="713" height="441" alt="image" src="https://github.com/user-attachments/assets/5fa956da-6c76-4ee7-9aad-c3efce1ef300" />
<img width="686" height="433" alt="image" src="https://github.com/user-attachments/assets/54384a5b-0225-49c8-9985-01daa071af26" />
<img width="806" height="512" alt="image" src="https://github.com/user-attachments/assets/8c9a4df5-2b85-456e-875e-be9ace8a0cc0" />
<img width="921" height="576" alt="image" src="https://github.com/user-attachments/assets/a9df2884-6379-4bac-9a8a-65c3f2ac7272" />
<img width="974" height="558" alt="image" src="https://github.com/user-attachments/assets/622a916e-1df5-4bbd-8bba-67df796b9b8a" />
<img width="833" height="462" alt="image" src="https://github.com/user-attachments/assets/1487856f-cbb0-44f9-80b7-3e8d5ae1788f" />











