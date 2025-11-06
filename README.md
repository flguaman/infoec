# InfoEc - Panel de Indicadores Financieros

InfoEc es una aplicación web construida con Next.js y Firebase que proporciona una plataforma para visualizar y administrar indicadores financieros clave de instituciones en Ecuador.

## Características Principales

- **Panel Público:** Una página de inicio accesible para todos los usuarios que muestra y compara los indicadores financieros de las instituciones listadas a través de gráficos interactivos.
- **Panel de Administración Seguro:** Un área protegida por contraseña donde un administrador puede agregar, editar y eliminar instituciones y sus datos financieros.
- **Visualización de Datos:** Gráficos de barras dinámicos para comparar indicadores como solvencia, liquidez y morosidad entre instituciones.
- **Base de Datos en Tiempo Real:** Utiliza Firestore de Firebase para almacenar y sincronizar los datos, permitiendo que las actualizaciones en el panel de admin se reflejen instantáneamente.

## Stack Tecnológico

- **Framework:** [Next.js](https://nextjs.org/) (con App Router)
- **Base de Datos y Autenticación:** [Firebase](https://firebase.google.com/) (Firestore y Firebase Authentication)
- **UI y Estilos:** [Tailwind CSS](https://tailwindcss.com/) y [ShadCN UI](https://ui.shadcn.com/) para componentes.
- **Gráficos:** [Recharts](https://recharts.org/)
- **Lenguaje:** TypeScript

## Cómo Empezar

### Prerrequisitos

- Node.js (v18 o superior)
- npm o yarn

### Instalación y Ejecución

1.  **Clonar el repositorio:**
    ```bash
    git clone <URL_DEL_REPOSITORIO>
    cd <NOMBRE_DEL_DIRECTORIO>
    ```

2.  **Instalar dependencias:**
    ```bash
    npm install
    ```

3.  **Ejecutar el proyecto en modo de desarrollo:**
    El servidor de desarrollo se iniciará en `http://localhost:9002`.
    ```bash
    npm run dev
    ```

## Acceso al Panel de Administración

Para acceder al panel de administración, utiliza las siguientes credenciales de demostración en la página de login:

- **Email:** `admin@infoec.com`
- **Contraseña:** `password123`

Si la cuenta no existe, la aplicación la creará automáticamente la primera vez que intentes iniciar sesión con estas credenciales.
