const express = require('express');
const router = express.Router();
const {
    addDeviceToUser, getDevice,
    updateDevice,
    deleteDevice,
    createEnergyConsumption,
    getPowerConsumptionHistory,
    getTotalPowerConsumedByDevice
} = require('../controllers/deviceController');

// Route to add a device to a user
router.post('/devices', addDeviceToUser);

// Route to get a specific device by ID
router.get('/devices/:deviceId', getDevice);

// Route to update a specific device by ID
router.put('/devices/:deviceId', updateDevice);

// Route to delete a specific device by ID
router.delete('/devices/:deviceId', deleteDevice);

// Route to create a new energy entry for a device
router.post('/devices/energy', createEnergyConsumption);


// Route to get power consumption history for a user or device
router.get('/devices/power-history', getPowerConsumptionHistory);

// Route to get total power consumed by a device
router.get('/devices/:deviceId/total-power', getTotalPowerConsumedByDevice);


module.exports = router;
