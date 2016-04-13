// Get the packages we need
var express = require('express');
var mongoose = require('mongoose');


var User=require('./models/user')
var Task=require('./models/task')

var bodyParser = require('body-parser');
var router = express.Router();
var ObjectId = mongoose.Types.ObjectId;


//replace this with your Mongolab URL
mongoose.connect('mongodb://weishi3:Sw19940610@ds015690.mlab.com:15690/cs498rkmp4');
//mongoose.connect('mongodb://localhost/mp4');

// Create our Express application
var app = express();

// Use environment defined port or 4000
var port = process.env.PORT || 4000;

//Allow CORS so that backend and frontend could pe put on different servers
var allowCrossDomain = function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE");
  next();
};
app.use(allowCrossDomain);

// Use the body-parser package in our application
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());


// All our routes will start with /api
app.use('/api', router);



//Default route here
var homeRoute = router.route('/');

homeRoute.get(function(req, res) {
  res.json({ message: 'Hello World!' });
});

// for user


function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}




function idIsValid(id, res, next) {
  if (!ObjectId.isValid(id)) {
    res.status(404).json({
      message: 'Could not find: Invalid id; ',
      error: 'Invalid id',
      data: {}
    });
    return false;
  }
  return true;
}

router.route('/users')

  // create a bear (accessed at POST http://localhost:8080/api/bears)
    .post(function(req, res,next) {
      var errMsg = 'Cannot Add User:';
      var isError = false;
      if (!req.body.name || !req.body.name.trim()) {
        isError = true;
        errMsg += 'You need input a name.';
      }
      if (!req.body.email || !req.body.email.trim()) {
        isError = true;
        errMsg += ' You need input a email.';
      }
      if (req.body.pendingTasks) {
        for (var i = 0; i < req.body.pendingTasks.length; i++) {
          if (!ObjectId.isValid(req.body.pendingTasks[i])) {
            isError = true;
            errMsg += ' The certain pending task not exist!';
            break;
          }
        }
      }

      if (isError) {
        res.status(500).json({
          message: errMsg,
          data: {}
        });
        return;
      }
      var newData = {
        name: req.body.name.trim(),
        email: req.body.email.trim(),

      };
      if (req.body.pendingTasks) {
        newData.pendingTasks = JSON.parse(req.body.pendingTasks);
      }
      var newUser = new User(newData);
      newUser.save(function(err, user) {
        if (err) {
          res.status(500).json({
            message: 'Cannot Add User: Server error (This user may exist).',
            error: err,
            data: {}
          });
        } else {
          res.status(201).json({
            message: 'Successfully Added a user.',
            data: user
          });
        }
      });
    })
    .get(function(req, res,next) {

      var where  = req.query.where  ? JSON.parse(req.query.where)  : {};
      var sort   = req.query.sort   ? JSON.parse(req.query.sort)   : {};
      var select = req.query.select ? JSON.parse(req.query.select) : {};
      var skip   = req.query.skip   ? parseInt(req.query.skip)     : 0;
      var limit  = req.query.limit  ? parseInt(req.query.limit)    : 0;
      var count  = req.query.count  ? req.query.count === 'true'   : false;
      User.find(where)
        //.populate('pendingTasks', null, where)
          .select(select)
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .exec(function(err, users) {
            if (err) {
              res.status(404).json({
                message: 'Cannot get users',
                error: err,
                data: []
              });
            } else {
              res.status(200).json({
                message: 'Successfully get users',
                data: count ? users.length : users
              });
            }
          });

    })

    .options(function(req, res,next){
      res.sendStatus(200);
    });

