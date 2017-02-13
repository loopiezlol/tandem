const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId=Schema.ObjectId;

const User = new mongoose.Schema({
	id: ObjectId,
	firstName:String,
	lastName:String,
	email : {type:String, unique: true },
	password: String,
});

module.exports = mongoose.model('User', User);
