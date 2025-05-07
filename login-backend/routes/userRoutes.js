const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.get('/users', verifyToken, userController.getAllUsers);
router.delete('/delete/:id', verifyToken, userController.deleteUser);
router.put('/edit/:id', verifyToken, userController.editUser);

module.exports = router;