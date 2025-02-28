const Express = require('express')
const UserModel = require('../models/User')
const ShopModel = require('../models/Shop')
const isAuth = require('../middleware/isAuth')

const ShopRouter = Express.Router()

ShopRouter.post('/create-shop', async(req, res)=>{
    try{
        const {shopName, address, items, fullname, email, contact, password} = req.body
        
        if(!shopName || !address || !items || items.length<1 || !fullname || !email || !contact || !password){
            return res.send({success: false, message: "Please provide all details!"})
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
            shopId, shopName, address, items
        })

        const saveShop = await tempShop.save()

        if(!saveShop){
            return res.send({success: false, message: "Failed to create shop!"})
        }

        const users = await UserModel.find({})
        if(!users){
            return res.send({success: false, message: 'Users not found!'})
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


module.exports = ShopRouter