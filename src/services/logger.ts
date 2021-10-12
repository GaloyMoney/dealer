import pino from "pino"
import dotenv from "dotenv"

dotenv.config()
export const baseLogger = pino({ level: process.env.LOG_LEVEL || "info" })
