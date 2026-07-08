const Tour = require('../models/Tour');
const Comment = require('../models/Comment');
const Booking = require('../models/Booking');

// =============================================
// VALIDACIÓN DE TEXTO (auxiliar interna)
// =============================================
function isValidText(text) {
  const regex = /^[a-zA-Z0-9\s.,áéíóúÁÉÍÓÚñÑüÜ¡!¿?()\-#]+$/;
  return regex.test(text);
}

// =============================================
// TOURS - FORO PÚBLICO
// =============================================

exports.getTours = async (req, res) => {
  try {
    const { search, continent, country, city, activity, duration, difficulty } = req.query;
    let query = { status: 'approved', activity_date: { $gte: new Date() } };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (continent) query.continent = { $regex: `^${continent}$`, $options: 'i' };
    if (country) query.country = { $regex: `^${country}$`, $options: 'i' };
    if (city) query.city = { $regex: `^${city}$`, $options: 'i' };
    if (activity) query.activity = { $regex: `^${activity}$`, $options: 'i' };
    if (duration) query.duration = { $regex: duration, $options: 'i' };
    if (difficulty) query.difficulty = difficulty;

    const tours = await Tour.find(query).sort({ created_at: -1 });

    res.render('index', {
      tours,
      filters: req.query,
      user: req.session.user,
      error: req.session.error,
      success: req.session.success
    });
    req.session.error = null;
    req.session.success = null;
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al cargar la página principal.');
  }
};

exports.getTourDetalle = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    if (!tour) {
      req.session.error = 'El tour solicitado no existe.';
      return res.redirect('/');
    }

    const comments = await Comment.find({ tour_id: tour._id }).sort({ created_at: -1 });

    const avgRating = comments.length > 0
      ? (comments.reduce((sum, c) => sum + c.rating, 0) / comments.length).toFixed(1)
      : null;

    const recommendations = await Tour.find({
      status: 'approved',
      activity_date: { $gte: new Date() },
      country: tour.country,
      _id: { $ne: tour._id }
    }).limit(4);

    let canComment = false;
    if (req.session.user) {
      const user_id = req.session.user.id;
      const completedBookings = await Booking.findCompletedBookings(user_id, tour._id.toString());
      const commentsCount = await Comment.countDocuments({ user_id, tour_id: tour._id });
      canComment = completedBookings.length > 0 && commentsCount < completedBookings.length;
    }

    res.render('tour', {
      tour,
      comments,
      avgRating,
      recommendations,
      user: req.session.user,
      canComment,
      error: req.session.error,
      success: req.session.success
    });
    req.session.error = null;
    req.session.success = null;
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al cargar los detalles del tour.');
  }
};

exports.createTour = async (req, res) => {
  const { title, description, continent, country, city, activity, duration, difficulty, price, spots_total, contact_info, start_address, coordinates, activity_date } = req.body;

  if (!title || !description || !continent || !country || !city || !activity || !duration || !difficulty || !price || !spots_total || !contact_info || !start_address || !activity_date) {
    req.session.error = 'Todos los campos son obligatorios (incluyendo dirección de inicio y fecha de actividad).';
    return res.redirect('/vendedor/dashboard');
  }

  const isLink = /^(https?:\/\/)?(www\.)?(google\.com\/maps|maps\.google\.com|maps\.app\.goo\.gl|goo\.gl\/maps|http|www|\.gl)/i.test(start_address.trim());
  if (isLink) {
    const isGoogleMaps = /^(https?:\/\/)?(www\.)?(google\.com\/maps|maps\.google\.com|maps\.app\.goo\.gl|goo\.gl\/maps)/i.test(start_address.trim());
    if (!isGoogleMaps) {
      req.session.error = 'Si ingresas un enlace en la dirección de inicio, debe ser un link válido de Google Maps.';
      return res.redirect('/vendedor/dashboard');
    }
  }

  if (!isValidText(title)) {
    req.session.error = 'El título contiene caracteres no permitidos (solo letras, números y signos de puntuación).';
    return res.redirect('/vendedor/dashboard');
  }

  if (!isValidText(description)) {
    req.session.error = 'La descripción contiene caracteres no permitidos.';
    return res.redirect('/vendedor/dashboard');
  }

  const images = req.files && req.files.length > 0
    ? req.files.map(file => file.path && file.path.startsWith('http') ? file.path : '/uploads/' + file.filename)
    : [];

  if (images.length === 0) {
    req.session.error = 'Debes subir al menos una imagen para la publicación.';
    return res.redirect('/vendedor/dashboard');
  }

  try {
    const newTour = new Tour({
      seller_id: req.session.user.id,
      seller_name: req.session.user.name,
      title, description, continent, country, city, activity, duration, difficulty,
      price: parseFloat(price),
      spots_total: parseInt(spots_total),
      spots_available: parseInt(spots_total),
      images, contact_info,
      start_address,
      coordinates: coordinates || '',
      activity_date: new Date(activity_date),
      status: 'pending'
    });

    await newTour.save();
    req.session.success = 'La publicación del tour ha sido creada y enviada a revisión.';
    res.redirect('/vendedor/dashboard');
  } catch (error) {
    console.error(error);
    req.session.error = 'Error al crear la publicación.';
    res.redirect('/vendedor/dashboard');
  }
};

