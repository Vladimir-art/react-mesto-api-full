const users = require('express').Router(); // создаем роутер

const {
  createUser,
  getUsers,
  getUserId,
  updateUser,
  updateAvatar,
} = require('../controllers/users');

users.get('/', getUsers); // роут по получению пользователя

users.get('/:id', getUserId); // роут по получению пользователя по ID

users.post('/', createUser); // создать пользователя

users.patch('/me', updateUser); // обновить данные о пользователе (имя, деятельность)

users.patch('/me/avatar', updateAvatar); // обновить аватар

module.exports = { users };
