require('dotenv').config();

const { celebrate, Joi, errors } = require('celebrate'); // валидация запросов до передачи обработки в контроллеры
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
const { createUser, login } = require('./controllers/users');
const { requestLogger, errorLogger } = require('./middlewares/logger'); // подключение логгирования работы сервера
const auth = require('./middlewares/auth');

// подключаемся к серверу mongo
mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
});

app.use(limiter); // подключаем ко всем запосам
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true }));

app.use(requestLogger); // подключаем логгер запросов

// в случае падения автоматически восстанавливается
app.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Сервер сейчас упадёт');
  }, 0);
});

// роуты, не требующие авторизации
app.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
  }).unknown(true),
}), login);

app.post('/signup', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    about: Joi.string().required().min(2).max(30),
    avatar: Joi.string().regex(/(http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-/]))?/).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
  }).unknown(true),
}), createUser);

app.use(auth); // авторизация

// роуты, которым авторизация нужна
app.use('/users', users); // используем роуты со списком пользователей
app.use('/cards', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30).required(),
    link: Joi.string().regex(/(http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-/]))?/).required(),
  }).unknown(true),
}), cards); // список карточек
app.use('/', (req, res) => { // если запросы не верны, выдаем ошибку
  res.status(404).send({ message: 'Запрашиваемой страницы не существет' });
});

app.use(errorLogger); // подключаем логгер ошибок

// обработка ошибок на стадии поверки celebrate
app.use(errors());
// централизованная обработка ошибок
app.use((err, req, res, next) => {
  const { statusCode = 500, message } = err;
  res
    .status(statusCode)
    .send({
      // проверяем статус и выставляем сообщение в зависимости от него
      message: statusCode === 500
        ? 'На сервере произошла ошибка'
        : message,
    });
});

app.listen(PORT, () => {
  console.log(`Server has been started on ${PORT} port...`);
});
