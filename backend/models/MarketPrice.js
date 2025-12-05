const mongoose = require('mongoose');

const marketPriceSchema = new mongoose.Schema({
  crop: {
    type: String,
    required: [true, 'Crop name is required'],
    trim: true,
  },
  state: {
    type: String,
    required: [true, 'State is required'],
    trim: true,
  },
  district: {
    type: String,
    required: [true, 'District is required'],
    trim: true,
  },
  market: {
    type: String,
    required: [true, 'Market name is required'],
    trim: true,
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: 0,
  },
  unit: {
    type: String,
    default: 'Quintal',
    enum: ['Quintal', 'Kg', 'Ton'],
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
  source: {
    type: String,
    enum: ['manual', 'external_api', 'seed'],
    default: 'manual',
  },
}, {
  timestamps: true,
});

// Index for efficient queries
marketPriceSchema.index({ state: 1, district: 1, date: -1 });
marketPriceSchema.index({ crop: 1, date: -1 });

module.exports = mongoose.model('MarketPrice', marketPriceSchema);

