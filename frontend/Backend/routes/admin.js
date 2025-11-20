const express = require('express');
const { getUsers, getUserStats, deleteUser } = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/users', getUsers);
router.get('/stats', getUserStats);
router.delete('/users/:id', deleteUser);

module.exports = router;
