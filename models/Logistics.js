const mongoose = require('mongoose');

const logisticsSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true},
    shopId: { type: String, required: true, trim: true, lowercase: true },
    items: [
        { 
            product: { type: String, enum: ["wheat", "sugar", "oil"], required: true, trim: true, lowercase: true },
            quantity: { type: Number, required: true, default: 0 },
            price: { type: Number, required: true, default: 0 },
            acknowledgement: {type: Boolean, default: false, required: true}
        } 
    ]
},{
    timestamps: { createdAt: true, updatedAt: true }
});

const logisticsModel = mongoose.model('epds-logistics', logisticsSchema);

module.exports = logisticsModel;
