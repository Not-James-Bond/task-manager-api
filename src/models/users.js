const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Task = require('./tasks');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    age: {
      type: Number,
      default: 0,
      // validate(val) {}, //1st way to validate
      validate: {
        validator: function (val) {
          if (val < 18) throw new Error('Age must be 18+');
        },
      },
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      required: true,
      unique: true,
      validate: {
        validator: function (val) {
          if (!validator.isEmail(val)) throw new Error('Invalid Email');
        },
      },
    },
    password: {
      type: String,
      required: true,
      minlength: 7,
      trim: true,
      validate(value) {
        if (value.toLowerCase().includes('password')) {
          throw new Error('Password cannot contain "password"');
        }
      },
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
    avatars: {
      type: Buffer,
    },
  },
  { timestamps: true }
);

userSchema.virtual('taskList', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'author',
});

//We can edit inbuilt methods to delete props or make new function for the Same
//Editing inbuilt method

// userSchema.methods.toJSON = function () {
//   const user = this;
//   const userObject = user.toObject();

//   delete userObject.password;
//   delete userObject.tokens;
//   delete userObject.avatars;

//   return userObject;
// };

//User Definded function for the same as above
userSchema.methods.getPublicProfile = function () {
  //user === this
  // console.log(this);
  const userObject = this.toObject();
  // console.log(userObject);
  delete userObject.password;
  delete userObject.tokens;
  delete userObject.avatars;

  return userObject;
};

userSchema.methods.generateAuthToken = async function () {
  const token = jwt.sign({ _id: this._id.toString() }, process.env.JWT_SECRET_KEY);

  this.tokens = this.tokens.concat({ token: token });
  await this.save();
  return token;
};

//
userSchema.statics.findByCredentials = async (email, password) => {
  const loggedUser = await User.findOne({ email: email });

  if (!loggedUser) {
    throw new Error('Unable To Login');
  }

  const isMatch = await bcrypt.compare(password, loggedUser.password);

  if (!isMatch) {
    throw new Error('Unable To Login');
  }
  return loggedUser;
};

//Hashing The Password before Saving
userSchema.pre('save', async function (next) {
  // console.log('MiddleWare save Pre');

  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 8);
  }

  next();
});

//Deleteing user task when user is removed
userSchema.pre('remove', async function () {
  await Task.deleteMany({ author: this._id });
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
