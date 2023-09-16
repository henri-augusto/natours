const express = require('express');
const {
  signup,
  login,
  logout,
  protect,
  restrictTo,
} = require('../controllers/authController');
const {
  getAllUsers,
  deleteUser,
  updateUser,
  updateMe,
  deleteMe,
  getUser,
  getMe,
  uploadUserPhoto,
  resizeUserPhoto,
} = require('../controllers/userController');
const {
  forgotPassword,
  resetPassword,
  updatePassword,
} = require('../controllers/authController');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/logout', logout);
router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);

// todos os middleware que vem depois desse '.use' que também são um middeware
// estarão protegida. Como middleware rodando em sequência, isso funciona muito bem
router.use(protect);

router.patch('/updatePassword/', updatePassword);
router.get('/me', getMe, getUser);
router.patch('/updateMe/', uploadUserPhoto, resizeUserPhoto, updateMe);
router.delete('/deleteMe/', deleteMe);

// Funciona da mesma forma que o ".use" anterior
router.use(restrictTo('admin'));

router.route('/').get(getAllUsers);
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
