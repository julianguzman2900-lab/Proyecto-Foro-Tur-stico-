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

<outopu_format>
Por favor, muestra la respuesta de la siguiente manera
1. El código completo dentro de un bloque limpio para poder copiarlo.
2. Una explicación muy corta y con palabras sencillas de cómo funciona el programa
3. sugerencias de cambio 
4. me vas a dar un archivo ordenado de la manera en que te dare en la captura de pantalla
</outopu_format>