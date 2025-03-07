const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
    id: {type: Number, default: 1, unique: true},
    entryId: [{type: Number}]
},{
    timestamps: { createdAt: true, updatedAt: true }
});

const purchaseModel = mongoose.model('epds-purchases', purchaseSchema);

module.exports = purchaseModel;
