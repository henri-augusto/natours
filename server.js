const mongoose = require('mongoose');
const app = require('./app');

process.on('uncaughtException', (err) => {
  console.log(err.name, err.message);
  process.exit(1);
});

console.log(process.env.NODE_ENV);

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  encodeURIComponent(process.env.DATABASE_PASSWORD),
);

// Conectando ao banco de dados
mongoose.connect(DB).then(() => {
  console.log('Conexão com DB foi um sucesso');
});

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`App rodando na porta ${port}`);
});

process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
