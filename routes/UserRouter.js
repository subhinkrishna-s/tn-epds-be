const Express = require('express')
const UserModel = require('../models/User')
const isAuth = require('../middleware/isAuth')

const UserRouter = Express.Router()

UserRouter.post('/create-user', isAuth, async (req, res)=>{
    try{
        const {fullname, email, contact, password} = req.body

        if(!fullname || !email || !contact || !password){
            return res.send({success: false, message: 'Please provide all details!'})
        }

        const authRole = req.session.user.role

        if(!(authRole==="superadmin" || authRole==="admin")){
            return res.send({success: false, message: "You dont have access to perform this action!"})
        }
        
        const fetchUser = await UserModel.findOne({email: email.toLowerCase()})
        if(fetchUser){
            return res.send({success: false, message: 'Account already exist! Please try login.'})
        }

        let Users = await UserModel.find({});
        let userId;
        if(Users.length>0){
            let last_user = Users.slice(-1)[0];
            userId = last_user.id+1;
        }else{ 
            userId = 1
        }

        const newUser = new UserModel({
            id: userId,
            fullname: fullname,
            email: email,
            contact: contact,
            password: password,
            shopId: req.session.user.shopId
        })

        const saveUser = await newUser.save()

        if(!saveUser){
            return res.send({success: false, message: 'Failed to create User!'})
        }
        return res.send({success: true, message: "User created successfully!"})

    }
    catch(err){
        console.log("Error in Register:",err)
        return res.send({success: false, message: 'Trouble in Registration! Please contact admin.'})
    }
})

module.exports = UserRouter