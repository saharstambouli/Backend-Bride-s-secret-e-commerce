const mongoose = require('mongoose');

const newNewsletterSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId, // Reference to a user (if applicable)
    ref: 'User',
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    match: [/.+\@.+\..+/, 'Please enter a valid email address'],
  },
  dateOfSubscription: {
    type: Date,
    default: Date.now,
  },
  isSubscribed: {
    type: Boolean,
    default: true,
  },
});

module.exports = mongoose.model('NewNewsletter', newNewsletterSchema);