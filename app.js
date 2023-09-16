const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');

const app = express();

const AppError = require('./utils/appError');
const globalErrorHandling = require('./controllers/errorController');
const viewRouter = require('./routes/viewRoutes');
const toursRouter = require('./routes/toursRoutes');
const usersRouter = require('./routes/usersRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');

// Middleware's
// Setando HTTP Headers security
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        'script-src': [
          "'self'",
          'api.mapbox.com',
          'cdnjs.cloudflare.com',
          "'unsafe-eval'",
        ],
        'worker-src': ['blob: '],
        'connect-src': [
          "'self'",
          'api.mapbox.com',
          'tiles.mapbox.com',
          'events.mapbox.com',
        ],
      },
    },
  }),
);

// Logging development
dotenv.config({ path: './config.env' });
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limitando a quantidade de requisições
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});
app.use('/api', limiter);

// Bodu parser, lendo dados from de body no req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Data sanitization contra injeção de uma linha NoSQL
app.use(mongoSanitize());

// Polução de parametro é previnida
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  }),
);

// Arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// Setando engine do PUG para leitura do front end
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Rotas de acesso as funções da aplicação
app.use('/', viewRouter);
app.use('/api/v1/tours', toursRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => {
  // A CLASSE 'APPERROR' NA NEXT() FAZ COM QUE O MIDDLEWARE IDENTIFIQUE
  //  AUTOMATICAMENTO QUE HÁ UM ERRO E PULE TODOS OS OUTROS
  //  MIDDLEWARE E PASSE ADIANTE O ERRO PARA O MIDDLEWARE GLOBAL DE ERROS
  next(
    new AppError(`Não foi possível achar ${req.originalUrl} no servidor!`, 404),
  );
});

// GLOBAL ERROR HANDLING "error-controller"
app.use(globalErrorHandling);

module.exports = app;