router.route('/users/:user_id')
    .get(function(req, res,next) {
      var id = req.params.user_id;
      if (!idIsValid(id, res, next))
        return;
      User.findById(id)
        //.populate('pendingTasks')
          .exec(function(err, user) {
            if (err) {
              res.status(500).json({
                message: 'Cannot get user: Server error.',
                error: err,
                data: {}
              });
            } else if (!user) {
              res.status(404).json({
                message: 'Cannot get user.',
                error: err,
                data: {}
              });
            } else {
              res.status(200).json({
                message: 'Successfully get user.',
                data: user
              });
            }
          });
    })
    .put(function(req, res,next) {

      // use our bear model to find the bear we want
      var id = req.params.user_id;
      if (!idIsValid(id, res, next))
        return;
      var errMsg = 'Cannot update user:';
      var isError = false;
      if (!req.body.name || !req.body.name.trim()) {
        isError = true;
        errMsg += ' You need input a name.';
      }
      if (!req.body.email || !req.body.email.trim()) {
        isError = true;
        errMsg += 'You need input an email address.';
      }
      if (req.body.pendingTasks) {
        console.log(req.body.pendingTasks);
        if (req.body.pendingTasks.constructor === Array) {
          for (var i = 0; i < req.body.pendingTasks.length; i++) {
            if (!ObjectId.isValid(req.body.pendingTasks[i])) {
              isError = true;
              errMsg += ' The certain pending task does not exist!';
              break;
            }
          }
        } else {
          isError = true;
          errMsg += 'Invalid Type for Pending Task: Should Be Array Of String!';
        }
      }
      if (req.body.dateCreated) {
        var temp = isNumeric(req.body.dateCreated) ? parseFloat(req.body.dateCreated) : req.body.dateCreated;
        if (new Date(temp) === "Invalid Date"
            || isNaN(new Date(temp))) {
          isError = true;
          errMsg += ' Invalid Type for Date Created!';
        }
      }
      if (isError) {
        res.status(500).json({
          message: errMsg,
          data: {}
        });
        return;
      }
      var newData = {};
      if (req.body.name && req.body.name.trim()) {
        newData.name = req.body.name.trim();
      }
      if (req.body.email && req.body.email.trim()) {
        newData.email = req.body.email.trim();
      }
      if (req.body.pendingTasks) {
        newData.pendingTasks = req.body.pendingTasks;
      }
      if (req.body.dateCreated) {
        newData.dateCreated = new Date(isNumeric(req.body.dateCreated)
            ? parseFloat(req.body.dateCreated)
            : req.body.dateCreated);
      }
      User.findByIdAndUpdate(id, newData, { overwrite: true }, function(err, user) {
        if (err) {
          res.status(500).json({
            message: 'Cannot update user: Server error.',
            error: err,
            data: {}
          });
        } else if (!user) {
          res.status(404).json({
            message: 'Cannot find user.',
            error: err,
            data: {}
          });
        } else {
          res.status(200).json({
            message: 'Successfully update user.',
            data: user
          });
        }
      });
    })
    .delete(function(req, res,next) {
      var id = req.params.user_id;
      if (!idIsValid(id, res, next))
        return;
      User.findById(id)
          .remove()
          .exec(function(err, user) {
            if (err) {
              res.status(500).json({
                message: 'Cannot delete user: Server error.',
                error: err,
                data: {}
              });
            } else if (!user) {
              res.status(404).json({
                message: 'Cannot find this user.',
                error: err,
                data: {}
              });
            } else {
              res.status(200).json({
                message: 'Successfully deleted the user.',
                data: {}
              });
            }
          });
    });



