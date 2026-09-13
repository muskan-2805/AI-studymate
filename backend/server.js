import app from './src/app.js';
import { PORT } from './config/env.js';
import { connectDB } from './config/db.js';



connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});
