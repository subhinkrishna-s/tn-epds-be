const Express = require('express')
const UserModel = require('../models/User')
const ShopModel = require('../models/Shop')
const LogisticsModel = require('../models/Logistics')
const isAuth = require('../middleware/isAuth')

const ShopRouter = Express.Router()


ShopRouter.post('/create-shop', async(req, res) => {
    try {
        const { shopName, address, items, fullname, email, contact, password } = req.body;
        
        if (!shopName || !address || !items || !Array.isArray(items) || items.length < 1 || !fullname || !email || !contact || !password) {
            return res.send({ success: false, message: "Please provide all details!" });
        }

        // Validate items format
        const allowedProducts = ["rice", "wheat", "kerosene"];
        for (const item of items) {
            if (!item.product || !allowedProducts.includes(item.product.toLowerCase())) {
                return res.send({ success: false, message: `Invalid product type in items: ${item.product}. Allowed values are ${allowedProducts.join(", ")}` });
            }
            if (typeof item.quantity !== 'number' || item.quantity < 1) {
                return res.send({ success: false, message: "Each item must have a positive quantity!" });
            }
            if (typeof item.price !== 'number' || item.price < 1) {
                return res.send({ success: false, message: "Each item must have a positive price!" });
            }
        }

        // Generate new shopId
        const shops = await ShopModel.find({}).sort({ createdAt: 1 });
        let shopId;
        if (shops && shops.length > 0) {
            const lastShopId = shops[shops.length - 1].shopId;
            const prefix = "tnpds";
            const numPart = lastShopId.replace(prefix, "");
            let num = parseInt(numPart, 10);
            num++;
            const newNumStr = num < 1000 ? num.toString().padStart(3, '0') : num.toString().padStart(4, '0');
            shopId = prefix + newNumStr;
        } else {
            shopId = "tnpds001";
        }

        if (!shopId) {
            return res.send({ success: false, message: "Failed to generate shop ID! Please contact developer." });
        }

        const tempShop = new ShopModel({ shopId, shopName, address });
        const saveShop = await tempShop.save();
        if (!saveShop) {
            return res.send({ success: false, message: "Failed to create shop!" });
        }

        // Fetch logistics once outside the loop for generating IDs
        const logistics = await LogisticsModel.find({}).sort({ id: 1 });
        let currentLogisticsId = logistics && logistics.length > 0 ? logistics[logistics.length - 1].id : 0;

        // Create logistics for each item
        for (const item of items) {
            currentLogisticsId++;
            const tempLogistics = new LogisticsModel({
                id: currentLogisticsId,
                shopId,
                product: item.product,
                quantity: item.quantity,
                price: item.price
            });
            const saveLogistics = await tempLogistics.save();
            if (!saveLogistics) {
                return res.send({ success: false, message: "Shop created and failed to create products!" });
            }
        }

        // Generate new user ID
        const users = await UserModel.find({}).sort({ id: 1 });
        let userId;
        if (users && users.length > 0) {
            const lastUserId = users[users.length - 1].id;
            userId = lastUserId + 1;
        } else {
            userId = 1;
        }
        if (!userId) {
            return res.send({ success: false, message: "Failed to generate user ID! Please contact developer." });
        }

        const tempUser = new UserModel({
            id: userId,
            fullname,
            email,
            contact,
            role: "admin",
            shopId,
            password
        });
        const saveUser = await tempUser.save();
        if (!saveUser) {
            return res.send({ success: false, message: "Shop created and failed to create user!" });
        }
        
        return res.send({ success: true, message: "Shop created successfully!" });
    } catch (err) {
        console.log("Error in creating Shop:", err);
        return res.send({ success: false, message: "Trouble in creating shops! Please contact developer!" });
    }
});


ShopRouter.get('/fetch-shops', async (req, res)=>{
    try{
        const shops = await ShopModel.find({})
        if(!shops){
            return res.send({success: false, message: 'Failed to fetch Shops!'})
        }
        return res.send({success: true, message: "Shops succesfully fetched!", shops: shops})
    }
    catch(err){
        console.log("Error in fetching Shops:",err)
        return res.send({success: false, message: "Trouble in fetching shops! please contact developer!"})
    }
})