exports.editTour = async (req, res) => {
  const { id } = req.params;
  const { title, description, continent, country, city, activity, duration, difficulty, price, spots_total, contact_info, start_address, coordinates, activity_date } = req.body;

  try {
    const tour = await Tour.findById(id);
    if (!tour) {
      req.session.error = 'El tour no existe.';
      return res.redirect('/');
    }

    const isAdmin = req.session.user.role === 'admin';
    const isOwner = req.session.user.id === tour.seller_id;

    if (!isAdmin && !isOwner) {
      req.session.error = 'No tienes permiso para editar esta publicación.';
      return res.redirect('/');
    }

    if (!isAdmin && tour.status === 'approved') {
      req.session.error = 'No puedes modificar una publicación aprobada.';
      return res.redirect('/vendedor/dashboard');
    }

    if (!start_address || !activity_date) {
      req.session.error = 'La dirección de inicio y la fecha de actividad son obligatorias.';
      return res.redirect(isAdmin ? '/admin/dashboard' : '/vendedor/dashboard');
    }

    const isLinkVal = /^(https?:\/\/)?(www\.)?(google\.com\/maps|maps\.google\.com|maps\.app\.goo\.gl|goo\.gl\/maps|http|www|\.gl)/i.test(start_address.trim());
    if (isLinkVal) {
      const isGoogleMapsVal = /^(https?:\/\/)?(www\.)?(google\.com\/maps|maps\.google\.com|maps\.app\.goo\.gl|goo\.gl\/maps)/i.test(start_address.trim());
      if (!isGoogleMapsVal) {
        req.session.error = 'Si ingresas un enlace en la dirección de inicio, debe ser un link válido de Google Maps.';
        return res.redirect(isAdmin ? '/admin/dashboard' : '/vendedor/dashboard');
      }
    }

    if (!isValidText(title) || !isValidText(description)) {
      req.session.error = 'El título o la descripción contienen caracteres no válidos.';
      return res.redirect(isAdmin ? '/admin/dashboard' : '/vendedor/dashboard');
    }

    const diffSpots = parseInt(spots_total) - tour.spots_total;
    tour.title = title;
    tour.description = description;
    tour.continent = continent;
    tour.country = country;
    tour.city = city;
    tour.activity = activity;
    tour.duration = duration;
    tour.difficulty = difficulty;
    tour.price = parseFloat(price);
    tour.contact_info = contact_info;
    tour.start_address = start_address;
    tour.coordinates = coordinates || '';
    tour.activity_date = new Date(activity_date);
    tour.spots_total = parseInt(spots_total);
    tour.spots_available = Math.max(0, tour.spots_available + diffSpots);

    if (req.files && req.files.length > 0) {
      req.files.forEach(file => tour.images.push(file.path && file.path.startsWith('http') ? file.path : '/uploads/' + file.filename));
    }

    if (!isAdmin) {
      tour.status = 'pending';
      tour.rejection_reason = '';
    }

    await tour.save();
    req.session.success = 'La publicación ha sido actualizada.';
    res.redirect(isAdmin ? '/admin/dashboard' : '/vendedor/dashboard');
  } catch (error) {
    console.error(error);
    req.session.error = 'Error al actualizar el tour.';
    res.redirect('/');
  }
};

exports.deleteTour = async (req, res) => {
  const { id } = req.params;
  try {
    const tour = await Tour.findById(id);
    if (!tour) {
      req.session.error = 'El tour no existe.';
      return res.redirect('/');
    }

    const isAdmin = req.session.user.role === 'admin';
    const isOwner = req.session.user.id === tour.seller_id;

    if (!isAdmin && !isOwner) {
      req.session.error = 'No tienes permisos para eliminar este tour.';
      return res.redirect('/');
    }

    await Tour.deleteOne({ _id: tour._id });
    await Comment.deleteMany({ tour_id: tour._id });

    req.session.success = 'El tour y sus comentarios han sido eliminados.';
    res.redirect(isAdmin ? '/admin/dashboard' : '/vendedor/dashboard');
  } catch (error) {
    console.error(error);
    req.session.error = 'Error al eliminar el tour.';
    res.redirect('/');
  }
};

