const router = require('express').Router();
const wrap = require('co-express');
const User = require('../models/user');
const helpers = require('../helpers/query-generator');

// using co-express wraper -> note how we can store async values
function* getUsers(req, res) {
  const query = yield helpers.dbQuery(req.query, req.headers.id);
  const users = yield User.find(query)
  .populate('mainLanguage wantsToLearn.languageId wantsToLearn.levelId');
  if (users && users.length) {
    return res.json(users);
  }
  return res.status(400).json({
    success: false,
    message: 'no users found',
  });
}

// standard api method, using callbakcs
function createUser(req, res) {
  const { username } = req.body;
  User.create({
    username,
  }, (err, doc) => {
    if (err) {
      return res.status(400).json(err);
    }
    return res.json(doc);
  });
}

router.get('/', wrap(getUsers));
router.put('/', createUser);

module.exports = router;
