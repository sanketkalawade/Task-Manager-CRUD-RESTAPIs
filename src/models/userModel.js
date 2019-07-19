const mongoose = require('mongoose');
const validator = require('validator');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Task = require('./tasksModel');

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true,
        lowercase:true
    },
    age:{
        type:Number,
        default:0,
        validate(value){
            if (value < 0) {
                throw new Error("Age should be positive!")
            }
        }
    },
    email:{
        type:String,
        unique:true,
        required:true,
        trim:true,
        lowercase:true,
        validate(value){
            if (!validator.isEmail(value)) {
                throw new Error("Invalid email")
            }
        }
    },
    password:{
        type:String,
        required:true,
        trim:true,
        minlength:7,
        validate(value){
            if (value.toLowerCase().includes("password")) {
                throw new Error('Your Password should not be "password" ');
            }
        }
    },
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }],
    avatar:{
        type: Buffer
    }
},{
    timestamps:true
})

//before sending response convert 
userSchema.methods.toJSON = function () {
    const user = this
    const userObject = user.toObject();
    
  //password, tokens array, avatar will not be shown in response
    delete userObject.password;
    delete userObject.tokens;
    delete userObject.avatar;
    return userObject;
}

userSchema.methods.generateAuthToken = async function () {
    const user = this;
    const token = jwt.sign({ _id:user._id.toString() }, process.env.JWT_SECRET_KEY, { expiresIn:'7 days' });
    user.tokens = user.tokens.concat({token})
    await user.save()
    return token;
}

userSchema.statics.fetchUserBycredentials = async (email,password) =>{
    const user = await User.findOne({email});    
    if (!user) {
        throw new Error('User not found');
    }
    
    const isMatch = await bcryptjs.compare(password, user.password);
    console.log(isMatch);
    
    if (!isMatch) {
        throw new Error('Invalid password');
    }

    return user;

}

userSchema.virtual('userTasks',{
    ref:'Task',
    localField:'_id',
    foreignField:'owner'
})


//before saving or updating user content hash password
userSchema.pre('save',async function(next){
    const userTosaveOrupdate = this;

    if (userTosaveOrupdate.isModified('password')) {
        userTosaveOrupdate.password = await bcryptjs.hash(userTosaveOrupdate.password, 8);
    }

    next();
})

//delete user's tasks when user is deleted already
userSchema.pre('remove', async function (next){
    const user = this;
    await Task.deleteMany({ owner:user._id });
    next();
})

const User = mongoose.model('User', userSchema)

module.exports = User;