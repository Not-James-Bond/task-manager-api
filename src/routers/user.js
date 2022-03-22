const express = require('express');
const User = require('../models/users');
const auth = require('../middleware/auth');
const multer = require('multer');
const router = new express.Router();

/*USER END POINT HANDLING*/

//Normal Chaining Method//
// app.post('/users', (req, res) => {
//   //   res.send('Test');
//   //   console.log(req.body);
//   const newUser = new User(req.body);

//   newUser
//     .save()
//     .then(res => {
//       res.status(201).send(newUser);
//     })
//     .catch(error => {
//       res.status(400).send(error);
//       //   res.send(error); //WE CAN CHAIN .send()
//     });
// });

// Async Way of Routing(Adding Users)//
router.post('/users', async (req, res) => {
  const newUser = new User(req.body);

  try {
    const token = await newUser.generateAuthToken();
    res.status(201).send({ newUser: newUser.getPublicProfile(), token });
  } catch (err) {
    res.status(400).send(err);
  }
});

//Login User
router.post('/users/login', async (req, res) => {
  try {
    const loggedInUser = await User.findByCredentials(req.body.email, req.body.password);
    const token = await loggedInUser.generateAuthToken();
    res.send({ loggedInUser: loggedInUser.getPublicProfile(), token });
  } catch (err) {
    // console.log(err);
    res.status(400).send();
  }
});

//Logout User
router.post('/users/logout', auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(token => token.token != req.token);
    await req.user.save();

    res.send('Logged Out');
  } catch (err) {
    res.status(500);
  }
});

//Logout All instance of a User
router.post('/users/logoutAll', auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();

    res.send('Logged Out');
  } catch (err) {
    res.status(500);
  }
});

//Getting All Users (Changed to get my Info)
// router.get('/users', auth, async (req, res) => {
//   try {
//     const allUsers = await User.find({});
//     res.send(allUsers);
//   } catch (error) {
//     res.status(500).send(error);
//   }
// });
//Get my Info
router.get('/users/me', auth, async (req, res) => {
  res.send(req.user.getPublicProfile());
});

// //Getting Specific User by ID
// router.get('/users/:id', async (req, res) => {
//   const _id = req.params.id;

//   try {
//     const specificUser = await User.findById(_id);
//     return !specificUser ? res.status(404) : res.send(specificUser);
//   } catch (error) {
//     res.status(500).send(error);
//   }
// });

//Updating User by ID
router.patch('/users/me', auth, async (req, res) => {
  const _id = req.user._id;
  const allowedUpdates = ['name', 'email', 'password', 'age'];
  const updates = Object.keys(req.body);
  const isValidOperation = updates.every(val => allowedUpdates.includes(val));

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid Update' });
  }

  try {
    // const updatedUsers = await User.findByIdAndUpdate(_id, req.body, {
    //   new: true,
    //   runValidators: true,
    // });

    // const updatedUsers = await User.findById(_id);

    updates.forEach(update => (req.user[update] = req.body[update]));
    await req.user.save();

    // return !req.user ? res.status(404) : res.send(updatedUsers);

    res.send(req.user.getPublicProfile());
  } catch (error) {
    res.status(500).send(error);
  }
});

//Deleting the User
router.delete('/users/me', auth, async (req, res) => {
  try {
    // const deletedUser = await User.findByIdAndDelete(req.user._id);
    // if (!deletedUser) return res.status(404).send();
    await req.user.remove();
    res.send(req.user.getPublicProfile());
  } catch (error) {
    res.status.send(error);
  }
});

//Upload Avatar Image
const upload = multer({
  //After Reomoving dest the file is transfered to route method so as to store in right place (req.file)
  // dest: 'avatars',
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match('.(jpg|jpeg|png)$')) {
      return cb(new Error('Please upload a Image in jpg, jpeg & png'));
    }

    // cb(new Error('Files must be PDF'));
    cb(undefined, true);
    // cb(undefined, false);
  },
});
router.post(
  '/users/me/avatar',
  auth,
  upload.single('avatar'),
  async (req, res) => {
    req.user.avatars = req.file.buffer; //Only work with no dest/storage
    await req.user.save();
    res.send();
  },
  (error, req, res, next) => {
    //This is cb to handle error since normal error gives html format error it send proper error
    res.status(400).send({ error: error.message });
  }
);

//Deleting the Avatar Image
router.delete('/users/me/avatar', auth, async (req, res) => {
  if (!req.user.avatars) {
    res.status(400).send('No avatar to delete!');
  }
  try {
    req.user.avatars = undefined;
    await req.user.save();
    res.send();
  } catch (e) {
    res.status(500).send();
  }
});

//Getting Avatar Image
router.get('/users/:id/avatar', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || !user.avatars) throw new Error();

    res.set('Content-Type', 'image.jpg');
    res.send(user.avatars);
  } catch (err) {
    res.status(404).send();
  }
});

module.exports = router;
