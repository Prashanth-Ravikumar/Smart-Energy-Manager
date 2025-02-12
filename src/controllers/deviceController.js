const Device = require('../models/deviceModel');
const User = require('../models/userModel');
const PowerEntry = require('../models/powerEntryModel');

// Add a device to a user
const addDeviceToUser = async (req, res) => {
    const { userId, deviceId, deviceName, powerConsumed } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const device = new Device({
            userId,
            deviceId,
            deviceName,
            powerConsumed,
        });

        const savedDevice = await device.save();
        user.devices.push(savedDevice._id);
        await user.save();

        res.status(201).json(savedDevice);
    } catch (error) {
        res.status(500).json({ message: 'Error adding device', error });
    }
};


// Get a specific device by its ID
const getDevice = async (req, res) => {
    const { deviceId } = req.params;

    try {
        const device = await Device.findOne({ deviceId });
        if (!device) {
            return res.status(404).json({ message: 'Device not found' });
        }
        res.status(200).json(device);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching device', error });
    }
};

// Update a specific device by its ID
const updateDevice = async (req, res) => {
    const { deviceId } = req.params;
    const { deviceName, powerConsumed } = req.body;

    try {
        const device = await Device.findOneAndUpdate(
            { deviceId },
            { deviceName, powerConsumed },
            { new: true, runValidators: true }
        );

        if (!device) {
            return res.status(404).json({ message: 'Device not found' });
        }

        res.status(200).json(device);
    } catch (error) {
        res.status(500).json({ message: 'Error updating device', error });
    }
};

// Delete a specific device by its ID
const deleteDevice = async (req, res) => {
    const { deviceId } = req.params;

    try {
        const device = await Device.findOneAndDelete({ deviceId });
        if (!device) {
            return res.status(404).json({ message: 'Device not found' });
        }

        // Remove the device from the user's device list
        const user = await User.findById(device.userId);
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
const createEnergyConsumption = async (req, res) => {
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
            deviceId: device._id,
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
            { $match: { deviceId: device._id } },
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
    getDevice,
    updateDevice,
    deleteDevice,
    createEnergyConsumption,
    getPowerConsumptionHistory,
    getTotalPowerConsumedByDevice
};
