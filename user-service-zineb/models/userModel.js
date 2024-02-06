const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
//const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@(([^<>()[\]\\.,;:\s@\"]+\.)+[^<>()[\]\\.,;:\s@\"]{2,})$/i;
const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  creditCardInfo: {
    cardNumber: String,
    expiryDate: String,
    cvv: String,
  },
  phoneNumber: String,
  reputationIndex: { type: Number, default: 0 }
});
userSchema.index({ email: 1 }, { unique: true });

userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 8);
  }
  next();
});

module.exports = mongoose.model('User', userSchema);
