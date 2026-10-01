import app from './src/app.js';
import { PORT } from './config/env.js';
import { connectDB } from './config/db.js';
import Document from './models/Document.js';

const recoverStuckDocuments = async () => {
    const cutoff = new Date(Date.now() - 15 * 60 * 1000);
    const result = await Document.updateMany(
        { status: 'processing', updatedAt: { $lt: cutoff } },
        { status: 'failed', errorMessage: 'Processing was interrupted. Please upload again.' }
    );
    if (result.modifiedCount > 0) {
        console.log(`Marked ${result.modifiedCount} stuck document(s) as failed`);
    }
};

process.on('unhandledRejection', (reason) => {
    console.error('Unhandled promise rejection:', reason);
});

connectDB().then(async () => {
    try {
        await recoverStuckDocuments();
    } catch (err) {
        console.error('Stuck document recovery failed:', err.message);
    }

    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});
