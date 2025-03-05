const Express = require('express')
const LogisticsModel = require('../models/Logistics')
const ShopModel = require('../models/Shop')
const isAuth = require("../middleware/isAuth")

const LogisticsRouter = Express.Router()

LogisticsRouter.get("/fetch-all-logistics", isAuth, async (req, res) => {
    try {
        const Logistics = await LogisticsModel.find({})
        if (!Logistics) {
            return res.send({ success: false, message: 'Failed to fetch Logistics!' })
        }

        return res.send({ success: true, message: "Fetched Logistics succesfully!", logistics: Logistics })
    }
    catch (err) {
        console.log("Error in fetching Logistics:", err)
        return res.send({ success: false, message: 'Trouble in fetching Logistics! Please contact support Team.' })
    }
})

LogisticsRouter.get("/fetch-logistics", isAuth, async (req, res) => {
    try {
        const Logistics = await LogisticsModel.find({ shopId: req.session.user.shopId })
        if (!Logistics) {
            return res.send({ success: false, message: 'Failed to fetch Logistics!' })
        }

        return res.send({ success: true, message: "Fetched Logistics succesfully!", logistics: Logistics })
    }
    catch (err) {
        console.log("Error in fetching Logistics:", err)
        return res.send({ success: false, message: 'Trouble in fetching Logistics! Please contact support Team.' })
    }
})

LogisticsRouter.post("/logistics-acknowledgement", isAuth, async (req, res) => {
    try {
        const { acknowledgement, id } = req.body

        if (!id) {
            return res.send({ success: false, message: "ID is not available!" })
        }

        if (acknowledgement && Object.entries(acknowledgement).length > 0) {

            if (!acknowledgement.id) {
                return res.send({ success: false, message: "Acknowledgement Id is not available!" })
            }

            if (acknowledgement.id !== id) {
                return res.send({ success: false, message: "Acknowledgement Id is not found!" })
            }

            if (typeof acknowledgement.status !== "boolean") {
                return res.send({ success: false, message: "Status is not available!" })
            }

            if (acknowledgement.status === false && typeof acknowledgement.isReceived !== "boolean") {
                return res.send({ success: false, message: "Product status is not available!" })
            }

            if (acknowledgement.status === false && acknowledgement.isReceived === true && !acknowledgement.quantity) {
                return res.send({ success: false, message: "Product Quantity is not available!" })
            }

            let tempAcknowledgement;
            tempAcknowledgement = {
                acknowledgement: acknowledgement.status,
                status: "closed"
            }

            if (acknowledgement.status === false) {
                tempAcknowledgement = {
                    ...tempAcknowledgement,
                    isReceived: acknowledgement.isReceived,
                    status: "reported"
                }
                if (acknowledgement.isReceived === true) {
                    tempAcknowledgement = {
                        ...tempAcknowledgement,
                        receivedQuantity: Number(acknowledgement.quantity)
                    }
                }
            }

            const updateLogistics = await LogisticsModel.findOneAndUpdate({ id }, { $set: tempAcknowledgement })

            if (!updateLogistics) {
                return res.send({ success: false, message: "Failed to update Acknowledgement!" })
            }

            if (updateLogistics.quantity && updateLogistics.quantity > 0) {

                const fetchShop = await ShopModel.findOne({ shopId: updateLogistics.shopId });
                if (!fetchShop) {
                    return res.send({ success: false, message: "Shop not found!" });
                }

                const tempProduct = {
                    product: updateLogistics.product,
                    quantity: acknowledgement.status===true?updateLogistics.quantity:tempAcknowledgement.receivedQuantity,
                    price: updateLogistics.price
                };

                let updatedItems = [...fetchShop.items];
                let productFound = false;

                for (let i = 0; i < updatedItems.length; i++) {
                    if (updatedItems[i].product === tempProduct.product) {
                        // Increase the quantity from existing product
                        updatedItems[i].quantity += tempProduct.quantity;
                        productFound = true;
                        break;
                    }
                }

                if (!productFound) {
                    // Product does not exist, so push the new product
                    updatedItems.push(tempProduct);
                }

                const updateShop = await ShopModel.findOneAndUpdate(
                    { shopId: updateLogistics.shopId },
                    { $set: { items: updatedItems } },
                    { new: true }
                );

                if (!updateShop) {
                    return res.send({ success: false, message: "Acknowledgement updated and failed to update shop!" });
                }

                return res.send({ success: true, message: "Acknowledgement and product updated successfully!" });


            } else {
                return res.send({ success: true, message: "Acknowledgement updated successfully!" })
            }

        }
        else {
            return res.send({ success: false, message: "Acknowledgement data is not found!" })
        }

    }
    catch (err) {
        console.log("Error in updating Logistics:", err)
        return res.send({ success: false, message: 'Trouble in updating Logistics! Please contact support Team.' })
    }
})

LogisticsRouter.delete("/delete-logistics/:id", isAuth, async (req, res) => {
    try {

        const id = req.params.id

        if(!id){
            return res.send({success: false, message: "Failed to fetch logistics ID"})
        }

        const Logistics = await LogisticsModel.deleteOne({ id })
        if (!Logistics) {
            return res.send({ success: false, message: 'Failed to delete Logistics!' })
        }

        return res.send({ success: true, message: "Logistics deleted succesfully!"})
    }
    catch (err) {
        console.log("Error in deleting Logistics:", err)
        return res.send({ success: false, message: 'Trouble in deleting Logistics! Please contact support Team.' })
    }
})

module.exports = LogisticsRouter