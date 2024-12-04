import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import morgan from "morgan"
import { corsConfig } from "./config/cors"
import { connectDB } from "./config/db"
import projectRoutes from "./routes/projectRoutes"
import authRoutes from "./routes/authRoutes"

dotenv.config()

//conectamos a la DB
connectDB()

const app = express()

//pasamos a app nuestra config de cors
app.use(cors(corsConfig))

//morgan
app.use(morgan("dev"))

//habilitamos para que lea datos formulario
app.use(express.json())

//routes
app.use( '/api/auth', authRoutes )
app.use( '/api/projects', projectRoutes )

export default app