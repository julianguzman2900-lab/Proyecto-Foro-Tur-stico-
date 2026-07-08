function requireLogin(req, res, next) {
  if (!req.session.user) {
    req.session.error = 'Debes iniciar sesión para realizar esta acción.';
    return res.redirect('/login');
  }
  next();
}

function requireRole(roles) {
  return function(req, res, next) {
    if (!req.session.user) {
      req.session.error = 'Debes iniciar sesión para acceder.';
      return res.redirect('/login');
    }
    if (!roles.includes(req.session.user.role)) {
      req.session.error = 'No tienes permiso para acceder a esta sección.';
      return res.redirect('/');
    }
    next();
  };
}

function requireApprovedSeller(req, res, next) {
  if (!req.session.user) {
    req.session.error = 'Debes iniciar sesión para acceder.';
    return res.redirect('/login');
  }
  if (req.session.user.role !== 'seller') {
    req.session.error = 'Esta sección es exclusiva para vendedores.';
    return res.redirect('/');
  }
  if (req.session.user.status !== 'approved') {
    req.session.error = 'Tu cuenta de vendedor aún no ha sido aprobada por el administrador.';
    return res.redirect('/seller/dashboard');
  }
  next();
}

module.exports = {
  requireLogin,
  requireRole,
  requireApprovedSeller
};
