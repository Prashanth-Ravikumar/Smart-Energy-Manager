const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
    },
    powerLimit: {
        type: Number,
        default: 1000,  // Default total power limit for all devices
        required: [true, 'Power limit is required'],
    },
    devices: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Device',
    }],
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
