import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRouter from './routes/authRouter';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// // --- ВСТАВИТЬ ЭТО ---
// app.use((req, res, next) => {
//     console.log(`[REQUEST] ${req.method} ${req.url}`);
//     next();
// });

// app.get('/ping', (req, res) => {
//     console.log('Ping received!');
//     res.send('PONG');
// });

app.use(cors()); 
app.use(express.json()); 

// Подключение роутов
app.use('/api/auth', authRouter);

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