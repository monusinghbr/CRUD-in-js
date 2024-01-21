import mongoose, {Schema} from "mongoose";
import bcrypt from "bcrypt";
import jwt from "json-web-token";

const userSchema = new Schema(
    {
        username:{
            type:String,
            required:true,
            unique:true,
            lowecase:true,
            trim:true,
            index:true
        },
        email:{
            type:String,
            required:true,
            unique:true,
            lowecase:true,
            trim:true
        },
        fullName:{
            type:String,
            required:true,
            trim:true
        },
        avatar:{
            type:String,
            required:true,
        },
        coverImage:{
            type:String,
        },
        watchHistory:{
            type: Schema.Types.ObjectId,
            ref:"Video"
        },
        password:{
            type:String,
            require:[true, 'Password is required']
        },
        refreshTocken:{
            type:String
        }
    },
    {
        timestamps:true
    }
);

userSchema.pre("save", async function(next){
    if(!this.isModified("password")) return next();

    this.password = bcrypt.hash(this.password, 10);
    next();
})

userSchema.method.isPasswordCorect = async function(password){
    return await bcrypt.compare(password, this.password);
}

userSchema.method.generateAccessTocken = function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOCKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOCKEN_EXPIRY
        }
    )
}
userSchema.method.generateRefreshTocken = function(){
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOCKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOCKEN_EXPIRY
        }
    )
}

export const User = mongoose.model('User', userSchema);