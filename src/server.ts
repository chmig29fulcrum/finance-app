import app from './app';
import env from './utils/validateEnv';
import mongoose from 'mongoose';

const port = env.PORT;
console.log(env.NODE_ENV);

mongoose
    .connect(env.MONGO_DB_LOCAL)
    .then(() => {
        console.log('DB connection successfull!');
        app.listen(port, () => {
            console.log('Server Running on port: ' + port);
        });
    })
    .catch(console.error);
