const router = require('express').Router();
const wrap = require('co-express');
const User = require('../models/user');
const helpers = require('../helpers/query-generator');

// using co-express wraper -> note how we can store async values
function* getUsers(req, res) {
  //const query = yield helpers.dbQuery(req.query, req.headers.id);
  const query = {}
  console.log(query);
  const users = yield User.find(query)
  .populate('mainLanguage wantsToLearn.languageId wantsToLearn.levelId');
  res.json(users);
}

// standard api method, using callbakcs
function createUser(req, res) {
  const { username } = req.body;
  User.create({
    username,
  }, (err, doc) => {
    res.json(doc);
  });
}

router.get('/', wrap(getUsers));
router.put('/', createUser);

module.exports = router;
