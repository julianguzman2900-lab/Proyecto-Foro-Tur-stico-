const Tour = require('../models/Tour');

exports.getDashboard = async (req, res) => {
  const seller_id = req.session.user.id;

  try {
    const tours = await Tour.find({ seller_id }).sort({ created_at: -1 });

    const stats = {
      total: tours.length,
      active: tours.filter(t => t.status === 'approved').length,
      pending: tours.filter(t => t.status === 'pending').length
    };

    res.render('seller-dashboard', {
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
    res.status(500).send('Error al cargar el panel de vendedor.');
  }
};
