import RevisionLog from '../models/RevisionLog.js';

export const logRevision = async(req,res)=>{
    try{
        const {documentId,score}=req.body;
        const userId = req.user._id;

        if(documentId === undefined || score === undefined){
            return res.status(400).json({
                message:'documentId and score are required'
            });
        }
    const nextRevisionDate = new Date();
    if(score<60){
        nextRevisionDate.setDate(nextRevisionDate.getDate()+1);
    }else{
        nextRevisionDate.setDate(nextRevisionDate.getDate()+5);
    }
    
    const log = await RevisionLog.findOneAndUpdate(
        {user:userId,document:documentId},
        {
            lastScore:score,
            lastRevisedAt:new Date(),
            nextRevisionDate,
        },
        {upsert:true,new:true}
    );

    res.status(200).json(log);
}catch(err){
    res.status(500).json({
        message:'Server error',error:err.message
    });
    }
};

export const getTodayRevisions = async(req,res)=>{
    try{
        const userId = req.user._id;
        const today = new Date();

        const due = await RevisionLog.find({
            user:userId,
            nextRevisionDate:{$lte:today},
        }).populate('document','title');

        res.status(200).json(due);
    }catch(err){
        res.status(500).json({
            message:'Server error',error:err.message
        });
    }
};

