const User = require('../models/user');

module.exports.createUser = (req, res) => {
  const { name, about, avatar } = req.body;
  User.create({ name, about, avatar })
    .then((u) => res.status(200).send(u))
    .catch((err) => {
      if (err.name === 'ValidationError') return res.status(400).send({ message: `Произошла ошибка валидации ${err}` });
      return res.status(500).send({ message: `Произошла ошибка ${err}` });
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