ShopRouter.get('/fetch-shop', isAuth, async (req, res)=>{
    try{
        const shopId = req.session.user.shopId

        if(!shopId){
            return res.send({success: false, message: "Failed to fetch shop ID"})
        }

        const shop = await ShopModel.findOne({shopId})
        if(!shop){
            return res.send({success: false, message: 'Failed to fetch Shop!'})
        }
        return res.send({success: true, message: "Shop succesfully fetched!", shop: shop})
    }
    catch(err){
        console.log("Error in fetching Shop:",err)
        return res.send({success: false, message: "Trouble in fetching shop! please contact developer!"})
    }
})

ShopRouter.get('/fetch-shop/:id', isAuth, async (req, res)=>{
    try{
        const shopId = req.params.id

        if(!shopId){
            return res.send({success: false, message: "Failed to fetch shop ID"})
        }

        const shop = await ShopModel.findOne({shopId})
        if(!shop){
            return res.send({success: false, message: 'Failed to fetch Shop!'})
        }
        return res.send({success: true, message: "Shop succesfully fetched!", shop: shop})
    }
    catch(err){
        console.log("Error in fetching Shop:",err)
        return res.send({success: false, message: "Trouble in fetching shop! please contact developer!"})
    }
})

ShopRouter.post('/update-product/:id', isAuth, async (req, res)=>{
    try{
        const shopId = req.params.id
        const {items} = req.body
        console.log("items:",items)

        if(!shopId){
            return res.send({success: false, message: "Failed to fetch shop ID"})
        }

        const fetchShop = await ShopModel.findOne({shopId})
        if(!fetchShop){
            return res.send({success: false, message: 'Failed to fetch Shop!'})
        }

        if (!items || !Array.isArray(items) || items.length < 1) {
            return res.send({ success: false, message: "Please provide all product details!" });
        }

        // Validate items format
        const allowedProducts = ["rice", "wheat", "kerosene"];
        for (const item of items) {
            if (!item.product || !allowedProducts.includes(item.product.toLowerCase())) {
                return res.send({ success: false, message: `Invalid product type in items: ${item.product}. Allowed values are ${allowedProducts.join(", ")}` });
            }
            if (typeof item.quantity !== 'number' || item.quantity < 1) {
                return res.send({ success: false, message: "Each item must have a positive quantity!" });
            }
            if (typeof item.price !== 'number' || item.price < 1) {
                return res.send({ success: false, message: "Each item must have a positive price!" });
            }
        }


        // Fetch logistics once outside the loop for generating IDs
        const logistics = await LogisticsModel.find({}).sort({ id: 1 });
        let currentLogisticsId = logistics && logistics.length > 0 ? logistics[logistics.length - 1].id : 0;

        // Create logistics for each item
        for (const item of items) {
            currentLogisticsId++;
            const tempLogistics = new LogisticsModel({
                id: currentLogisticsId,
                shopId,
                product: item.product,
                quantity: item.quantity,
                price: item.price
            });
            const saveLogistics = await tempLogistics.save();
            if (!saveLogistics) {
                return res.send({ success: false, message: "Shop created and failed to create products!" });
            }
        }

        return res.send({success: true, message: "Product has been created!"})
    }
    catch(err){
        console.log("Error in fetching Shop:",err)
        return res.send({success: false, message: "Trouble in fetching shop! please contact developer!"})
    }
})


ShopRouter.delete('/delete-shop/:id', isAuth, async (req, res)=>{
    try{
        const shopId = req.params.id

        if(!shopId){
            return res.send({success: false, message: "Failed to fetch shop ID"})
        }

        const shop = await ShopModel.deleteOne({shopId})
        if(!shop){
            return res.send({success: false, message: 'Failed to delete Shop!'})
        }
        return res.send({success: true, message: "Shop succesfully deleted!", shop: shop})
    }
    catch(err){
        console.log("Error in deleting Shop:",err)
        return res.send({success: false, message: "Trouble in deleting shop! please contact developer!"})
    }
})


module.exports = ShopRouter