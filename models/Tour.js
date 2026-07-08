const mongoose = require('mongoose');

const TourSchema = new mongoose.Schema({
  seller_id: { type: Number, required: true },
  seller_name: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  continent: { type: String, required: true },
  country: { type: String, required: true },
  city: { type: String, required: true },
  activity: { type: String, required: true },
  duration: { type: String, required: true },
  difficulty: { type: String, enum: ['Fácil', 'Medio', 'Difícil'], required: true },
  price: { type: Number, required: true },
  spots_total: { type: Number, required: true },
  spots_available: { type: Number, required: true },
  images: [{ type: String }],
  contact_info: { type: String, required: true },
  start_address: { type: String, required: true },
  coordinates: { type: String, default: '' },
  activity_date: { 
    type: Date, 
    required: true, 
    default: () => {
      const d = new Date();
      d.setDate(d.getDate() + 30);
      return d;
    }
  },
  availability: {
    startDate: { type: String },
    endDate: { type: String },
    daysOfWeek: [{ type: Number }]
  },
  dates: [{
    date: { type: String },
    spots_total: { type: Number },
    spots_available: { type: Number },
    status: { type: String, enum: ['available', 'last_spots', 'sold_out'], default: 'available' }
  }],
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'finished'], default: 'pending' },
  rejection_reason: { type: String, default: '' },
  created_at: { type: Date, default: Date.now }
});

TourSchema.pre('validate', function(next) {
  if (!this.activity_date || isNaN(new Date(this.activity_date).getTime())) {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    this.activity_date = d;
  }
  next();
});

module.exports = mongoose.model('Tour', TourSchema);
