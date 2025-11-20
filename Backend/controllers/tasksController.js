const Task = require('../models/Task');

exports.createTask = async (req, res, next) => {
  try {
    const { title, description, status, priority } = req.body;
    const task = await Task.create({ 
      title, 
      description, 
      status, 
      priority, 
      owner: req.user._id 
    });
    res.status(201).json(task);
  } catch (err) { 
    next(err); 
  }
};

exports.getTasks = async (req, res, next) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { owner: req.user._id };

    const tasks = await Task.find(filter)
      .populate('owner', '_id name');

    res.json(tasks);
  } catch (err) { 
    next(err); 
  }
};

exports.getTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('owner', '_id name');

    if (!task) return res.status(404).json({ message: 'Not found' });

    const isOwner = task.owner._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    res.json(task);
  } catch (err) { 
    next(err); 
  }
};

exports.updateTask = async (req, res, next) => {
  try {
    const { title, description, status, priority } = req.body;

    const updateData = { title, description, status, priority };

    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) delete updateData[key];
    });

    const task = await Task.findById(req.params.id);

    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (task.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You don't have permission to update this task"
      });
    }

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json(updatedTask);
  } catch (err) {
    next(err);
  }
};

exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (task.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You don't have permission to delete this task"
      });
    }

    await Task.findByIdAndDelete(req.params.id);

    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    next(err);
  }
};
