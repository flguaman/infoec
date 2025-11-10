# InfoEc - Panel de Indicadores

InfoEc es una aplicación web moderna diseñada para visualizar y administrar indicadores clave de diferentes tipos de instituciones (financieras, educativas, de salud) en Ecuador.

## Arquitectura del Proyecto

El proyecto sigue una arquitectura moderna basada en componentes, utilizando Next.js para el renderizado tanto en el servidor como en el cliente y Firebase para los servicios de backend.

### Frontend

El frontend está construido con un enfoque en la interactividad, la reutilización de componentes y un diseño profesional.

- **Framework:** **Next.js (con App Router)** para una navegación rápida y optimizada, renderizado en el servidor (SSR) y generación de sitios estáticos (SSG).
- **Lenguaje:** **TypeScript** para un código más robusto, seguro y fácil de mantener.
- **UI y Componentes:**
    - **ShadCN UI:** Una colección de componentes de alta calidad y accesibles (botones, tablas, diálogos, etc.) que forman la base de la interfaz.
    - **Tailwind CSS:** Para un diseño altamente personalizable y responsivo, permitiendo una estilización rápida y consistente.
- **Visualización de Datos:** **Recharts** se utiliza para crear los gráficos de barras dinámicos e interactivos que comparan los indicadores de las instituciones.
- **Gestión de Estado:** Se utilizan **React Hooks** (`useState`, `useEffect`, `useMemo`) y la **API de Contexto de React** para gestionar el estado de la aplicación de forma eficiente.

### Backend y Servicios

Se apoya completamente en los servicios gestionados de Firebase, lo que permite un desarrollo rápido y escalable.

- **Base de Datos:** **Cloud Firestore** se utiliza como la base de datos NoSQL en tiempo real. Los datos están organizados en colecciones separadas para cada categoría de institución (`institutions`, `universidades`, `hospitales`), lo que permite consultas eficientes y una estructura organizada.
- **Autenticación:** **Firebase Authentication** gestiona el acceso seguro al panel de administración. Solo los usuarios autenticados (administradores) pueden crear, editar o eliminar datos.
- **Reglas de Seguridad:** Se utilizan **Firestore Security Rules** para proteger los datos. Las reglas están configuradas para permitir lectura pública de todos los datos (para el dashboard principal) pero restringir la escritura únicamente a usuarios autenticados.
