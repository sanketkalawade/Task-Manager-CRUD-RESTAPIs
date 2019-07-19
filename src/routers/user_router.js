const express = require('express')
const User = require('../models/userModel');
const userRouter = new express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const sharp = require('sharp');
const {sendWelcomeMail,sendAccountRemovedMail} = require('../emails/user_accounts');
//users rest apis

//user login api
userRouter.post('/users/login', async (req,res)=>{
    try {        
        const user = await User.fetchUserBycredentials(req.body.email, req.body.password); 
        const token = await user.generateAuthToken(); //we applied this method on user instance , Not on whole User model. 
                                                      //to generate unique token for every user.
        res.send({user,token})
    } catch (error) {
        console.log(error);
        
        res.status(400).send(error);
    }
    

})

//create user or signup
userRouter.post('/users',async (req,res)=>{
    const user = new User(req.body);
    try {
        const result = await user.save();
        const token = await user.generateAuthToken();
        sendWelcomeMail(user) //we can use await but there is no need to send response before sending email 
                              //i.e sendWelcomeMail returns promise.
        res.status(201).send({result, token});     
    } catch (error) {
        res.status(500).send(error)
    }
   

    //old promise then catch method below 
    // user.save()
    //     .then(result=>{
    //         res.send(result);
    //     })
    //     .catch(error=>{
    //         res.send(error);
    //     })
})



//get all users
// userRouter.get('/users',authMiddleware,async (req,res)=>{

//     try {
//         const result = await User.find({});
//         if (!result) {
//             return res.status(404).send("No users available")
//         }
//         res.send(result)
//     } catch (error) {
//         res.status(500).send(error)
//     }

//     // User.find({}).then(result=>{
//     //     if (!result) {
//     //         res.status(404).send("No users available")
//     //     }
//     //     res.status(200).send(result)
//     // }).catch(error=>{
//     //     res.status(500).send(error)
//     // })
// })




//get profile of authenticated user
userRouter.get('/users/me',authMiddleware,async (req,res)=>{
   res.send(req.user);
})



//get perticuler user by id <--- i dont need this anymore, above rout gives this functionality
// userRouter.get('/users/:id',async (req,res)=>{
//     const _id = req.params.id;
//     try {
//         const result = await User.findById(_id);
//         if (!result) {
//             return res.status(404).send("No user with given id")
//         }
//         res.send(result)
//     } catch (error) {
//         res.status(500).send(error)
//     }

//     // User.findById(_id).then(user=>{        
//     //     if (!user) {
//     //        return res.status(404).send("No user with given id")
//     //     }
//     //     res.send(user)
//     // }).catch(error=>{
//     //     res.status(500).send(error)
//     // })
// })

//update user info by its id
userRouter.patch('/users/updateme',authMiddleware, async (req,res)=>{
    //const _id = req.params.id;

    const updateByuser = Object.keys(req.body);
    const allowedUpdates = ['age','name','email','password'];
    const isValidOperation = updateByuser.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).send("Error: Invalid updates");
    }    

    try {
        //const updatedUser = await User.findByIdAndUpdate(_id, req.body , {new:true, runValidators:true}); this method will bypass the userSchema
        //so i am commenting this and writing another method
        
       // await User.findById(req.user._id);
        updateByuser.forEach(update=>req.user[update] = req.body[update]);
        await req.user.save()
        // if (!user) {
        //     return res.status(404).send("No user with such id")
        // }    
        res.send(req.user)
    } catch (error) {
        res.status(400).send(error);
    }
    

})


//delete user by its id
userRouter.delete('/users/deleteme',authMiddleware, async (req,res)=>{
    try {
        // const deletedUser = User.findByIdAndDelete(req.user._id);
        // if (!deletedUser) {
        //     return res.status(404).send("No such user available to delete")
        // }
        await req.user.remove();
        sendAccountRemovedMail(req.user)
        res.send(req.user)
    } catch (error) {
        res.status(500).send(error.message)
    }
})

//logout user and delete auth token in array of tokens in that user obj.
userRouter.post('/users/logout',authMiddleware, async (req,res)=>{
    try {
        req.user.tokens = req.user.tokens.filter((tokenObj)=>{
            return tokenObj.token !== req.token;
        })
        
        await req.user.save();
        res.send();
    } catch (error) {
        console.log(error.message);
        
        res.status(500).send()
    }
})

//logout all tokens like netflix to logout all friends/token 
userRouter.post('/users/logoutall',authMiddleware, async (req,res)=>{
    try {
        req.user.tokens = [];
        await req.user.save();
        res.send();
    } catch (error) {
        res.status(500).send()
    }
})

const upload = multer({
    //dest:'avatars', --> removing this bcz we dont want to save images to avatars folder. we want to save it to server side.
    limits:{
        fileSize:1000000 //1mb
    },
    fileFilter(req,file,callback){
        // if (file.originalname.endsWith('.jpg') || file.originalname.endsWith('.png') || file.originalname.endsWith('.jpeg')) {
        //     return callback(undefined,true)
        // }

        //OR you can do by using regex
        if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
            callback(new Error('file should be of jpg or png or jpeg type'),undefined);
        }
        return callback(undefined,true)
    }
})

//upload profile image
userRouter.post('/users/me/avatar',authMiddleware, upload.single('avatar'), async (req,res)=>{
   const buffer = await sharp(req.file.buffer).resize({width:250, height:250}).png().toBuffer();
   req.user.avatar = buffer;
    await req.user.save();
    res.send('avatar uploaded successfully!')
},(error,req,res,next)=>{
    res.status(400).send({error: error.message})
})

//delete profile image
userRouter.delete('/users/me/avatar',authMiddleware,async(req,res)=>{
    req.user.avatar = undefined;
    await req.user.save();
    res.send();
})

//fetch profile image
userRouter.get('/users/:id/avatar',async (req,res)=>{
   try {
    const user = await User.findById(req.params.id);
    if (!user || !user.avatar) {
        throw new Error()
    }       
    res.set('Content-Type','image/png').send(user.avatar)
   } catch (error) {
       res.status(404).send(error.message)
   }
})

module.exports = userRouter;