import mongoose from 'mongoose';

const revisionLogSchema = new mongoose.Schema(
    {
        user:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'User',
            required:true,
        },
        document:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'Document',
            required:true,
        },
        lastScore:{
            type:Number,
            required:true,
        },
        lastRevisedAt:{
            type:Date,
            default:Date.now,
        },
        nextRevisionDate:{
            type:Date,
            required:true,
        },
    },
    {tumestamps:true}
);
export default mongoose.model('RevisionLog',revisionLogSchema);