const mongoose = require('mongoose');

const waterReadingSchema = new mongoose.Schema({
    deviceId: { type: String, required: true },
    deviceName: { type: String, required: true },
    flowRate: { type: Number, required: true },
    pulseCount: { type: Number, required: true },
    sessionWater: { type: Number, required: true },
    totalWater: { type: Number, required: true },
    status: { type: String, required: true, enum: ['FLOWING', 'IDLE'] },
    time: { type: String, required: true },
    date: { type: String, required: true },
}, {
    timestamps: true 
});

module.exports = mongoose.model('WaterReading', waterReadingSchema);
