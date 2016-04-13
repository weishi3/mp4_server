// Load required packages
var mongoose = require('mongoose');

var Schema = mongoose.Schema;
// Define our beer schema
var TaskSchema   = new mongoose.Schema({
  	name: {
		type: String,
		trim: true,
		required: true
	},
	description: {
		type: String,
		trim: true,
		default: ''
	},
	deadline: {
		type: Date,
		required: true
	},
	completed: Boolean,
	assignedUser: {
		type: String,
		default: ''
	},
	assignedUserName: {
		type: String,
		default: 'unassigned'
	},
	dateCreated: {
		type: Date,
		default: Date.now
	}
});

// Export the Mongoose model
module.exports = mongoose.model('Task', TaskSchema,'tasks');
