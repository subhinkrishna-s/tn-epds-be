const mongoose = require('mongoose');

const logisticsSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true},
    shopId: { type: String, required: true, trim: true, lowercase: true },
    product: {type: String, enum: ["wheat", "sugar", "oil"], required: true, trim: true},
    quantity: { type: Number, required: true, default: 0 },
    price: { type: Number, required: true, default: 0 },
    status: {type: String, required: true, trim: true, lowercase: true, enum: ["created", "reported", "investigating", "closed"], default: "created"},
    acknowledgement: {type: Boolean, default: false, required: true},
    reportMessage: {type: String, trim: true},
    investigatedResult: {type: String, trim: true},
    reportClosedOn: {type: Date}
},{
    timestamps: { createdAt: true, updatedAt: true }
});

const logisticsModel = mongoose.model('epds-logistics', logisticsSchema);

module.exports = logisticsModel;
