const mongoose = require('mongoose');

mongoose.connect(process.env.DATABASE_URL);

/*USER DUMMY*/
// const User = mongoose.model('User', {
//   name: {
//     type: String,
//     trim: true,
//   },
//   age: {
//     type: Number,
//     default: 0,
//     validate(val) {},  //1st way to validate
//     validate: {
//       validator: function (val) {
//         if (val < 18) throw new Error('Age must be 18+');
//       },
//     },
//   },
//   email: {
//     type: String,
//     trim: true,
//     lowercase: true,
//     required: true,
//     validate: {
//       validator: function (val) {
//         if (!validator.isEmail(val)) throw new Error('Invalid Email');
//       },
//     },
//   },
// });

// const newUser = new User({
//   name: 'Not_Bond',
//   age: 23,
//   email: 'abc',
// });

// newUser
//   .save()
//   .then(res => {
//     console.log('Res and newUser are Same');
//     console.log(res);
//     console.log(newUser);
//   })
//   .catch(error => {
//     console.log(error);
//   });

/*TASK_APP*/
// const Task = mongoose.model('Task', {
//   description: {
//     type: String,
//     trim: true,
//     required: true,
//   },
//   completed: {
//     type: Boolean,
//     default: false,
//   },
// });

// const newTask = new Task({
//   description: 'Learn Mongoose Library',
//   completed: false,
// });

// newTask
//   .save()
//   .then(res => {
//     console.log('Res and newUser are Same');
//     console.log(res);
//     console.log(newTask);
//   })
//   .catch(error => {
//     console.log(error);
//   });
