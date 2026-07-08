const User = require('../models/User');
const Tour = require('../models/Tour');

exports.getDashboard = async (req, res) => {
  try {
    const sellers = await User.findAllSellers();
    const tours = await Tour.find().sort({ created_at: -1 });

    const stats = {
      sellersTotal: sellers.length,
      sellersPending: sellers.filter(s => s.status === 'pending').length,
      toursTotal: tours.length,
      toursPending: tours.filter(t => t.status === 'pending').length
    };

    res.render('admin-dashboard', {
      sellers,
      tours,
      stats,
      user: req.session.user,
      error: req.session.error,
      success: req.session.success
    });
    req.session.error = null;
    req.session.success = null;
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al cargar el panel de administración.');
  }
};

exports.auditarVendedor = async (req, res) => {
  const { seller_id, action, rejection_reason } = req.body;

  if (!seller_id || !action) {
    req.session.error = 'Datos de auditoría incompletos.';
    return res.redirect('/admin/dashboard');
  }

  try {
    const seller = await User.findById(seller_id);
    if (!seller) {
      req.session.error = 'El vendedor no existe.';
      return res.redirect('/admin/dashboard');
    }

    if (seller.status !== 'pending') {
      req.session.error = 'Esta cuenta ya ha sido auditada y no se puede volver a cambiar su estado.';
      return res.redirect('/admin/dashboard');
    }

    let status = 'approved';
    let reason = null;

    if (action === 'reject') {
      if (!rejection_reason || rejection_reason.trim() === '') {
        req.session.error = 'Debes indicar el motivo del rechazo del vendedor.';
        return res.redirect('/admin/dashboard');
      }
      status = 'rejected';
      reason = rejection_reason;
    }

    await User.updateStatus(seller_id, status, reason);

    req.session.success = `Vendedor actualizado con estado: ${status === 'approved' ? 'Aprobado' : 'Rechazado'}.`;
    res.redirect('/admin/dashboard');
  } catch (error) {
    console.error(error);
    req.session.error = 'Error al actualizar el estado del vendedor.';
    res.redirect('/admin/dashboard');
  }
};

exports.auditarTour = async (req, res) => {
  const { tour_id, action, rejection_reason } = req.body;

  if (!tour_id || !action) {
    req.session.error = 'Datos de auditoría de la publicación incompletos.';
    return res.redirect('/admin/dashboard');
  }

  try {
    const tour = await Tour.findById(tour_id);
    if (!tour) {
      req.session.error = 'El tour no existe.';
      return res.redirect('/admin/dashboard');
    }

    if (tour.status !== 'pending') {
      req.session.error = 'Este tour ya ha sido auditado y no se puede volver a cambiar su estado.';
      return res.redirect('/admin/dashboard');
    }

    if (action === 'approve') {
      tour.status = 'approved';
      tour.rejection_reason = '';
    } else if (action === 'reject') {
      if (!rejection_reason || rejection_reason.trim() === '') {
        req.session.error = 'El campo del porqué del rechazo es obligatorio.';
        return res.redirect('/admin/dashboard');
      }
      tour.status = 'rejected';
      tour.rejection_reason = rejection_reason;
    }

    await tour.save();

    req.session.success = `El tour "${tour.title}" está ahora: ${tour.status === 'approved' ? 'Aprobado' : 'Rechazado'}.`;
    res.redirect('/admin/dashboard');
  } catch (error) {
    console.error(error);
    req.session.error = 'Error al auditar la publicación.';
    res.redirect('/admin/dashboard');
  }
};
