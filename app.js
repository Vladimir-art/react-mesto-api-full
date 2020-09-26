const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const expressRateLimit = require('express-rate-limit'); // ограничение кол-ва запросов

const { PORT = 3000 } = process.env; // настраиваем порт

const app = express(); // подключаем модуль express

const limiter = expressRateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 50,
  message: 'Слишком много запросов по этому IP, попробуйте продолжить через 10 минут...',
});

const { users } = require('./routes/users'); // подключаем модули с инфой о пользователе(ях)
const { cards } = require('./routes/cards'); // подключаем модули с инфой с карточками

// подключаемся к серверу mongo
mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
});

app.use(limiter); // подключаем ко всем запосам
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
  req.user = {
    _id: '5f4bb1fd1c4d5727741ab9fb', // вставьте сюда _id созданного в предыдущем пункте пользователя 5f4bb1fd1c4d5727741ab9fb
  };

  next();
});

app.use('/users', users); // используем роуты со списком пользователей
app.use('/cards', cards); // список карточек
app.use('/', (req, res) => { // если запросы не верны, выдаем ошибку
  res.status(404).send({ message: 'Запрашиваемой страницы не существет' });
});

app.listen(PORT, () => {
  console.log(`Server has been started on the ${PORT} port...`);
});
