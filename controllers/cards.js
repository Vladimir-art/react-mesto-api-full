const Card = require('../models/card');

// контроллер по созданию карточки
module.exports.createCard = (req, res) => {
  const { name, link } = req.body;
  const owner = req.user._id;
  Card.create({ name, link, owner })
    .then((c) => res.status(200).send(c))
    .catch((err) => {
      if (err.name === 'ValidationError') return res.status(400).send({ message: `Произошла ошибка валидации ${err}` });
      return res.status(500).send({ message: `Произошла ошибка ${err}` });
    });
};
// контроллер по получению списка карточек
module.exports.getCards = (req, res) => {
  Card.find({})
    .then((c) => res.status(200).send(c))
    .catch((err) => res.status(500).send({ message: `Произошла ошибка ${err}` }));
};
// контроллер по удалению карточки по ее ID
module.exports.deleteCardId = (req, res) => {
  Card.findByIdAndRemove(req.params.id)
    .then((c) => {
      if (c !== null) {
        res.status(200).send(c);
      } else {
        res.status(404).send({ message: 'Данной карточки не существует' });
      }
    })
    .catch((err) => res.status(500).send({ message: `Произошла ошибка ${err}` }));
};
// поставить лайк карточке
module.exports.likeCard = (req, res) => {
  Card.findByIdAndUpdate(req.params.id,
    { $addToSet: { likes: req.user._id } }, // добавить _id в массив, если его там нет
    { new: true })
    .orFail(new Error('Not found'))
    .then((c) => res.status(200).send(c))
    .catch((err) => {
      if (err.message === 'Not found') {
        res.status(404).send({ message: 'Данной карточки не существует, не смогу поставить лайк' });
      } else {
        res.status(500).send({ message: `Произошла ошибка ${err}` });
      }
    });
};
// удалить лайк у карточки
module.exports.dislikeCard = (req, res) => {
  Card.findByIdAndUpdate(req.params.id,
    { $pull: { likes: req.user._id } }, // убрать _id из массива
    { new: true })
    .then((c) => {
      if (c !== null) {
        res.status(200).send(c);
      } else {
        res.status(404).send({ message: 'Данной карточки не существует, не смогу убрать лайк' });
      }
    })
    .catch((err) => {
      if (err.name === 'ValidationError') return res.status(400).send({ message: `Произошла ошибка валидации ${err}` });
      return res.status(500).send({ message: `Произошла ошибка ${err}` });
    });
};
