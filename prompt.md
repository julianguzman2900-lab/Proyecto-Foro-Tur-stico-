<role>
Actúa como un programador experto en JavaScript, node.js, mysql,mongoDB, html, css
</role>

<context>
Estoy realizando un proyecto sobre Un sitio tipo foro donde los vendedores de viajes, crean un foro con promociones de acvitividades, descripcion, fotos, precio, direccion. etc. Los usuarios votan comentan sobre ese tour, pueden agregar fotos.El post debe de tener categorias para posterior hacer un filtro por pais, ciudad, actividad, duracion, dificultad. Un espacio para contactar al proveedor. El usuario puede buscar diferentes tours. Va a tener un apartado el usuario de calendario o de mis reservas, donde sale qué reservas tiene, qué dias y la dirección. Donde tenga una opcion donde diga "ir",  redirija a waze o google maps. Los usurios deben estar registrados par poder realizar la reservacion de un servicio de algun proveedor.El foro admite publicaiones de proveedores de todo el mundo, pero debe de existir un filtro en el cual los tours se ordenen por continente, y si existen mas viajes del mismo pais deben de salir recomendados al momento de estar viendo un tour de ese mismo pais sin importar el proveedor del tour.los vendedores tambien deben estar registrados en el apartado de vendedor, el registro del vendedor debe ser aprovado por el administrador, el administrador debe tener la facultad de aceptar y rechazar las publicaciones que puedan realizar los vendedores  en el foro, el usurio tiene libre expresion pero sin insultar, ofender, o publicar cosas que no tengan que ver con los viajes . sin romper las reglas de la plataforma. Debe existir un apartado para las quejas y sugerencias de los usuarios y el administrador y vendedores puedan verlas y responder. el administrador puede editar, eliminar, responder cualquier publicacion que se realice en el foro. el vendedor debe poder ver el estado de sus publicaciones, publicada en revision y rechazada y que se le de una descripcion del motivo del rechazo, y el admin tambien debe tener el campo obligatorio del por que el rechazo
<task>
1.  quiero que realices un codigo de una pagina web  donde permita realizar reservaciones a diferentes tipos de tours y actividades turisticas.
2.  los usuarios deben estar registrados par poder realizar la reservacion de un servicio de algun proveedor.el registro del vendedor debe ser aprovado por el administrador
3.    quiero que crees una base de datos en mysql y tambien en mongoDB donde se guardaran los datos de este apartado y conectala al programa, debes de identificar que datos son mejor para estar en MYSQL y cuales en MongoDB.ademas de mostrarme como estan conectadas ambas bases de datos en el programa.
4. comprobar que los datos ingresados en la descripcion y el titulo de la publicacion del vendedor  sean validos, permite el ingreso de numeros y letras 
5. que permita subir fotos en la publicacion del vendedor
 6. en el apartado del panel de administrador quiero que despues de auditatar la publicacion del vendedor y darla por finalizada se modifique el estado en la base de datos y en el panel de administrador  
 7. utiliza, express.js, node.js, mysql, mongoDB, html, css,  ejs, vervcel blob
</task>