//for task
router.route('/tasks')

  // create a bear (accessed at POST http://localhost:8080/api/bears)
    .post(function(req, res,next) {

      var errMsg = 'Cannot create task:';
      var isError = false;
      if (!req.body.name || !req.body.name.trim()) {
        isError = true;
        errMsg += ' You need input a name.';
      }
      if (!req.body.deadline || (typeof req.body.deadline === 'string' && !req.body.deadline.trim())) {
        isError = true;
        errMsg += ' You need input a deadline.';
      }
      else if (req.body.deadline) {
        var temp = isNumeric(req.body.deadline) ? parseFloat(req.body.deadline) : req.body.deadline;
        if (new Date(temp) === "Invalid Date"
            || isNaN(new Date(temp))) {
          isError = true;
          errMsg += ' Invalid Type for deadline!';
        }
      }
      if (req.body.completed === null
          ||
          (typeof req.body.completed === 'string'
          && req.body.completed !== 'true'
          && req.body.completed !== 'false')
          && (typeof req.body.completed !== 'boolean')) {
        isError = true;
        errMsg += ' Invalid type for completed!';
      }
      if (req.body.assignedUserName !== 'unassigned'
          && req.body.assignedUser
          && !ObjectId.isValid(req.body.assignedUser)) {
        isError = true;
        errMsg += ' Invalid type for AssignedUser!'
            + req.body.assignedUser + '\'.';
      }
      if (isError) {
        res.status(500).json({
          message: errMsg,
          data: {}
        });
        return;
      }
      var newData = {
        name: req.body.name.trim(),
        deadline: new Date(isNumeric(req.body.deadline)
            ? parseFloat(req.body.deadline)
            : req.body.deadline)
      };
      if (req.body.description && req.body.description.trim()) {
        newData.description = req.body.description.trim();
      }
      if (req.body.completed !== null) {
        newData.completed = typeof req.body.completed === 'boolean'
            ? req.body.completed
            : typeof req.body.completed === 'string'
            ? req.body.completed === 'true'
            : false;
      }
      if (req.body.assignedUserName) {
        if (req.body.assignedUserName === 'unassigned') {
          newData.assignedUser = '';
          newData.assignedUserName = 'unassigned';
        } else {
          newData.assignedUser = req.body.assignedUser;
          newData.assignedUserName = req.body.assignedUserName;
        }
      }
      var newTask = new Task(newData);
      newTask.save(function(err, task) {
        if (err) {
          res.status(500).json({
            message: 'Cannot add task: server error.',
            error: err,
            data: {}
          });
        } else {
          res.status(201).json({
            message: 'Successfully added a task.',
            data: task
          });
        }
      });

    })
    .get(function(req, res,next) {
      var where  = req.query.where  ? JSON.parse(req.query.where)  : {};
      var sort   = req.query.sort   ? JSON.parse(req.query.sort)   : {};
      var select = req.query.select ? JSON.parse(req.query.select) : {};
      var skip   = req.query.skip   ? parseInt(req.query.skip)     : 0;
      var limit  = req.query.limit  ? parseInt(req.query.limit)    : 0;
      var count  = req.query.count  ? req.query.count === 'true'   : false;
      Task.find(where)
        //.populate('assignedUser', null, where)
          .select(select)
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .exec(function(err, tasks) {
            if (err) {
              res.status(404).json({
                message: 'Cannot get tasks.',
                error: err,
                data: []
              });
            } else {
              res.status(200).json({
                message: 'Successfully get tasks.',
                data: count ? tasks.length : tasks
              });
            }
          });

    })
    .options(function(req, res,next){
      res.sendStatus(200);
    });


