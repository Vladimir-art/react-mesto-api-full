const cards = require('express').Router();
const { celebrate, Joi, errors } = require('celebrate'); // валидация запросов до передачи обработки в контроллеры

const {
  createCard,
  getCards,
  deleteCardId,
  likeCard,
  dislikeCard,
} = require('../controllers/cards');

cards.post('/', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    link: Joi.string().regex(/(http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-/]))?/).required(),
    owner: Joi.string().hex().required(),
    likes: Joi.array().items(Joi.object().keys({
      name: Joi.string().required().min(2).max(30),
      about: Joi.string().required().min(2).max(30),
      avatar: Joi.string().regex(/(http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-/]))?/).required(),
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    })),
    createdAt: Joi.date(),
  }),
}), createCard);

cards.get('/', getCards);

cards.delete('/:id', celebrate({
  body: Joi.object().keys({
    id: Joi.string().hex().required(),
  }),
}), deleteCardId);

cards.put('/:id/likes', celebrate({
  body: Joi.object().keys({
    id: Joi.string().hex().required(),
  }),
}), likeCard);

cards.delete('/:id/likes', celebrate({
  body: Joi.object().keys({
    id: Joi.string().hex().required(),
  }),
}), dislikeCard);

cards.use(errors());

module.exports = { cards };
