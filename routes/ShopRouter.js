const Express = require('express')
const UserModel = require('../models/User')
const ShopModel = require('../models/Shop')
const LogisticsModel = require('../models/Logistics')
const isAuth = require('../middleware/isAuth')

const ShopRouter = Express.Router()

ShopRouter.post('/create-shop', async(req, res)=>{
    try{
        const {shopName, address, items, fullname, email, contact, password} = req.body
        
        if(!shopName || !address || !items || !Array.isArray(items) || items.length<1 || !fullname || !email || !contact || !password){
            return res.send({success: false, message: "Please provide all details!"})
        }

        // Validate items format
        const allowedProducts = ["wheat", "sugar", "oil"];
        for (const item of items) {
            if (!item.product || !allowedProducts.includes(item.product.toLowerCase())) {
                return res.send({ success: false, message: `Invalid product type in items: ${item.product}. Allowed values are ${allowedProducts.join(", ")}` });
            }
            if (!item.quantity || typeof item.quantity !== 'number' || item.quantity < 0) {
                return res.send({ success: false, message: "Each item must have a non-negative quantity!" });
            }
            if(!item.price || typeof item.price !== 'number' || item.price <0){
                return res.send({ success: false, message: "Each item must have a non-negative price!" });
            }
        }

        const shops = await ShopModel.find({})

        let shopId;
        if(shops && shops.length>0){
            const lastShopId = shops.splice(-1)[0].shopId

            const prefix = "tnpds";
            const numPart = lastShopId.replace(prefix, ""); // Extract numeric part
            let num = parseInt(numPart, 10);
            num++;

            const newNumStr = num < 1000 ? num.toString().padStart(3, '0') : num.toString().padStart(4, '0');
            shopId = prefix + newNumStr;
        }
        else{
            shopId = "tnpds001"
        }

        if(!shopId){
            return res.send({success: false, message: "Failed to generate shop ID! please contact developer."})
        }

        const tempShop = new ShopModel({
            shopId, shopName, address
        })

        const saveShop = await tempShop.save()

        if(!saveShop){
            return res.send({success: false, message: "Failed to create shop!"})
        }

        const logistics = await LogisticsModel.find({})
        if(!logistics){
            return res.send({success: false, message: "Failed to fetch Logistics!"})
        }

        let logisticsId;
        if(logistics && logistics.length>0){
            const lastLogisticsId = logistics.splice(-1)[0].id
            logisticsId = lastLogisticsId+1
        }
        else{
            logisticsId = 1
        }

        if(!logisticsId){
            return res.send({success: false, message: "Failed to generate logistics ID! please contact developer."})
        }

        const tempLogistics = new LogisticsModel({
            id: logisticsId,
            shopId, items
        })

        const saveLogistics = await tempLogistics.save()

        if(!saveLogistics){
            return res.send({success: false, message: 'Shop created and Failed to create logistics record!'})
        }

        const users = await UserModel.find({})
        if(!users){
            return res.send({success: false, message: 'Failed to fetch Users!'})
        }

        let userId;
        if(users && users.length>0){
            const lastUserId = users.splice(-1)[0].id
            userId = lastUserId+1
        }
        else{
            userId = 1
        }

        if(!userId){
            return res.send({success: false, message: "Failed to generate user ID! please contact developer."})
        }

        const tempUser = new UserModel({
            id: userId, fullname, email, contact, role: "admin", shopId, password
        })

        const saveUser = await tempUser.save()

        if(!saveUser){
            return res.send({success: false, message: "Shop created and Failed to create user!"})
        }
        
        return res.send({success: true, message: "Shop created succesfully!"})
    }
    catch(err){
        console.log("Error in creating Shop:",err)
        return res.send({success: true, message: "Trouble in creating shops! please contact developer!"})
    }
})

ShopRouter.get('/fetch-shops', async (req, res)=>{
    try{
        const shops = await ShopModel.find({})
        if(!shops){
            return res.send({success: false, message: 'Failed to fetch Shops!'})
        }
        return res.send({success: true, message: "Shops succesfully fetched!", shops: shops})
    }
    catch(err){
        console.log("Error in fetching Shop:",err)
        return res.send({success: true, message: "Trouble in fetching shops! please contact developer!"})
    }
})


module.exports = ShopRouter