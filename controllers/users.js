const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

module.exports.createUser = (req, res) => {
  const {
    name,
    about,
    avatar,
    email,
    password,
  } = req.body;
  bcryptjs.hash(password, 10)
    .then((hash) => {
      User.create({
        name,
        about,
        avatar,
        email,
        password: hash,
      })
        .then((u) => res.status(200).send(u))
        .catch((err) => {
          if (err.name === 'ValidationError') return res.status(400).send({ message: `Произошла ошибка валидации ${err}` });
          return res.status(500).send({ message: `Произошла ошибка ${err}` });
        });
    });
};

module.exports.getUsers = (req, res) => {
  User.find({})
    .then((u) => res.status(200).send(u))
    .catch((err) => res.status(500).send({ message: `Произошла ошибка ${err}` }));
};

module.exports.getUserId = (req, res) => {
  User.findById(req.params.id)
    .orFail(new Error('Not found'))
    .then((u) => res.status(200).send(u))
    .catch((err) => {
      if (err.message === 'Not found') {
        res.status(404).send({ message: 'Данного пользователя не существует' });
      } else {
        res.status(500).send({ message: `Произошла ошибка ${err}` });
      }
    });
};

module.exports.updateUser = (req, res) => {
  User.findByIdAndUpdate(req.user._id,
    {
      name: req.body.name,
      about: req.body.about,
    })
    .orFail(new Error('Not found'))
    .then((u) => res.status(200).send(u))
    .catch((err) => {
      if (err.name === 'ValidationError') return res.status(400).send({ message: `Произошла ошибка валидации ${err}` });
      if (err.message === 'Not found') {
        return res.status(404).send({ message: 'Данного пользователя не существует' });
      }
      return res.status(500).send({ message: `Произошла ошибка ${err}` });
    });
};

module.exports.updateAvatar = (req, res) => {
  User.findByIdAndUpdate(req.user._id,
    {
      avatar: req.body.avatar,
    })
    .orFail(new Error('Not found'))
    .then((u) => res.status(200).send(u))
    .catch((err) => {
      if (err.name === 'ValidationError') return res.status(400).send({ message: `Произошла ошибка валидации ${err}` });
      if (err.message === 'Not found') {
        return res.status(404).send({ message: 'Данного пользователя не существует' });
      }
      return res.status(500).send({ message: `Произошла ошибка ${err}` });
    });
};

module.exports.login = (req, res) => {
  const { email, password } = req.body;
  User.findOne({ email })
    .then((u) => {
      if (!u) {
        return Promise.reject(new Error('Неверная почта или пароль'));
      }
      // сравниваем переданный пароль и хеш из базы
      return bcryptjs.compare(password, u.password)
        .then((matched) => { // результат работы bcryptjs.compare (принимает true or false)
          if (!matched) {
            return Promise.reject(new Error('Неверная почта или пароль'));
          }
          return u;
        });
    })
    .then((verifiedUser) => {
      const token = jwt.sign({ _id: verifiedUser._id }, 'secret-key', { expiresIn: '7d' }); // создаем токен сроком на неделю
      res.status(200).send({ token });
    })
    .catch((err) => { // возвращаем ошибку аутентификации
      res.status(401).send({ message: err.message });
    });
};
