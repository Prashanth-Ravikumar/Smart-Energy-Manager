const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    deviceId: {
        type: String,
        required: [true, 'Device ID is required'],
        unique: true
    },
    deviceName: {
        type: String,
        required: [true, 'Device name is required'],
    },
    powerConsumed: {
        type: Number,
        required: [true, 'Power consumed is required'],
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

module.exports = mongoose.model('Device', deviceSchema);
