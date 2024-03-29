import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

import dotenv from "dotenv";
dotenv.config();

import express from "express";
const port = process.env.PORT;
const app = express();

import logger from "./utils/logger";
// import routes from "./router"
import morgan from "morgan";
import fs from "fs";
import helmet from "helmet";
import cors from "cors";

const authRouter = require("./routes/authRoutes");
const homeRouter = require("./routes/homeRoutes");
const reportRouter = require("./routes/reportRouter")

// save the logs
var accessLogStream = fs.createWriteStream("./server.log", { flags: "a" });

// middleware
app.use(
  morgan(
    "[:date[clf]] :method :url :status :res[content-length] - :response-time ms",
    {
      stream: accessLogStream,
    }
  )
);
app.use(express.json({ limit: "5000kb" }));
app.use(helmet());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
// app.use(xss());

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/home", homeRouter);
app.use("/api/v1/report",reportRouter);
app.get('/api/v1/check', (req,res)=>{
  return res.send({
    isAlive:true
  })
})

app.listen(port, async () => {
  prisma.$connect;
  logger.info(`App is running on port localhost:${port}`);
});

export default app;