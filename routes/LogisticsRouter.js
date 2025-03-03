const Express = require('express')
const LogisticsModel = require('../models/Logistics')
const ShopModel = require('../models/Shop')
const isAuth = require("../middleware/isAuth")

const LogisticsRouter = Express.Router()

LogisticsRouter.get("/fetch-logistics", isAuth, async(req, res)=>{
    try{
        const Logistics = await LogisticsModel.find({shopId: req.session.user.shopId})
        if(!Logistics){
            return res.send({success: false, message: 'Failed to fetch Logistics!'})
        }

        return res.send({success: true, message: "Fetched Logistics succesfully!", logistics: Logistics})
    }
    catch(err){
        console.log("Error in fetching Logistics:",err)
        return res.send({success: false, message: 'Trouble in fetching Logistics! Please contact support Team.'})
    }
})

LogisticsRouter.post("/logistics-acknowledgement", isAuth, async(req, res)=>{
    try{
        const {acknowledgement, id} = req.body

        if(acknowledgement && (acknowledgement.status===true || acknowledgement.status===false)){

            const updateLogistics = await LogisticsModel.updateOne({id}, {$set: {acknowledgement: acknowledgement.status}})

            if(!updateLogistics){
                return res.send({success: false, message: "Failed to update Acknowledgement status!"})
            }

            if(acknowledgement===true){

                const tempItem = {
                    product: updateLogistics.product,
                    quantity: updateLogistics.quantity,
                    price: updateLogistics.price
                }

                const updateShop = await ShopModel.updateOne({shopId: updateLogistics.shopId}, {
                    $push: {
                        items: tempItem
                    }
                })

                if(!updateShop){
                    return res.send({success: false, message: "Failed to update Products in Shop!"})
                }

                return res.send({success: true, message: "Products updated successfully!"})
            }
            else if(acknowledgement===false){
            }
            else{
                return res.send({success: false, message: "Please provide a valid Acknowledgement status!"})
            }

        }
        else{
            return res.send({success: false, message: "Acknowledgement value is not found!"})
        }

    }
    catch(err){
        console.log("Error in updating Logistics:",err)
        return res.send({success: false, message: 'Trouble in updating Logistics! Please contact support Team.'})
    }
})

module.exports = LogisticsRouter