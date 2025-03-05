const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema({
    shopId: { type: String, required: true, unique: true, trim: true, lowercase: true },
    shopName: { type: String, required: true, trim: true },
    address: { type: String, trim: true },
    items: [
        { 
            product: { type: String, enum: ["rice", "wheat", "kerosene"], trim: true, lowercase: true },
            quantity: { type: Number, default: 0 },
            price: { type: Number, default: 0 }
        }
    ]
},{
    timestamps: { createdAt: true, updatedAt: true }
});

const shopModel = mongoose.model('epds-shops', shopSchema);

module.exports = shopModel;
