const express = require('express');
const { protect } = require("../middleware/authMiddleware");
const { admin } = require("../middleware/roleMiddleware");
const { registerUser, authUser, allUsers, createUser, updateUser, deleteUser } = require("../controllers/userController");

const router = express.Router();

router.route('/').post(registerUser).get(protect, allUsers);
router.post('/login', authUser);

// Admin CRUD operations
router.route('/admin/users')
  .post(protect, admin, createUser)
  .get(protect, admin, allUsers);

router.route('/admin/users/:id')
  .put(protect, admin, updateUser)
  .delete(protect, admin, deleteUser);

module.exports = router;
