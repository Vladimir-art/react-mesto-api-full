const { JWT_SECRET } = process.env;
const bcryptjs = require('bcryptjs');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const CentralError = require('../middlewares/CentralError');

module.exports.createUser = (req, res, next) => {
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
        .then((u) => res.status(200).send({
          _id: u._id,
          name: u.name,
          about: u.about,
          avatar: u.avatar,
        }))
        .catch((err) => {
          if (err.name === 'MongoError' && err.code === 11000) {
            return next(new CentralError('Такой пользователь уже существует', 409));
          }
          return next(err);
        });
    });
};

module.exports.getUsers = (req, res, next) => {
  User.find({})
    .then((u) => res.status(200).send(u))
    .catch(next);
};

module.exports.getUserId = (req, res, next) => {
  User.findById(req.params.id)
    .orFail(new CentralError('Данного пользователя не существует', 404))
    .then((u) => res.status(200).send(u))
    .catch(next);
};

module.exports.updateUser = (req, res, next) => {
  User.findByIdAndUpdate(req.user._id,
    {
      name: req.body.name,
      about: req.body.about,
    })
    .orFail(new CentralError('Данного пользователя не существует', 404))
    .then((u) => {
      if (u.name === null || u.about === null) {
        throw new CentralError('Произошла ошибка валидации', 401);
      }
      res.status(200).send(u);
    })
    .catch(next);
};

module.exports.updateAvatar = (req, res, next) => {
  User.findByIdAndUpdate(req.user._id,
    {
      avatar: req.body.avatar,
    })
    .orFail(new CentralError('Данного пользователя не существует', 404))
    .then((u) => {
      if (!validator.isURL(u.avatar) || u.avatar === null) {
        throw new CentralError('Произошла ошибка валидации', 401);
      }
      res.status(200).send(u);
    })
    .catch(next);
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  User.findOne({ email }).select('+password')
    .then((u) => {
      if (!u) {
        throw new CentralError('Данного пользователя не существует', 404);
      }
      // сравниваем переданный пароль и хеш из базы
      return bcryptjs.compare(password, u.password)
        .then((matched) => { // результат работы bcryptjs.compare (принимает true or false)
          if (!matched) {
            throw new CentralError('Неверная почта или пароль', 401);
          }
          return u;
        });
    })
    .then((verifiedUser) => {
      const token = jwt.sign({ _id: verifiedUser._id }, JWT_SECRET, { expiresIn: '7d' }); // создаем токен сроком на неделю
      res.status(200).send({ token });
    })
    .catch(next);
};