// =============================================
// COMENTARIOS
// =============================================

exports.createComentario = async (req, res) => {
  const { tour_id, rating, comment } = req.body;
  const user = req.session.user;

  if (!tour_id || !rating || !comment) {
    req.session.error = 'La calificación y el comentario son requeridos.';
    return res.redirect(req.get('Referrer') || '/');
  }

  try {
    const completedBookings = await Booking.findCompletedBookings(user.id, tour_id);
    const commentsCount = await Comment.countDocuments({ user_id: user.id, tour_id });

    if (completedBookings.length === 0) {
      req.session.error = 'Solo quienes participaron en la actividad y finalizaron su reserva pueden dejar una reseña.';
      return res.redirect(req.get('Referrer') || '/');
    }

    if (commentsCount >= completedBookings.length) {
      req.session.error = 'No puedes publicar más de una reseña por cada reserva completada.';
      return res.redirect(req.get('Referrer') || '/');
    }

    const photos = req.files && req.files.length > 0
      ? req.files.map(file => file.path && file.path.startsWith('http') ? file.path : '/uploads/' + file.filename)
      : [];

    const newComment = new Comment({
      tour_id,
      user_id: user.id,
      user_name: user.name,
      rating: parseInt(rating),
      comment,
      photos
    });

    await newComment.save();
    req.session.success = 'Comentario publicado con éxito.';
    res.redirect(`/tour/${tour_id}`);
  } catch (error) {
    console.error(error);
    req.session.error = 'Error al publicar el comentario.';
    res.redirect(req.get('Referrer') || '/');
  }
};

exports.editComentario = async (req, res) => {
  const { id } = req.params;
  const { rating, comment } = req.body;

  try {
    const commentObj = await Comment.findById(id);
    if (!commentObj) {
      req.session.error = 'El comentario no existe.';
      return res.redirect(req.get('Referrer') || '/');
    }

    const isAdmin = req.session.user.role === 'admin';
    const isOwner = req.session.user.id === commentObj.user_id;

    if (!isAdmin && !isOwner) {
      req.session.error = 'No tienes permiso para editar este comentario.';
      return res.redirect(req.get('Referrer') || '/');
    }

    commentObj.rating = parseInt(rating);
    commentObj.comment = comment;

    if (req.files && req.files.length > 0) {
      req.files.forEach(file => commentObj.photos.push(file.path && file.path.startsWith('http') ? file.path : '/uploads/' + file.filename));
    }

    await commentObj.save();
    req.session.success = 'Comentario actualizado.';
    res.redirect(`/tour/${commentObj.tour_id}`);
  } catch (error) {
    console.error(error);
    req.session.error = 'Error al editar el comentario.';
    res.redirect(req.get('Referrer') || '/');
  }
};

exports.deleteComentario = async (req, res) => {
  const { id } = req.params;
  try {
    const commentObj = await Comment.findById(id);
    if (!commentObj) {
      req.session.error = 'El comentario no existe.';
      return res.redirect(req.get('Referrer') || '/');
    }

    const isAdmin = req.session.user.role === 'admin';
    const isOwner = req.session.user.id === commentObj.user_id;

    if (!isAdmin && !isOwner) {
      req.session.error = 'No tienes permiso para eliminar este comentario.';
      return res.redirect(req.get('Referrer') || '/');
    }

    await Comment.deleteOne({ _id: commentObj._id });
    req.session.success = 'Comentario eliminado.';
    res.redirect(req.get('Referrer') || '/');
  } catch (error) {
    console.error(error);
    req.session.error = 'Error al eliminar el comentario.';
    res.redirect(req.get('Referrer') || '/');
  }
};

exports.finalizeTour = async (req, res) => {
  const { id } = req.params;
  try {
    const tour = await Tour.findById(id);
    if (!tour) {
      req.session.error = 'El tour no existe.';
      return res.redirect(req.get('Referrer') || '/');
    }

    const isAdmin = req.session.user.role === 'admin';
    const isOwner = req.session.user.id === tour.seller_id;

    if (!isAdmin && !isOwner) {
      req.session.error = 'No tienes permiso para finalizar esta actividad.';
      return res.redirect(req.get('Referrer') || '/');
    }

    tour.status = 'finished';
    await tour.save();
    req.session.success = 'La actividad ha sido marcada como Finalizada.';
    res.redirect(req.get('Referrer') || '/');
  } catch (error) {
    console.error(error);
    req.session.error = 'Error al finalizar la actividad.';
    res.redirect(req.get('Referrer') || '/');
  }
};
