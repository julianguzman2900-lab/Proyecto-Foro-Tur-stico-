const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Booking = require('../models/Booking');
const Complaint = require('../models/Complaint');
const Tour = require('../models/Tour');

// =============================================
// AUTENTICACIÓN
// =============================================

exports.getLogin = (req, res) => {
  res.render('login', { error: req.session.error, success: req.session.success });
  req.session.error = null;
  req.session.success = null;
};

exports.postRegister = async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    req.session.error = 'Todos los campos son obligatorios.';
    return res.redirect('/login');
  }

  try {
    const existing = await User.findByEmail(email);
    if (existing) {
      req.session.error = 'El correo electrónico ya está registrado.';
      return res.redirect('/login');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const status = role === 'seller' ? 'pending' : 'approved';

    await User.create({ name, email, password: hashedPassword, role, status });

    req.session.success = role === 'seller'
      ? 'Registro exitoso. Tu cuenta de vendedor está en revisión por el administrador.'
      : 'Registro exitoso. Ya puedes iniciar sesión.';

    res.redirect('/login');
  } catch (error) {
    console.error(error);
    req.session.error = 'Error en el servidor al registrar el usuario.';
    res.redirect('/login');
  }
};

exports.postLogin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    req.session.error = 'Ingresa correo y contraseña.';
    return res.redirect('/login');
  }

  try {
    const user = await User.findByEmail(email);
    if (!user) {
      req.session.error = 'Credenciales incorrectas.';
      return res.redirect('/login');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      req.session.error = 'Credenciales incorrectas.';
      return res.redirect('/login');
    }

    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status
    };

    res.redirect('/');
  } catch (error) {
    console.error(error);
    req.session.error = 'Error al iniciar sesión.';
    res.redirect('/login');
  }
};

exports.logout = (req, res) => {
  req.session.destroy(() => res.redirect('/'));
};

// =============================================
// RESERVAS
// =============================================

exports.createBooking = async (req, res) => {
  const { tour_id, date, spots } = req.body;
  const user_id = req.session.user.id;

  if (!tour_id || !date || !spots) {
    req.session.error = 'Todos los campos son necesarios para la reserva.';
    return res.redirect('back');
  }

  const spotsNum = parseInt(spots);
  if (spotsNum <= 0) {
    req.session.error = 'La cantidad de cupos debe ser mayor a 0.';
    return res.redirect('back');
  }

  try {
    const tour = await Tour.findById(tour_id);
    if (!tour) {
      req.session.error = 'El tour no existe.';
      return res.redirect('back');
    }

    if (tour.status !== 'approved') {
      req.session.error = 'Este tour no está disponible para reservas.';
      return res.redirect('back');
    }

    if (tour.spots_available < spotsNum) {
      req.session.error = `Lo sentimos, solo quedan ${tour.spots_available} cupos disponibles.`;
      return res.redirect('back');
    }

    await Booking.create({ user_id, tour_id, tour_title: tour.title, date, spots: spotsNum });

    tour.spots_available -= spotsNum;
    await tour.save();

    req.session.success = `¡Tu reserva para "${tour.title}" se ha confirmado exitosamente!`;
    res.redirect('/mis-reservas');
  } catch (error) {
    console.error(error);
    req.session.error = 'Ocurrió un error al procesar tu reserva. Inténtalo de nuevo.';
    res.redirect('back');
  }
};

exports.getMisReservas = async (req, res) => {
  const user_id = req.session.user.id;

  try {
    const bookings = await Booking.findByUserId(user_id);

    const bookingsWithTourInfo = [];
    for (const booking of bookings) {
      const tour = await Tour.findById(booking.tour_id);

      let locationAddress = 'Ubicación no especificada';
      let googleMapsUrl = '#';
      let wazeUrl = '#';

      if (tour) {
        locationAddress = `${tour.city}, ${tour.country}`;
        const query = encodeURIComponent(`${tour.title}, ${tour.city}, ${tour.country}`);
        googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;
        wazeUrl = `https://waze.com/ul?q=${query}`;
      }

      bookingsWithTourInfo.push({
        ...booking,
        tourExists: !!tour,
        location: locationAddress,
        googleMapsUrl,
        wazeUrl,
        price: tour ? tour.price : 0
      });
    }

    res.render('my-bookings', {
      bookings: bookingsWithTourInfo,
      user: req.session.user,
      error: req.session.error,
      success: req.session.success
    });
    req.session.error = null;
    req.session.success = null;
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al cargar tus reservas.');
  }
};

// =============================================
// QUEJAS Y SUGERENCIAS
// =============================================

exports.getQuejas = async (req, res) => {
  const user = req.session.user;

  try {
    const complaints = user.role === 'user'
      ? await Complaint.findByUserId(user.id)
      : await Complaint.findAll();

    res.render('complaints', {
      complaints,
      user,
      error: req.session.error,
      success: req.session.success
    });
    req.session.error = null;
    req.session.success = null;
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al cargar la sección de quejas y sugerencias.');
  }
};

exports.createQueja = async (req, res) => {
  const { subject, message } = req.body;
  const user_id = req.session.user.id;

  if (!subject || !message) {
    req.session.error = 'Todos los campos son necesarios.';
    return res.redirect('/quejas');
  }

  try {
    await Complaint.create({ user_id, subject, message });
    req.session.success = 'Tu queja/sugerencia ha sido enviada. Un administrador o proveedor te responderá pronto.';
    res.redirect('/quejas');
  } catch (error) {
    console.error(error);
    req.session.error = 'Error al enviar la sugerencia.';
    res.redirect('/quejas');
  }
};

exports.responderQueja = async (req, res) => {
  const { id } = req.params;
  const { reply } = req.body;
  const user = req.session.user;

  if (!reply) {
    req.session.error = 'La respuesta no puede estar vacía.';
    return res.redirect('/quejas');
  }

  try {
    await Complaint.updateReply(id, reply, user.name);
    req.session.success = 'Respuesta enviada correctamente.';
    res.redirect('/quejas');
  } catch (error) {
    console.error(error);
    req.session.error = 'Error al registrar la respuesta.';
    res.redirect('/quejas');
  }
};
