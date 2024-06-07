import http from "http";
import express, { Express, Request, Response, NextFunction } from "express";
import morgan from "morgan";
import helmet from "helmet";
const cors = require('cors');
const app: Express = express();
const glf = require("generate-license-file");
const showdown = require('showdown');

app.use(morgan("dev"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(helmet());

const corsOptions = {
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true, // if your request includes cookies
    optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // handle preflight requests for all routes

// Trust all proxies
app.set('trust proxy', true);

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
        res.header("Access-Control-Allow-Methods", "GET POST PUT DELETE");
        return res.status(200).json({});
    }
    next();
});

/* default endpoints */
app.get('/', (req: Request, res: Response) => {
    res.json({ message: '👋💻👾🏎️ Hello from SoCS Tech' });
});
app.get('/v2', (req: Request, res: Response) => {
    res.json({ name: "asgard2" });
});

/* License File */
app.get('/v2/opensource.txt', async (req: Request, res: Response) => {
    const lic: string = await glf.getLicenseFileText("./package.json", { "omitVersion": true })
    const sd = new showdown.Converter();
    sd.setOption('simplifiedAutoLink', true);    
    res.set('Content-Type', 'text/html');
    res.send(Buffer.from(sd.makeHtml("# Asgard<sup>2</sup> Open Source Licenses\n\n" + lic)));
});

/* Routes */
app.use('/v2', require('./routes/auth'));
app.use('/v2', require('./routes/timetables'));
app.use('/v2', require('./routes/users'));
app.use('/v2', require('./routes/events'));
app.use('/v2', require('./routes/timetableGroups'));
app.use('/v2', require('./routes/tests'));
app.use('/v2', require('./routes/logs'));
app.use('/v2', require('./routes/carousels'));

/* Error handling */
app.use((req, res, next) => {
    const error = new Error("resource not found");
    return res.status(404).json({
        message: error.message,
    });
});

/* Server */
const PORT: any = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`The api server listening at on Port ${PORT}. If you're working locally you can access it via http://localhost:${PORT}`)
});