import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRouter from './routes/authRouter';
import currencyRouter from './routes/currencyRouter';
import walletRouter from './routes/walletRouter';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors()); 
app.use(express.json()); 

app.use((req, res, next) => {
    console.log(`[REQUEST] ${req.method} ${req.url}`);
    next();
});

app.use('/api/auth', authRouter);
app.use('/api/currency', currencyRouter);
app.use('/api/wallet', walletRouter);

const start = async () => {
    try {
        app.listen(PORT, () => {
            console.log(`Server started on port ${PORT}`);
        });
    } catch (e) {
        console.log(e);
    }
};

start();