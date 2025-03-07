const Express = require('express')
const UserModel = require('../models/User')
const isAuth = require('../middleware/isAuth')
const PurchaseModel = require("../models/Purchase")
const ShopModel = require("../models/Shop")

const PurchaseRouter = Express.Router()


const fetchPurchases = async () => {
    try {
        const url = "https://api.thingspeak.com/channels/2868534/feeds.json?api_key=IBQBZSKWRTMC06UQ"
        const res = await fetch(url)
        const OrderData = await res.json()
        if (OrderData && OrderData.feeds) {
            return OrderData.feeds
        }
        else {
            return []
        }
    }
    catch (err) {
        console.log("Error in fetching thinkspeak data:", err)
        return []
    }
}

setInterval(async () => {
    const orders = await fetchPurchases()
    if (orders && orders.length > 0) {
        const purchases = await PurchaseModel.findOne({ id: 1 })
        if (purchases) {
            for (const order of orders) {
                const isPurchaseExistence = purchases.entryId.some(purchase => purchase === order.entry_id)
                if (isPurchaseExistence === false) {
                    const fetchUser = await UserModel.findOne({ id: Number(order.field1) })
                    if (fetchUser) {
                        const fetchShop = await ShopModel.findOne({ shopId: fetchUser.shopId })
                        if (fetchShop) {
                            let product
                            let quantity
                            if (order.field2 !== '0' && order.field2 !== null) {
                                product = "rice"
                                quantity = Number(order.field2)
                            } else if (order.field3 !== '0' && order.field3 !== null) {
                                product = "wheat"
                                quantity = Number(order.field3)
                            } else if (order.field4 !== '0' && order.field4 !== null) {
                                product = "kerosene"
                                quantity = Number(order.field4)
                            }

                            if (product && quantity) {
                                let products = fetchShop.items
                                let productIndex = products.findIndex(item => item.product === product)
                                if (products && productIndex>-1) {
                                    products[productIndex].quantity -= quantity
                                }
                                const reduceQuantity = await ShopModel.updateOne({ shopId: fetchUser.shopId }, { $set: { items: products } })
                                if (reduceQuantity) {
                                    await PurchaseModel.updateOne({ id: 1 }, { $push: { entryId: Number(order.entry_id) } })
                                }
                            }
                        }
                    }
                }
            }
        }
        else {
            for (const order of orders) {
                const fetchUser = await UserModel.findOne({ id: Number(order.field1) })
                if (fetchUser) {
                    const fetchShop = await ShopModel.findOne({ shopId: fetchUser.shopId })
                    if (fetchShop) {
                        let product
                        let quantity
                        if (order.field2 !== '0' && order.field2 !== null) {
                            product = "rice"
                            quantity = Number(order.field2)
                        } else if (order.field3 !== '0' && order.field3 !== null) {
                            product = "wheat"
                            quantity = Number(order.field3)
                        } else if (order.field4 !== '0' && order.field4 !== null) {
                            product = "kerosene"
                            quantity = Number(order.field4)
                        }

                        if (product && quantity) {
                            let products = fetchShop.items
                            let productIndex = products.findIndex(item => item.product === product)
                            if (products && productIndex>-1) {
                                products[productIndex].quantity -= quantity
                            }
                            const reduceQuantity = await ShopModel.updateOne({ shopId: fetchUser.shopId }, { $set: { items: products } })
                            if (reduceQuantity) {
                                await PurchaseModel.insertOne({ id: 1 }, { $push: { entryId: [Number(order.entry_id)] } })
                            }
                        }
                    }
                }
            }
        }
    }
}, 5000)


PurchaseRouter.get('/fetch-orders', isAuth, async (req, res) => {
    try {
        const Orders = await fetchPurchases()

        let consolidatedOrders

        if (Orders && Orders.length > 0) {
            consolidatedOrders = Orders.map((order, i) => {

                let tempOrder = {
                    userId: Number(order.field1),
                    createdAt: order.created_at
                }

                if (order.field2 !== '0' && order.field2 !== null) {
                    tempOrder = {
                        ...tempOrder,
                        product: "rice",
                        quantity: Number(order.field2)
                    };
                } else if (order.field3 !== '0' && order.field3 !== null) {
                    tempOrder = {
                        ...tempOrder,
                        product: "wheat",
                        quantity: Number(order.field3)
                    };
                } else if (order.field4 !== '0' && order.field4 !== null) {
                    tempOrder = {
                        ...tempOrder,
                        product: "kerosene",
                        quantity: Number(order.field4)
                    };
                }
                return tempOrder
            })
        }

        return res.send({ success: true, message: "Fetched Orders sucessfully!", orders: consolidatedOrders || [] })
    }
    catch (err) {
        console.log("Error in fetching Orders:", err)
        return res.send({ success: false, message: "Error in fetching Orders! Please contact developer!" })
    }
})

PurchaseRouter.get('/user-orders', isAuth, async (req, res) => {
    try {

        const User = await UserModel.findOne({ id: req.session.user.id })

        if (!User) {
            return res.send({ success: false, message: "Failed to fetch User!" })
        }

        const Orders = await fetchPurchases()

        if (Orders && Orders.length > 0) {
            const filteredOrders = Orders.map(order => {
                if (Number(order.field1) === 1 || req.session.user.id) {
                    let tempOrder = {
                        userId: Number(order.field1),
                        createdAt: order.created_at
                    };

                    if (order.field2 !== '0' && order.field2 !== null) {
                        tempOrder = {
                            ...tempOrder,
                            product: "rice",
                            quantity: Number(order.field2)
                        };
                    } else if (order.field3 !== '0' && order.field3 !== null) {
                        tempOrder = {
                            ...tempOrder,
                            product: "wheat",
                            quantity: Number(order.field3)
                        };
                    } else if (order.field4 !== '0' && order.field4 !== null) {
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


            return res.send({ success: true, message: "Fetched Orders sucessfully!", orders: filteredOrders || [] })
        }
        else {
            return res.send({ success: true, message: "Fetched Orders sucessfully!", orders: [] })
        }

    }
    catch (err) {
        console.log("Error in fetching Order:", err)
        return res.send({ success: false, message: "Error in fetching Order! Please contact developer!" })
    }
})

module.exports = PurchaseRouter