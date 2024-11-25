const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    UserName:
    {
        type: String,
        required: true,
    },

    email:
    {
        type: String,
        required: true,
        unique: true,
    },
    password:
    {
        type: String,
        required: true,
    },
    cart: {
        type: [mongoose.Schema.Types.ObjectId],  
        ref: "userCart", 
        required: false
    },
    favorites:
    {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "product",
        required: false
    },
    purchases:[
        {type:mongoose.Schema.Types.ObjectId,
            ref:"purchase"
        }
    ],
    code:
    {
        type:String,
    },

    isadmin: {
        type: Boolean,
        default: false,
    },

},
    { timestamps: true, versionKey: false }
);

module.exports = mongoose.model('user', userSchema);


