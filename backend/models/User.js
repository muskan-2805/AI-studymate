import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
    {
        name:{
            type:String,
            required:true,
        },
        email:{
            type:String,
            required:true,
            unique:true,
            lowercase:true,
        },
        password:{
            type:String,
            required:true,
        },
        isVerified:{
            type:Boolean,
            default:false,
        },
    },
    {timestamps:true}
);

userSchema.pre('save',async function(){// mongoose "middleware" hook that runs automatically before saving to database
    if(!this.isModified('password'))
        return ;// only re-hash the password if its new or has changed
    const salt = await bcrypt.genSalt(10);//generates and add extras random before hashing 
    this.password = await bcrypt.hash(this.password,salt);// hash password using that salt
});

userSchema.methods.comparePassword = async function(enteredPassword){
    return await bcrypt.compare(enteredPassword,this.password);//takes the plain entered password and checks it with stored hash
};

export default mongoose.model('User',userSchema);