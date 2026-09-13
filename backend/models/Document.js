import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema(
    {
        user:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'User',
            required:true,
        },
        title:{
            type:String,
            required:true,
        },
        fileUrl:{
            type:String,
            required:true,
        },
        status:{
            type:String,
            enum:['processing','ready','failed'],
            default:'processing',
        },
    },
    {timestamps:true}
);

export default mongoose.model('Document',documentSchema);