<constrains>
* Los usuarios deben registrarse para poder realizar reservaciones y comentar en los tours.
* Los vendedores deben registrarse en el apartado correspondiente para publicar tours y actividades.
* Cada publicación debe contener un título, descripción, categoría, ubicación, precio y al menos una imagen.
* Las publicaciones realizadas por los vendedores deberán ser revisadas por un administrador antes de ser visibles en el foro.
* El administrador podrá aprobar o rechazar las publicaciones y el estado deberá actualizarse en el sistema.
* En caso de rechazo, el administrador deberá indicar el motivo para que el vendedor pueda visualizarlo.
* Los tours podrán filtrarse por continente, país, ciudad, actividad, duración y dificultad.
* Los usuarios podrán realizar reservaciones y visualizar sus reservas en un calendario.
* Cada reserva mostrará la ubicación del tour y permitirá abrir la ruta en Google Maps o Waze.
* Los usuarios podrán comentar, calificar y subir fotografías relacionadas con el tour realizado.
* El sistema mostrará recomendaciones de otros tours del mismo país cuando un usuario consulte una publicación.
* Los vendedores podrán consultar el estado de sus publicaciones (En revisión, Aprobada o Rechazada).
*El administrador podrá editar, responder y eliminar cualquier publicación o comentario del foro.
*El sistema almacenará la información utilizando MySQL y MongoDB, asignando cada tipo de información a la base de datos más adecuada.
*Una reserva solo puede realizarse si existen cupos disponibles.
*No se permitirán publicaciones con contenido ofensivo o que no esté relacionado con turismo.
*Los usuarios solo podrán editar o eliminar sus propios comentarios.
*Los vendedores solo podrán modificar publicaciones que aún no hayan sido aprobadas o que hayan sido rechazadas.
*Una vez confirmada una reserva, el sistema actualizará automáticamente la disponibilidad del tour.
*Los tours se mostrarán filtrados por continente, país, ciudad, actividad, duración y dificultad.
</constrains>

<output_format>

Quiero que todas las respuestas sigan exactamente este formato:

1. Código completo
   - Entrega el código completo dentro de bloques Markdown (```lenguaje```) para poder copiarlo directamente.
   - No omitas archivos ni partes del código.
   - Si modificas un archivo, entrégalo completo.

2. Archivo de explicación
   - Crea un archivo llamado `explicacion.md`.
   - En este archivo explica de forma sencilla:
     - Qué se implementó.
     - Cómo funciona.
     - Qué archivos fueron creados o modificados.
     - Cómo probar la funcionalidad.
     - Si es necesario ejecutar algún comando adicional.
   - La explicación debe ser clara, breve y fácil de entender.

3. Sugerencias
   - Al final del archivo `explicacion.md` agrega una sección llamada **"Sugerencias de mejora"** con entre 3 y 5 recomendaciones para futuras versiones.
   - No implementes esas mejoras a menos que yo las solicite.

4. Estructura del proyecto
   - Organiza todos los archivos siguiendo exactamente la estructura de carpetas que te proporcionaré en una captura de pantalla.
   - Indica la ruta completa donde debe ubicarse cada archivo.
   - Si es necesario crear nuevos archivos o carpetas, hazlo respetando esa estructura.
   - Nunca cambies los nombres de las carpetas existentes sin indicarlo.

5. Compatibilidad
   - Todo el código debe ser compatible con Node.js, Express.js, EJS, MySQL y MongoDB.
   - Mantén el código modular, limpio y fácil de mantener.

6. Importante
   - No elimines funcionalidades existentes.
   - Antes de modificar un archivo, verifica que el cambio no rompa el funcionamiento del proyecto.
   - Si detectas un error, corrígelo y explica brevemente la causa en `explicacion.md`.
   - Si una funcionalidad requiere crear tablas en MySQL o colecciones en MongoDB, genera también los scripts correspondientes.
   - Si agregas dependencias nuevas, indícalas en `explicacion.md` junto con el comando para instalarlas.

   7. Diseño de la interfaz
   - Utiliza un diseño moderno, limpio y minimalista.
   - Mantén una apariencia profesional y enfocada en una plataforma de turismo.
   - Utiliza una paleta de colores consistente en todo el proyecto. La paleta base será:
     - Azul (#2563EB) como color principal.
     - Verde (#10B981) para acciones positivas y confirmaciones.
     - Blanco (#FFFFFF) para fondos principales.
     - Gris claro (#F3F4F6) para fondos secundarios.
     - Gris oscuro (#374151) para textos.
     - Rojo (#EF4444) únicamente para errores o acciones de eliminación.
   - El diseño debe ser completamente responsive para computadoras, tablets y teléfonos móviles.
   - Utiliza sombras suaves, bordes redondeados y suficiente espacio entre los elementos para mejorar la experiencia del usuario.
   - Evita interfaces sobrecargadas, colores excesivos y animaciones innecesarias.
   - Todas las páginas deben mantener el mismo estilo visual y reutilizar componentes cuando sea posible.

</output_format>