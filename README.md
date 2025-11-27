# Sistema de Reservaciones - Lupara.

Este es un sistema de reservaciones desarrollado con Node.js y Express.js, y diseñado bajo una Arquitectura de Tres Capas con un enfoque en seguridad (doble base de datos) y enfocado a controladores y servicios.

## Arquitectura y Estructura

El proyecto sigue una **Arquitectura de Tres Capas** con separación responsabilidades (SoC).

| Capa                     | Responsabilidad                         | Tecnologías                           |
| :----------------------- | :-------------------------------------- | :------------------------------------ |
| **Presentación**         | Interfaz de Usuario y Lógica de Vista.  | HTML, JavaScript jQuery, Tailwind CSS |
| **Aplicación (Backend)** | Lógica de Negocio, API REST, Seguridad. | Node.js, Express.js                   |
| **Datos**                | Persistencia de Información.            | MariaDB (Doble Instancia)             |

---

### Estructura del Backend (`/api`)

El backend utiliza el patrón **Controller-Service-DataHandler** :

1.  **`/controllers`**: Reciben peticiones HTTP (req, res), validan inputs, y llaman a los Servicios. **No contienen lógica de negocio.**
2.  **`/services`**: Contienen toda la Lógica de Negocio. Interactúan con el `QueryHandler`.
3.  **`/config`**: Configuración de la aplicación (conexión a MariaDB).
4.  **`/utils`**: Utilidades generales:
    - `QueryHandler.js`: Abstracción para **consultas preparadas** (seguridad contra Inyección SQL).
    - `Logger.js`: Clase centralizada para el registro de eventos y errores.

### Seguridad y Base de Datos

Se utiliza una estrategia de **Doble Base de Datos (MariaDB)** para una mayor seguridad y aislamiento:

- **DB AUTH**: Almacena exclusivamente información sensible de **Usuarios** (credenciales, permisos).
- **DB MAIN**: Almacena todos los **Datos de Reservaciones** y la lógica de negocio (Empresas, Reservas, Horarios).

---

## Tecnologías Utilizadas

### Backend y Despliegue

| Rol               | Tecnología    | Propósito Específico                                                     |
| :---------------- | :------------ | :----------------------------------------------------------------------- |
| **Plataforma**    | Node.js       | Entorno de ejecución asíncrono.                                          |
| **Framework**     | Express.js    | Creación de la API REST.                                                 |
| **Base de Datos** | MariaDB       | Sistema de gestión de bases de datos relacional.                         |
| **Driver/ORM**    | `mariadb`     | Conexión directa y uso de Pools para la BD.                              |
| **Hosting**       | Vercel        | Despliegue como _Serverless Function_ y _Hosting_ estático del Frontend. |
| **Hash**          | Bcrypt        | Hash de password para la seguridad en la BD.                             |
| **Auth**          | JWT           | Envio de informacion sencible del usuario.                               |
| **Session**       | Cookie-Parser | Sesiones activas para los usuarios.                                      |

### Frontend

| Rol            | Tecnología        | Propósito Específico                                          |
| :------------- | :---------------- | :------------------------------------------------------------ |
| **Estructura** | HTML              | Marcado de la interfaz.                                       |
| **Lógica**     | JavaScript jQuery | Manipulación del DOM y manejo de peticiones a la API.         |
| **Diseño**     | Tailwind CSS      | Framework CSS de utilidad para el diseño responsivo y rápido. |

### Prerequisitos

- Node.js (versión 16 o superior)
- Una instancia de MariaDB (o un Docker, pero ahorita no).

### Instalación

1.  Clona este repositorio:
    ```bash
    git clone https://github.com/IngMiranda/IngenieriaSoftware.git
    cd IngenieriaSoftware
    ```
2.  Instala las dependencias del Backend:
    ```bash
    npm install
    ```
3.  Crea tu archivo `.env` en la raíz del proyecto y configúralo

### Desarrollo

Para iniciar el servidor en modo de desarrollo (con `nodemon`):

```bash
npm run dev
```

### Notas

Si cuentas con probleas con los logs, procura otorgar los permisos correspondientes para crear y escribir en archivos de tu sistema de directorios.

### Ramas / Versionamiento

Sujeto a cambios

- **Main**: Principal
- **Developer**: De aqui parten las siguientes ramas
- **Vista1/nombre**: Pantalla de Fronted
- **Vista2/nombre**: Pantalla de Fronted
- **Vista3/nombre**: Pantalla de Fronted
- **Vista4/nombre**: Pantalla de Fronted
- **Vista5/nombre**: Pantalla de Fronted
- **Vista6/nombre**: Pantalla de Fronted
- **Componentes/nombre**: Componentes a usar en Front (Selects, Botones, etc.).
- **Servicios1/nombre**: Tres servicios de tres pantallas.
- **Servicios2/nombre**: Tres servicios de tres pantallas.
- **DemasAPI/nombre**: Controladores, index, enrutamientos, sesiones, etc.

### Para configurar su git

```bash
 - git config --global user.email 'tu_correo@gmail.com'
 - git config --global user.name 'tu_usuario'
```

## Pasos para crear tu rama en el proyecto

### Para quienes ya lo clonaron

- Borrar la carpeta que hicieron en la clase para que comiencen de nuevo bien

### Para todos

- Crear una carpeta en el escritorio llamada **"proyecto"**
- Click derecho en la carpeta y seleccionar **"Open with Git Bash here"** **(se te abrira el git bash)**
- Escrbir en git bash el comando

```bash
  git clone https://github.com/IngMiranda/IngenieriaSoftware.git
```

- Se debe de ver como si se descargara algo
- Escrbir en git bash el comando
  cd IngenieriaSoftware
- En caso de que no entre, darle click derecho a la carpeta que se acaba de descargar y seleccionar **"Open with Git Bash here"**
- Para identificar que ya estan dentro de la carpeta revisen la bash ya que les coloca en color la ruta en donde se encuentran y ademas deberia de terminar en la palabra **"main"**
- Escrbir en git bash el comando para cambiar a la rama developer
  git switch developer
- Escribir en git bash el comando para crear una nueva rama saliente de developer **(cambiar juan por su nombre en minusculas)**

```bash
  git branch juan
```

- Escrbir en git bash el comando para cambiar a la rama developer **(cambiar juan por su nombre en minusculas)**

```bash
  git switch juan
```

### Para todos

Ahora ya debes de tener tu repositorio clonado y para poder trabajar, vamos a probarlo

- Hay una carpeta llamada **"docs"**, en ella crearan una carpeta a la que le pondran su nombre en minusculas
- Dentro de la carpeta que acabas de crear, ahora crea un archivo nombrado **"tu_nombre.sh"**
- Dentro del archivo escribir lo siguiente

```bash
#!/bin/bash
echo "Hello World"
```

- Lo guardas y escriben los siguientes comando por separado **(escribes un comando y das enter, luego el que sigue)**, cambiar juan por su nombre en minusculas

```bash
  git add .
  git commit -m "Test Repo"
  git push -u origin juan
```