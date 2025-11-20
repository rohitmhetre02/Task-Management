const express = require('express');
const { body } = require('express-validator');
const { validateRequest } = require('../utils/validate');
const {
  createTask, getTasks, getTask, updateTask, deleteTask
} = require('../controllers/tasksController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', getTasks);
router.post('/', [
    body('title').notEmpty(),
    body('status').isIn(['To Do', 'In Progress', 'Done']),
    body('priority').isIn(['Low', 'Medium', 'High']),
    validateRequest
], createTask);
router.get('/:id', getTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

module.exports = router;
