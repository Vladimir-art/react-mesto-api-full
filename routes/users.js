const users = require('express').Router(); // создаем роутер

const {
  getUsers,
  getUserId,
  updateUser,
  updateAvatar,
} = require('../controllers/users');

users.get('/', getUsers); // роут по получению пользователя

users.get('/:id', getUserId); // роут по получению пользователя по ID

users.patch('/me', updateUser); // обновить данные о пользователе (имя, деятельность)

users.patch('/me/avatar', updateAvatar); // обновить аватар

module.exports = { users };
