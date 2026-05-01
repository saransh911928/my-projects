const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const isValidator = require('validator');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
        type: String,   
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
});

// Static signup method to register a new user
userSchema.statics.signup = async function(email, password){

    // Validate inputs first
    if(!email || !password){
        throw Error('All fields must be filled!');
    }
    if(!isValidator.isEmail(email)){
        throw Error('Email is not valid!');
    }

    // Incase if facing Password not strong error always in response.
    // if(!isValidator.isStrongPassword(password, {
    //     minLength: 6,
    //     minLowercase: 1,
    //     minUppercase: 1,
    //     minNumbers: 1,
    //     minSymbols: 1
    // }))

    if(!isValidator.isStrongPassword(password))
        {
        throw Error('Password not strong enough!');
    }

    // Check if email already exists in DB
    const exists = await this.findOne({email});
    if(exists){
        throw Error('Email already exists!');
    }

    // Hash password and create user
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
     

    const user = await this.create({email, password: hash});

    return user;

    // Copilot suggestion for Improvements:
// ✅ All validations happen first (email, password strength)
// ✅ DB query happens after validations (efficient!)
// ✅ Added try-catch to handle MongoDB's duplicate key error (code 11000)
// ✅ Better organized with comments explaining each step
// ✅ More robust error handling

    // try {
    //     const user = await this.create({email, password: hash});
    //     return user;
    // } catch(error) {
    //     // Handle MongoDB duplicate key error
    //     if(error.code === 11000){
    //         throw Error('Email already exists!');
    //     }
    //     throw error;
    // }
}
    
// static login method
userSchema.statics.login = async function(email, password){
    if(!email || !password){
        throw Error('All fields must be filled!');
    }

    const user = await this.findOne({email});

    if(!user){
        throw Error('Incorrect login !');
    }

    const match = await bcrypt.compare(password, user.password)

    if(!match){
        throw Error('Incorrect Password')
    }
    return user;
}


module.exports = mongoose.model('User', userSchema);