router.route('/tasks/:task_id')

  // get the bear with that id (accessed at GET http://localhost:8080/api/bears/:bear_id)
    .get(function(req, res,next) {
      var id = req.params.task_id;
      if (!idIsValid(id, res, next))
        return;
      Task.findById(id)
        //.populate('assignedUser')
          .exec(function(err, task) {
            if (err) {
              res.status(500).json({
                message: 'Cannot get task: Server error.',
                error: err,
                data: {}
              });
            } else if (!task) {
              res.status(404).json({
                message: 'Cannot find task.',
                error: err,
                data: {}
              });
            } else {
              res.status(200).json({
                message: 'Successfully get task.',
                data: task
              });
            }
          });
    })
    .put(function(req, res,next) {

      // use our bear model to find the bear we want
      var id = req.params.task_id;
      if (!idIsValid(id, res, next))
        return;
      var errMsg = 'Cannot not update task:';
      var isError = false;
      if (!req.body.name && req.body.name.trim()) {
        isError = true;
        errMsg += '  \'name\' should not be empty.';
      }
      if (!req.body.deadline || (typeof req.body.deadline === 'string' && !req.body.deadline.trim())) {
        isError = true;
        errMsg += '  \'deadline\'should not be empty.';
      }
      else if (req.body.deadline) {
        var temp = isNumeric(req.body.deadline) ? parseFloat(req.body.deadline) : req.body.deadline;
        if (new Date(temp) === "Invalid Date"
            || isNaN(new Date(temp))) {
          isError = true;
          errMsg += ' Invalid type for deadline!';
        }
      }
      if (req.body.completed === null
          ||
          (typeof req.body.completed === 'string'
          && req.body.completed !== 'true'
          && req.body.completed !== 'false')
          && (typeof req.body.completed !== 'boolean')) {
        isError = true;
        errMsg += ' Invalid type for completed';
      }
      if (req.body.assignedUserName !== 'unassigned'
          && req.body.assignedUser
          && !ObjectId.isValid(req.body.assignedUser)) {
        isError = true;
        errMsg += ' Invalid type for assignedUser';
      }
      if (req.body.dateCreated) {
        var temp = isNumeric(req.body.dateCreated) ? parseFloat(req.body.dateCreated) : req.body.dateCreated;
        if (new Date(temp) === "Invalid Date"
            || isNaN(new Date(temp))) {
          isError = true;
          errMsg += ' Invalid Type for date Created';
        }
      }
      if (isError) {
        res.status(500).json({
          message: errMsg,
          data: {}
        });
        return;
      }
      var newData = {};
      if (req.body.name && req.body.name.trim()) {
        newData.name = req.body.name;
      }
      if (req.body.deadline) {
        newData.deadline = new Date(isNumeric(req.body.deadline)
            ? parseFloat(req.body.deadline)
            : req.body.deadline);
      }
      if (req.body.description && req.body.description.trim()) {
        newData.description = req.body.description.trim();
      }
      if (req.body.completed !== null) {
        newData.completed = typeof req.body.completed === 'boolean'
            ? req.body.completed
            : typeof req.body.completed === 'string'
            ? req.body.completed === 'true'
            : false;
      }
      if (req.body.assignedUserName) {
        if (req.body.assignedUserName === 'unassigned') {
          newData.assignedUser = '';
          newData.assignedUserName = 'unassigned';
        } else {
          newData.assignedUser = req.body.assignedUser;
          newData.assignedUserName = req.body.assignedUserName;
        }
      }
      if (req.body.dateCreated) {
        newData.dateCreated = new Date(isNumeric(req.body.dateCreated)
            ? parseFloat(req.body.dateCreated)
            : req.body.dateCreated);
      }
      Task.findByIdAndUpdate(id, newData, { overwrite: true }, function(err, task) {
        if (err) {
          res.status(500).json({
            message: 'Server error',
            error: err,
            data: {}
          });
        } else if (!task) {
          res.status(404).json({
            message: 'Cannot find this task',
            error: err,
            data: {}
          });
        } else {
          res.status(200).json({
            message: 'Successfully update this task',
            data: task
          });
        }
      });
    })
    .delete(function(req, res,next) {
      var id = req.params.task_id;
      if (!idIsValid(id, res, next))
        return;
      Task.findById(id)
          .remove()
          .exec(function(err, task) {
            if (err) {
              res.status(500).json({
                message: 'cannot delete task: Server error.',
                error: err,
                data: {}
              });
            } else if (!task) {
              res.status(404).json({
                message: 'Cannot find the task.',
                error: err,
                data: {}
              });
            } else {
              res.status(200).json({
                message: 'Successfully deleted the task.',
                data: {}
              });
            }
          });
    });











//Add more routes here

// Start the server
app.listen(port);
console.log('Server running on port ' + port);
