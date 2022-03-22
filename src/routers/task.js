const express = require('express');
const Task = require('../models/tasks');
const auth = require('../middleware/auth');

const router = new express.Router();

/*TASK_APP END POINT HANDLING*/
router.post('/tasks', auth, async (req, res) => {
  // res.send('Connected Successfully');
  // const newTask = new Task(req.body);
  const newTask = new Task({
    ...req.body,
    author: req.user._id,
  });

  try {
    await newTask.save();
    // res.send(newTask);
    res.status(201).send(newTask);
  } catch (error) {
    res.status(400).send(error);
  }
});

//Getting All the Tasks
//   Adding Query to get certain data
//         Pagination(limit skip eg. getting 00-10 /tasks?limit10&skip=0
//                                   getting 10-20 /tasks?limit10&skip=10)
//         Sorting(eg sortBy=createdAt_asc
//                    sortNy=createdAt_desc)
router.get('/tasks', auth, async (req, res) => {
  const match = {};
  const sort = {};

  if (req.query.completed) {
    match.completed = req.query.completed === 'true';
  }

  if (req.query.sortBy) {
    const sortParts = req.query.sortBy.split('_');
    sort[sortParts[0]] = sortParts[1] === 'desc' ? -1 : 1;
  }

  try {
    // const allTasks = await Task.find({ author: req.user.id });
    // res.send(allTasks);

    await req.user.populate({
      path: 'taskList',
      match,
      options: {
        limit: parseInt(req.query.limit),
        skip: parseInt(req.query.skip),
        // sort: {
        //   // createdAt: -1,
        //   completed: 1,
        // },
        sort,
      },
    });
    // console.log(req.user);
    res.send(req.user.taskList);
  } catch (error) {
    res.status(500).send(error);
  }
});

//Getting Specific Task by ID
router.get('/tasks/:id', auth, async (req, res) => {
  const _id = req.params.id;

  try {
    const specificTask = await Task.findOne({ _id, author: req.user._id });
    return !req.user ? res.status(404).send() : res.send(specificTask);
  } catch (error) {
    res.status(500).send('No Data Found');
  }
});

//Updating Task by ID
router.patch('/tasks/:id', auth, async (req, res) => {
  const _id = req.params.id;
  const allowedUpdates = ['description', 'completed'];
  const updates = Object.keys(req.body);
  const isValidProperty = updates.every(property => allowedUpdates.includes(property));

  if (!isValidProperty) return res.status(400).send({ error: 'Invalid Property' });

  try {
    // const updatedTask = await Task.findByIdAndUpdate(_id, req.body, {
    //   new: true,
    //   runValidators: true,
    // });
    const updatedTask = await Task.findOne({ _id, author: req.user._id });
    // console.log(!updatedTask);
    if (!updatedTask) {
      return res.status(404).send('Not Found');
    }

    updates.forEach(property => (updatedTask[property] = req.body[property]));
    await updatedTask.save();

    res.send(updatedTask);
  } catch (error) {
    res.status(500).send(error);
  }
});

//Deleting the Task
router.delete('/tasks/:id', auth, async (req, res) => {
  try {
    const deletedTask = await Task.findOne({ _id: req.params.id, author: req.user._id });
    if (!deletedTask) return res.status(404).send();

    res.send(deletedTask);
  } catch (error) {
    res.status.send(error);
  }
});

module.exports = router;
