const Express = require('express')
const UserModel = require('../models/User')
const isAuth = require('../middleware/isAuth')

const PurchaseRouter = Express.Router()


const fetchPurchases = async ()=>{
    try{
        const url = "https://api.thingspeak.com/channels/2827585/feeds.json?api_key=UAS3UGKPP1FAWQMR"
        const res = await fetch(url)
        const OrderData = await res.json()
        if(OrderData && OrderData.feeds){
            return OrderData.feeds
        }
        else{
            return []
        }
    }
    catch(err){
        console.log("Error in fetching thinkspeak data:",err)
        return []
    }
}

setInterval(()=>{
    
})


PurchaseRouter.get('/fetch-orders', isAuth, async(req, res)=>{
    try{
        const Orders = await fetchPurchases()

        let consolidatedOrders

        if(Orders && Orders.length>0){
            consolidatedOrders = Orders.map((order, i)=>{

                let tempOrder = {
                    userId: Number(order.field1),
                    createdAt: order.created_at
                }

                if(order.field2 !== '0' && order.field2 !== null) {
                    tempOrder = {
                        ...tempOrder,
                        product: "rice",
                        quantity: Number(order.field2)
                    };
                } else if(order.field3 !== '0' && order.field3 !== null) {
                    tempOrder = {
                        ...tempOrder,
                        product: "wheat",
                        quantity: Number(order.field3)
                    };
                } else if(order.field4 !== '0' && order.field4 !== null) {
                    tempOrder = {
                        ...tempOrder,
                        product: "kerosene",
                        quantity: Number(order.field4)
                    };
                }
                return tempOrder
            })
        }

        return res.send({success: true, message: "Fetched Orders sucessfully!", orders: consolidatedOrders || []})
    }
    catch(err){
        console.log("Error in fetching Orders:",err)
        return res.send({success: false, message: "Error in fetching Orders! Please contact developer!"})
    }
})

PurchaseRouter.get('/user-orders', isAuth, async(req, res)=>{
    try{

        const User = await UserModel.findOne({id: req.session.user.id})

        if(!User){
            return res.send({success: false, message: "Failed to fetch User!"})
        }

        const Orders = await fetchPurchases()

        if(Orders && Orders.length>0){
            const filteredOrders = Orders.map(order => {
                if(Number(order.field1) === 1 || req.session.user.id) {
                    let tempOrder = {
                        userId: Number(order.field1),
                        createdAt: order.created_at
                    };
            
                    if(order.field2 !== '0' && order.field2 !== null) {
                        tempOrder = {
                            ...tempOrder,
                            product: "rice",
                            quantity: Number(order.field2)
                        };
                    } else if(order.field3 !== '0' && order.field3 !== null) {
                        tempOrder = {
                            ...tempOrder,
                            product: "wheat",
                            quantity: Number(order.field3)
                        };
                    } else if(order.field4 !== '0' && order.field4 !== null) {
                        tempOrder = {
                            ...tempOrder,
                            product: "kerosene",
                            quantity: Number(order.field4)
                        };
                    }
                    return tempOrder;
                }
                // Return undefined for orders that don't match the condition
                return undefined;
            }).filter(order => order !== undefined);
            

            return res.send({success: true, message: "Fetched Orders sucessfully!", orders: filteredOrders || []})
        }
        else{
            return res.send({success: true, message: "Fetched Orders sucessfully!", orders: []})
        }

    }
    catch(err){
        console.log("Error in fetching Order:",err)
        return res.send({success: false, message: "Error in fetching Order! Please contact developer!"})
    }
})

module.exports = PurchaseRouter