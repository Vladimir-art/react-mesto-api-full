const users = require('express').Router(); // создаем роутер
const { celebrate, Joi, errors } = require('celebrate'); // валидация запросов до передачи обработки в контроллеры

const {
  getUsers,
  getUserId,
  updateUser,
  updateAvatar,
} = require('../controllers/users');

users.get('/', getUsers); // роут по получению пользователя

users.get('/:id', getUserId); // роут по получению пользователя по ID

users.patch('/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    about: Joi.string().required().min(2).max(30),
  }),
}), updateUser); // обновить данные о пользователе (имя, деятельность)

users.patch('/me/avatar', celebrate({
  body: Joi.object().keys({
    avatar: Joi.string().regex(/(http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-/]))?/).required(),
  }),
}), updateAvatar); // обновить аватар

users.use(errors());

module.exports = { users };
