const cards = require('express').Router();

const {
  createCard,
  getCards,
  deleteCardId,
  likeCard,
  dislikeCard,
} = require('../controllers/cards');

cards.post('/', createCard);

cards.get('/', getCards);

cards.delete('/:id', deleteCardId);

cards.put('/:id/likes', likeCard);

cards.delete('/:id/likes', dislikeCard);

module.exports = { cards };
