module.exports = {
  secret: 'toblazeornottoblazethatisthequestion',
  db: process.env.NODE_ENV === 'production' ? 'mongodb://heroku_6jpxlz5h:52lakerms0car7kcmg6au1b8ek@ds131510.mlab.com:31510/heroku_6jpxlz5h' : 'mongodb://localhost/tandem',
  mailerLogin: 'daybreak.vk@gmail.com',
  mailerPassword: 'theyfoundmypassword',
  server: process.env.NODE_ENV === 'production' ? 'https://tandem-kcl.herokuapp.com' : 'http://localhost:3000',
};
