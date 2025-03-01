const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true},
    logisticsId: {type: Number, required: true},
    shopId: {type: String, required: true, trim: true, lowercase: true },
    product: {type: String, enum: ["wheat", "sugar", "oil"], required: true, trim: true},
    reportMessage: {type: String, required: true, trim: true},
    status: {type: String, required: true, trim: true, lowercase: true, enum: ["reported", "investigating", "closed"]},
    investigatedResult: {type: String, required: true, trim: true},
    reportClosedOn: {type: Date}
},{
    timestamps: { createdAt: true, updatedAt: true }
});

const alertModel = mongoose.model('epds-alert', alertSchema);

module.exports = alertModel; 