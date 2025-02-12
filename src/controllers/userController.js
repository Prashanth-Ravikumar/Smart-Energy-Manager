const User = require('../models/userModel');
const Device = require('../models/deviceModel');

// Create a new user
const createUser = async (req, res) => {
    const { name, email, password, powerLimit } = req.body;

    try {
        const user = new User({ name, email, password, powerLimit });
        const savedUser = await user.save();
        res.status(201).json(savedUser);
    } catch (error) {
        res.status(500).json({ message: 'Error creating user', error });
    }
};

// Set or update user power limit
const setUserPowerLimit = async (req, res) => {
    const { userId, powerLimit } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.powerLimit = powerLimit;
        await user.save();

        res.status(200).json({ message: 'Power limit updated', powerLimit: user.powerLimit });
    } catch (error) {
        res.status(500).json({ message: 'Error updating power limit', error });
    }
};

// Check total power consumption for a user
const checkUserPowerConsumption = async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await User.findById(userId).populate('devices');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const totalPowerConsumed = user.devices.reduce((total, device) => total + device.powerConsumed, 0);

        if (totalPowerConsumed > user.powerLimit) {
            return res.status(200).json({
                message: `Alert! Total power consumption exceeded: ${totalPowerConsumed} > ${user.powerLimit}`,
                totalPowerConsumed,
                powerLimit: user.powerLimit,
            });
        }

        res.status(200).json({
            message: `Within limit: ${totalPowerConsumed} <= ${user.powerLimit}`,
            totalPowerConsumed,
            powerLimit: user.powerLimit,
        });
    } catch (error) {
        res.status(500).json({ message: 'Error checking power consumption', error });
    }
};

module.exports = {
    createUser,
    setUserPowerLimit,
    checkUserPowerConsumption,
};
