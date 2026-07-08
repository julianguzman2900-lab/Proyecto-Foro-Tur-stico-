const Tour = require('../models/Tour');
const Booking = require('../models/Booking');

exports.getDashboard = async (req, res) => {
  const seller_id = req.session.user.id;

  try {
    const tours = await Tour.find({ seller_id }).sort({ created_at: -1 });

    const tourIds = tours.map(t => t._id.toString());
    const bookings = await Booking.findByTourIds(tourIds);

    const toursMap = {};
    tours.forEach(t => {
      toursMap[t._id.toString()] = t;
    });

    let totalRevenue = 0;
    let totalTickets = 0;
    
    const clientHistory = bookings.map(b => {
      const tour = toursMap[b.tour_id];
      const price = tour ? tour.price : 0;
      const totalAmount = b.spots * price;
      
      totalRevenue += totalAmount;
      totalTickets += b.spots;

      return {
        id: b.id,
        user_name: b.user_name,
        tour_title: b.tour_title,
        date: b.date,
        spots: b.spots,
        amount: totalAmount
      };
    });

    const stats = {
      total: tours.length,
      active: tours.filter(t => t.status === 'approved' && new Date(t.activity_date) >= new Date()).length,
      pending: tours.filter(t => t.status === 'pending').length,
      finished: tours.filter(t => t.status === 'finished').length,
      expired: tours.filter(t => t.status === 'approved' && new Date(t.activity_date) < new Date()).length
    };

    res.render('seller-dashboard', {
      tours,
      stats,
      financials: {
        totalRevenue,
        totalTickets,
        totalSales: bookings.length,
        history: clientHistory
      },
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
