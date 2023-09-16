const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcriypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  name: {
    type: String,
    required: [true, 'Please provide us your name'],
    trim: true,
    maxlength: 40,
    minlength: 3,
  },
  email: {
    type: String,
    require: [true, 'Please provide us your email'],
    trim: true,
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide us a valid email'],
  },
  photo: {
    type: String,
    default: 'default.jpg',
  },
  password: {
    type: String,
    require: [true, 'Please provide a password'],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    require: [true, 'Please confirm your password'],
    // Essa validação somente irá funcionar nas funções .SAVE e .CREATE
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: 'Password are not the same!',
    },
  },
  passwordChangedAt: { type: Date },
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

userSchema.pre('save', async function (next) {
  // Apenas executar essa função se o passaword for alterado
  if (!this.isModified('password')) return next();

  // Hash o password
  this.password = await bcriypt.hash(this.password, 12);

  // Não manter na base de dados esse campo para não precisar encriptar
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function (next) {
  // Apenas executar essa função se o passaword for alterado
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function (next) {
  // Apenas vai trazer usuários que tem o campo 'active' como 'true'
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  return await bcriypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = async function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );

    const result = changedTimestamp > JWTTimestamp;

    return result;
  }
  // False quer dizer não foi alterado
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  // Cria um token aleatório
  const resetToken = crypto.randomBytes(32).toString('hex');

  // Grava o token no BD criptogrado
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Grava quando token expirou
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
