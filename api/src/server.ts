import http from "http";
import express, { Express, Request, Response, NextFunction } from "express";
import morgan from "morgan";
import helmet from "helmet";
const cors = require('cors');

import { authenticate } from '@/middleware/authenticate';

const app: Express = express();

app.use(morgan("dev"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(helmet());
app.use(cors());

app.use((req, res, next) => {
    // set the CORS policy
    res.header("Access-Control-Allow-Origin", "*");
    // set the CORS headers
    res.header(
        "Access-Control-Allow-Headers",
        "origin, X-Requested-With,Content-Type,Accept, Authorization"
    );
    // set the CORS method headers
    if (req.method === "OPTIONS") {
        res.header("Access-Control-Allow-Methods", "GET PATCH DELETE POST");
        return res.status(200).json({});
    }
    next();
});

/* default endpoint */
app.get('/', (req: Request, res: Response) => {
    res.json({ message: '👋💻👾🏎️ Hello from SoCS Tech' });
});

/* Routes */
app.use('/v2', require('./routes/auth'));
app.use('/v2', authenticate, require('./routes/users'));
// app.use('/v2', authenticate, require('./routes/tests'));
// app.use('/v2', authenticate, require('./routes/users'));


/* Error handling */
app.use((req, res, next) => {
    const error = new Error("resource not found");
    return res.status(404).json({
        message: error.message,
    });
});

/* Server */
const PORT: any = process.env.PORT || 3000;
const httpServer = http.createServer(app);
httpServer.listen(PORT, () =>
    console.log(`👂 The server listening at http://localhost:${PORT}`)
);