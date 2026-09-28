import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        document:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'Document',
            required:true,
        },
        questions:[
            {
                question:{type:String,required:true},
                options:[{type:String,required:true}],
                correctAnswerIndex:{type:Number,required:true},
            },
        ],
    },
    {timestamps:true}
);
export default mongoose.model('Quiz',quizSchema);