const express = require('express');
const router = express.Router();
const {
    createUser,
    setUserPowerLimit,
    checkUserPowerConsumption,
} = require('../controllers/userController');

// Route to create a new user
router.post('/users', createUser);

// Route to set or update user power limit
router.post('/users/set-power-limit', setUserPowerLimit);

// Route to check total power consumption for a user
router.get('/users/:userId/check-power-consumption', checkUserPowerConsumption);

module.exports = router;
