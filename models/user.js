var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var UserSchema = new Schema({
	name: {
		type: String,
		trim: true,
		required: true
	},
	email: {
		type: String,
		trim: true,
		required: true,
		unique: true
	},
	pendingTasks: {
		type: [String],
		default: []
	},
	dateCreated: {
		type: Date,
		default: Date.now
	}
});

module.exports = mongoose.model('User', UserSchema, 'users');
