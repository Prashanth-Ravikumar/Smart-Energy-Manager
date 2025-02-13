const Device = require('../models/deviceModel');
const User = require('../models/userModel');
const PowerEntry = require('../models/powerEntryModel');
const { v4: uuidv4 } = require('uuid');

// Add a device to a user
const addDeviceToUser = async (req, res) => {
    const { userId, deviceName, powerConsumed } = req.body; // Remove deviceId from request

    try {
        // Check if the user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if the deviceName already exists for this user
        const existingDevice = await Device.findOne({ userId, deviceName });
        if (existingDevice) {
            return res.status(400).json({ message: 'Device with this name already exists for the user' });
        }

        // Generate a unique deviceId using uuid
        const deviceId = uuidv4();

        // Create a new device with the generated deviceId
        const device = new Device({
            userId,
            deviceId,  // Automatically generated deviceId
            deviceName,
            powerConsumed,
        });

        // Save the device and update the user's devices array
        const savedDevice = await device.save();
        user.devices.push(savedDevice._id);
        await user.save();

        res.status(201).json(savedDevice);
    } catch (error) {
        res.status(500).json({ message: 'Error adding device', error });
    }
};

// Get all devices for a user
const getAllDevicesForUser = async (req, res) => {
    const { userId } = req.params;

    try {
        // Check if the user exists
        const user = await User.findById(userId).populate('devices'); // Populate the devices array
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // If the user has no devices, return an empty array
        if (user.devices.length === 0) {
            return res.status(200).json({ message: 'No devices found for this user', devices: [] });
        }

        // Return the list of devices
        res.status(200).json({ devices: user.devices });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching devices for user', error });
    }
};


// Get a specific device by its ID
const getDevice = async (req, res) => {
    const { deviceId } = req.params;
    const { userId } = req.query; // Get userId from query params to ensure the device belongs to the user

    try {
        const device = await Device.findOne({ userId, deviceId });
        if (!device) {
            return res.status(404).json({ message: 'Device not found for this user' });
        }
        res.status(200).json(device);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching device', error });
    }
};

// Update a specific device by its ID for a specific user
const updateDevice = async (req, res) => {
    const { deviceId } = req.params;
    const { userId } = req.body;
    const { deviceName } = req.body;

    try {
        // Ensure the device exists for this user
        const device = await Device.findOneAndUpdate(
            { userId, deviceId },
            { deviceName, },
            { new: true, runValidators: true }
        );

        if (!device) {
            return res.status(404).json({ message: 'Device not found for this user' });
        }

        res.status(200).json(device);
    } catch (error) {
        res.status(500).json({ message: 'Error updating device', error });
    }
};

// Delete a specific device by its ID for a specific user
const deleteDevice = async (req, res) => {
    const { deviceId } = req.params;
    const { userId } = req.body;

    try {
        // Find and delete the device for this user
        const device = await Device.findOneAndDelete({ userId, deviceId });
        if (!device) {
            return res.status(404).json({ message: 'Device not found for this user' });
        }

        // Remove the device from the user's device list
        const user = await User.findById(userId);
        if (user) {
            user.devices = user.devices.filter((d) => d.toString() !== device._id.toString());
            await user.save();
        }

        res.status(200).json({ message: 'Device deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting device', error });
    }
};


// Create a new energy consumption entry for a device
const logEnergyConsumption = async (req, res) => {
    const { deviceId, powerConsumed } = req.body;

    try {
        const device = await Device.findOne({ deviceId });
        if (!device) {
            return res.status(404).json({ message: 'Device not found' });
        }

        // Update the device's power consumed
        device.powerConsumed += powerConsumed;
        await device.save();

        // Create a new power entry with the current consumption
        const powerEntry = new PowerEntry({
            userId: device.userId,
            deviceId: device.deviceId,
            powerConsumed,
        });
        await powerEntry.save();

        res.status(201).json({ message: 'Energy consumption recorded', powerEntry });
    } catch (error) {
        res.status(500).json({ message: 'Error creating energy entry', error });
    }
};

// Function to retrieve all power consumption entries for a user or device
const getPowerConsumptionHistory = async (req, res) => {
    const { userId, deviceId } = req.query;

    try {
        let query = {};

        if (userId) {
            query.userId = userId;
        }
        if (deviceId) {
            query.deviceId = deviceId;
        }
        console.log(query);
        
        const powerEntries = await PowerEntry.find(query).sort({ timestamp: -1 });

        res.status(200).json({ powerEntries });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching power consumption history', error });
    }
};

// Function to get total power consumed by a device
const getTotalPowerConsumedByDevice = async (req, res) => {
    const { deviceId } = req.params;

    try {
        const device = await Device.findOne({ deviceId });
        if (!device) {
            return res.status(404).json({ message: 'Device not found' });
        }

        // Calculate the total power consumed by this device
        const totalPowerConsumed = await PowerEntry.aggregate([
            { $match: { deviceId: device.deviceId } },
            { $group: { _id: "$deviceId", totalPower: { $sum: "$powerConsumed" } } }
        ]);

        if (totalPowerConsumed.length === 0) {
            return res.status(200).json({ message: 'No power consumption recorded for this device' });
        }

        res.status(200).json({ deviceId: device.deviceId, totalPowerConsumed: totalPowerConsumed[0].totalPower });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching total power consumed', error });
    }
};

module.exports = {
    addDeviceToUser,
    getAllDevicesForUser,
    getDevice,
    updateDevice,
    deleteDevice,
    logEnergyConsumption,
    getPowerConsumptionHistory,
    getTotalPowerConsumedByDevice
};
