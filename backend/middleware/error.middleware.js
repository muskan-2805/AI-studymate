import { IS_PROD } from '../config/env.js';

export const notFound = (req, res) => {
    res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
};

export const errorHandler = (err, req, res, next) => {
    if (err?.name === 'MulterError') {
        const message =
            err.code === 'LIMIT_FILE_SIZE'
                ? 'File is too large. Maximum size is 10MB.'
                : err.message;
        return res.status(400).json({ message });
    }

    if (err?.code === 'INVALID_FILE_TYPE') {
        return res.status(400).json({ message: err.message });
    }

    if (err?.type === 'entity.parse.failed') {
        return res.status(400).json({ message: 'Invalid JSON in request body' });
    }

    console.error('Unhandled error:', err);
    res.status(err?.status || 500).json({
        message: 'Server error',
        ...(IS_PROD ? {} : { error: err?.message }),
    });
};
