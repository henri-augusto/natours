const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('../../models/tourModel');
const User = require('../../models/userModel');
const Review = require('../../models/reviewModel');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  encodeURIComponent(process.env.DATABASE_PASSWORD),
);

// Conectando ao banco de dados
mongoose.connect(DB).then(() => {
  // console.log('Conexão com DB foi um sucesso');
});

// LER O ARQUIVO JSON
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'),
);

// IMPORTAR DADOS PARA O BANDO DE DADOS
const importData = async () => {
  try {
    // await User.create(users, { validateBeforeSave: false });
    await Tour.create(tours);
    await Review.create(reviews);
    // console.log('Os dados foram carregados');
  } catch (error) {
    // console.log(error);
  }
  process.exit();
};

// DELETAR TODOS DADOS DO BANCO DE DADOS
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    // await User.deleteMany();
    await Review.deleteMany();
    // console.log('Os dados foram deletados');
  } catch (error) {
    console.log(error);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
