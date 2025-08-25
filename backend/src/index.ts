import dotenv from "dotenv"
dotenv.config()

import express, { ErrorRequestHandler } from "express"
import router from "./routes/router"
import connectDB from "./db/connectDB"
import mongoose from "mongoose"
import helmet from "helmet"
import { authForRateLimit, generalLimiter } from "./middleware/rate_limiter"
import cookieParser from "cookie-parser"
import path from "path"

const app = express()

//middleware
app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(helmet({crossOriginResourcePolicy: {policy: 'cross-origin'}})) //preventing some attacks
app.use(cookieParser())
app.use(authForRateLimit) //generate rate limiter
app.use(generalLimiter) //rate limiter for api

// error handling for invalid json syntax
const invalidJsonHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (
    err instanceof SyntaxError &&
    (err as any).status === 400 &&
    'body' in err
  ) {
    res.status(400).json({
      status: 'error',
      msg: 'Invalid JSON body',
    })
    return 
  }
  next(err)
}
app.use(invalidJsonHandler)

app.use("", router)


//serving static uploads
app.use('/uploads', express.static(path.join(__dirname, "..", "uploads")))

const PORT: number = Number(process.env.PORT) || 3000

const start = async () => {
    try {
        await connectDB(process.env.MONGO_URI as string)


        const server = app.listen(PORT, () => {
            console.log(`Server is listening on port ${PORT}`);
        })

        //correct shutdown
        process.on("SIGINT", async () => {
            console.log("Shutting down server ...")
            await mongoose.disconnect()
            server.close(() => {
                process.exit(0)
            })
            
        })

    } catch (error) {
        console.log(error);
        process.exit(1)
        
    }
}

start()