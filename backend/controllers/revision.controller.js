import RevisionLog from '../models/RevisionLog.js';
import Document from '../models/Document.js';
import { isValidObjectId } from '../utils/validate.util.js';

export const logRevision = async (req, res) => {
    try {
        const { documentId, score } = req.body;
        const userId = req.user._id;

        if (documentId === undefined || score === undefined) {
            return res.status(400).json({ message: 'documentId and score are required' });
        }

        const numericScore = Number(score);
        if (!Number.isFinite(numericScore) || numericScore < 0 || numericScore > 100) {
            return res.status(400).json({ message: 'score must be a number between 0 and 100' });
        }

        if (!isValidObjectId(documentId)) {
            return res.status(404).json({ message: 'Document not found' });
        }
        const document = await Document.findOne({ _id: documentId, user: userId });
        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }

        const nextRevisionDate = new Date();
        nextRevisionDate.setDate(nextRevisionDate.getDate() + (numericScore < 60 ? 1 : 5));

        const log = await RevisionLog.findOneAndUpdate(
            { user: userId, document: documentId },
            {
                lastScore: numericScore,
                lastRevisedAt: new Date(),
                nextRevisionDate,
            },
            { upsert: true, new: true }
        );

        res.status(200).json(log);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

export const getTodayRevisions = async (req, res) => {
    try {
        const due = await RevisionLog.find({
            user: req.user._id,
            nextRevisionDate: { $lte: new Date() },
        }).populate('document', 'title');

        res.status(200).json(due);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

export const getAllRevisions = async (req, res) => {
    try {
        const logs = await RevisionLog.find({ user: req.user._id })
            .populate('document', 'title')
            .sort({ nextRevisionDate: 1 });

        res.status(200).json(logs);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};
