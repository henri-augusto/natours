/* eslint-disable */

// METHODS

// ALERTAS
const hideAlert = () => {
  const el = document.querySelector('.alert');
  if (el) el.parentElement.removeChild(el);
};

const showAlert = (type, msg) => {
  hideAlert();
  document
    .querySelector('body')
    .insertAdjacentHTML(
      'afterbegin',
      `<div class="alert alert--${type}">${msg}</div>`,
    );

  setTimeout(() => {
    hideAlert();
  }, 5000);
};

// SIGN UP
const signUp = async (newUser) => {
  try {
    const result = await axios({
      method: 'POST',
      url: '/api/v1/users/signup',
      data: newUser,
    });

    if (result.data.status === 'success') {
      showAlert('success', 'Succes to create a new account');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (error) {
    showAlert('error', error.response.data.message);
  }
};

// LOGIN
const login = async (email, password) => {
  try {
    const result = await axios({
      method: 'POST',
      url: '/api/v1/users/login',
      data: {
        email,
        password,
      },
    });

    if (result.data.status === 'success') {
      showAlert('success', 'Logged in successfully');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (error) {
    showAlert('error', error.response.data.message);
  }
};

// LOGOUT
const logout = async () => {
  try {
    const result = await axios({
      method: 'GET',
      url: '/api/v1/users/logout',
    });
    if (result.data.status === 'success') {
      location.reload(true);
    }
  } catch (error) {
    console.log(error);
    showAlert('Error', 'Fail logging out! Please try again later!');
  }
};

// ATUALIZAR USUÁRIO
const updateSettings = async (data, type) => {
  try {
    const url =
      type === 'password'
        ? '/api/v1/users/updatePassword/'
        : '/api/v1/users/updateMe/';
    const result = await axios({
      method: 'PATCH',
      url,
      data,
    });

    if (result.data.status === 'success') {
      showAlert('success', `${type.toUpperCase()} update successfuly!`);
    }
  } catch (error) {
    showAlert('error', error.response.data.message);
  }
};

const payment = async (tourId) => {
  try {
    const result = await axios({
      method: 'GET',
      url: `/api/v1/bookings/checkout-session/${tourId}`,
    });
    location.assign(result.data.session);
  } catch (error) {
    console.log(error);
  }
};

// VARIABLES
// SIGN UP
const formSignUp = document.querySelector('.form--sigup');
if (formSignUp)
  formSignUp.addEventListener('submit', (e) => {
    e.preventDefault();
    document.querySelector('.btn-signup').textContent = 'Signing up...';
    const newUser = {};
    newUser.name = document.getElementById('name').value;
    newUser.email = document.getElementById('email').value;
    newUser.password = document.getElementById('password').value;
    newUser.passwordConfirm = document.getElementById('passwordConfirm').value;
    signUp(newUser);
  });

// LOGIN
const formLogin = document.querySelector('.form--login');
if (formLogin)
  formLogin.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });

// LOGOUT
const logOutBtn = document.getElementById('logout');
if (logOutBtn) logOutBtn.addEventListener('click', logout);

// UPDATE CURRENT USER
const formUserData = document.querySelector('.form-user-data');
if (formUserData)
  formUserData.addEventListener('submit', (e) => {
    e.preventDefault();

    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);

    updateSettings(form, 'settings');
  });

// UPDATE PASSWORD CURRENT USER
const formUserPassword = document.querySelector('.form-user-password');
if (formUserPassword)
  formUserPassword.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.querySelector('.btn-save-password').textContent = 'Updating...';
    const oldPassword = document.getElementById('password-current').value;
    const newPassword = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    await updateSettings(
      { oldPassword, newPassword, passwordConfirm },
      'password',
    );
    document.querySelector('.btn-save-password').textContent = 'Save password';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });

// PAYMENTS
const paymentBtn = document.getElementById('payment');
if (paymentBtn)
  paymentBtn.addEventListener('click', (e) => {
    e.target.textContent = 'Processing...';
    const { tourId } = e.target.dataset;
    payment(tourId);
  });
