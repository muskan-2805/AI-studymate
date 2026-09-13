import mongoose from 'mongoose';
import {MONGO_URI} from './env.js';

export const connectDB = async() =>{
    try{
        await mongoose.connect(MONGO_URI);
        console.log('MongoDB connected');
    }catch(err){
        console.log('MongoDB connection failed:',err.message);
        process.exit(1);// check this 
    }
}