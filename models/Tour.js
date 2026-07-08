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
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  rejection_reason: { type: String, default: '' },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Tour', TourSchema);
