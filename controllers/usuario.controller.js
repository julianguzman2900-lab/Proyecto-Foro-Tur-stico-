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
  const { name, email, password, role, country, company_name } = req.body;

  if (!name || !email || !password || !role) {
    req.session.error = 'Todos los campos son obligatorios.';
    return res.redirect('/login');
  }

  // Validación backend para campos adicionales del vendedor
  if (role === 'seller') {
    if (!country || !company_name) {
      req.session.error = 'País de origen y Nombre de la empresa son obligatorios para vendedores.';
      return res.redirect('/login');
    }
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

    await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      status,
      country: role === 'seller' ? country : null,
      company_name: role === 'seller' ? company_name : null
    });

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

    // Si el usuario se registró con Google y no tiene contraseña, debe usar Google
    if (!user.password && user.google_id) {
      req.session.error = 'Esta cuenta utiliza inicio de sesión con Google. Por favor, haz clic en "Continuar con Google".';
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
      status: user.status,
      country: user.country,
      company_name: user.company_name
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
    return res.redirect(req.get('Referrer') || '/');
  }

  const spotsNum = parseInt(spots);
  if (spotsNum <= 0) {
    req.session.error = 'La cantidad de cupos debe ser mayor a 0.';
    return res.redirect(req.get('Referrer') || '/');
  }
  if (spotsNum > 3) {
    req.session.error = 'El máximo permitido es de 3 personas por reserva.';
    return res.redirect(req.get('Referrer') || '/');
  }

  try {
    const tour = await Tour.findById(tour_id);
    if (!tour) {
      req.session.error = 'El tour no existe.';
      return res.redirect(req.get('Referrer') || '/');
    }

    if (tour.status !== 'approved') {
      req.session.error = 'Este tour no está disponible para reservas.';
      return res.redirect(req.get('Referrer') || '/');
    }

    let targetDateObj = null;
    if (tour.dates && tour.dates.length > 0) {
      targetDateObj = tour.dates.find(d => d.date === date);
      if (!targetDateObj) {
        req.session.error = 'La fecha seleccionada no es válida o no está disponible.';
        return res.redirect(req.get('Referrer') || '/');
      }
      if (targetDateObj.spots_available < spotsNum) {
        req.session.error = `Lo sentimos, solo quedan ${targetDateObj.spots_available} cupos disponibles para esta fecha.`;
        return res.redirect(req.get('Referrer') || '/');
      }
    } else {
      // Legacy fallback
      if (tour.spots_available < spotsNum) {
        req.session.error = `Lo sentimos, solo quedan ${tour.spots_available} cupos disponibles.`;
        return res.redirect(req.get('Referrer') || '/');
      }
    }

    await Booking.create({ user_id, tour_id, tour_title: tour.title, date, spots: spotsNum });

    if (targetDateObj) {
      targetDateObj.spots_available -= spotsNum;
      if (targetDateObj.spots_available === 0) targetDateObj.status = 'sold_out';
      else if (targetDateObj.spots_available <= 5) targetDateObj.status = 'last_spots';
      // Sum up global spots_available
      tour.spots_available = tour.dates.reduce((sum, d) => sum + d.spots_available, 0);
      tour.markModified('dates');
    } else {
      tour.spots_available -= spotsNum;
    }
    
    await tour.save();

    req.session.success = `¡Tu reserva para "${tour.title}" se ha confirmado exitosamente!`;
    res.redirect('/mis-reservas');
  } catch (error) {
    console.error(error);
    req.session.error = 'Ocurrió un error al procesar tu reserva. Inténtalo de nuevo.';
    res.redirect(req.get('Referrer') || '/');
  }
};

exports.cancelBooking = async (req, res) => {
  const { id } = req.params;
  const user_id = req.session.user.id;

  try {
    const booking = await Booking.findById(id, user_id);
    if (!booking) {
      req.session.error = 'La reserva no existe o no te pertenece.';
      return res.redirect('/mis-reservas');
    }

    const tour = await Tour.findById(booking.tour_id);
    if (tour) {
      // Find the specific date and restore spots
      let targetDateObj = null;
      if (tour.dates && tour.dates.length > 0) {
        let bookingDateStr = booking.date;
        if (booking.date instanceof Date) {
          const y = booking.date.getUTCFullYear();
          const m = String(booking.date.getUTCMonth() + 1).padStart(2, '0');
          const d = String(booking.date.getUTCDate()).padStart(2, '0');
          bookingDateStr = `${y}-${m}-${d}`;
        } else if (typeof booking.date === 'string') {
          bookingDateStr = booking.date.split('T')[0];
        }

        targetDateObj = tour.dates.find(d => d.date === bookingDateStr);
        if (targetDateObj) {
          targetDateObj.spots_available = Math.min(targetDateObj.spots_total, targetDateObj.spots_available + booking.spots);
          if (targetDateObj.spots_available === 0) targetDateObj.status = 'sold_out';
          else if (targetDateObj.spots_available <= 5) targetDateObj.status = 'last_spots';
          else targetDateObj.status = 'available';
          tour.spots_available = tour.dates.reduce((sum, d) => sum + d.spots_available, 0);
          tour.markModified('dates');
        }
      } 
      
      if (!targetDateObj) {
        // Fallback
        tour.spots_available += booking.spots;
      }
      await tour.save();
    }

    await Booking.delete(id);

    req.session.success = 'La reserva ha sido cancelada exitosamente y los cupos han sido liberados.';
    res.redirect('/mis-reservas');
  } catch (error) {
    console.error(error);
    req.session.error = 'Error al cancelar la reserva.';
    res.redirect('/mis-reservas');
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
    let complaints;
    if (user.role === 'admin') {
      complaints = await Complaint.findAll();
    } else if (user.role === 'seller') {
      complaints = await Complaint.findBySellerId(user.id);
    } else {
      complaints = await Complaint.findByUserId(user.id);
    }

    const tours = await Tour.find({ status: 'approved' }).sort({ title: 1 });

    res.render('complaints', {
      complaints,
      tours,
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
  const { subject, message, tour_id } = req.body;
  const user_id = req.session.user.id;

  if (!subject || !message) {
    req.session.error = 'Todos los campos son necesarios.';
    return res.redirect('/quejas');
  }

  try {
    let finalTourId = null;
    let tourTitle = null;
    let sellerId = null;

    if (tour_id && tour_id.trim() !== '') {
      const tour = await Tour.findById(tour_id);
      if (tour) {
        finalTourId = tour._id.toString();
        tourTitle = tour.title;
        sellerId = parseInt(tour.seller_id) || null;
      }
    }

    await Complaint.create({
      user_id,
      subject,
      message,
      tour_id: finalTourId,
      tour_title: tourTitle,
      seller_id: sellerId
    });

    req.session.success = 'Tu queja/sugerencia ha sido enviada. Un administrador o el proveedor mencionado responderá pronto.';
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

exports.handleGoogleCallback = (req, res) => {
  // Passport ha autenticado y guardado al usuario en req.user
  if (req.user) {
    req.session.user = {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      status: req.user.status,
      country: req.user.country,
      company_name: req.user.company_name,
      google_id: req.user.google_id
    };
  }
  res.redirect('/');
};
