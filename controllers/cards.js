const Card = require('../models/card');
const CentralError = require('../middlewares/CentralError');

// контроллер по созданию карточки
module.exports.createCard = (req, res, next) => {
  const { name, link } = req.body;
  const owner = req.user._id;
  Card.create({ name, link, owner })
    .then((c) => res.status(200).send(c))
    .catch(next);
};
// контроллер по получению списка карточек
module.exports.getCards = (req, res, next) => {
  Card.find({})
    .then((c) => res.status(200).send(c))
    .catch(next);
};
// контроллер по удалению карточки по ее ID
module.exports.deleteCardId = (req, res, next) => {
  Card.findByIdAndRemove(req.params.id)
    .then((c) => {
      if (c !== null) {
        res.status(200).send(c);
      } else {
        throw new CentralError('Данной карточки не существует', 404);
      }
    })
    .catch(next);
};
// поставить лайк карточке
module.exports.likeCard = (req, res, next) => {
  Card.findByIdAndUpdate(req.params.id,
    { $addToSet: { likes: req.user._id } }, // добавить _id в массив, если его там нет
    { new: true })
    .orFail(new CentralError('Данной карточки не существует', 404))
    .then((c) => res.status(200).send(c))
    .catch(next);
};
// удалить лайк у карточки
module.exports.dislikeCard = (req, res, next) => {
  Card.findByIdAndUpdate(req.params.id,
    { $pull: { likes: req.user._id } }, // убрать _id из массива
    { new: true })
    .then((c) => {
      if (c !== null) {
        res.status(200).send(c);
      } else {
        throw new CentralError('Данной карточки не существует', 404);
      }
    })
    .catch(next);
};
