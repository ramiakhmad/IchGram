import { CorsOptions } from "cors";
import 'dotenv/config';

export const configureCors = (): CorsOptions => {
    const clientHost = process.env.ENV === "local" ? "http://localhost:5173" : process.env.CLIENT_HOST;

    if (!clientHost) {
        throw new Error("CLIENT_HOST is not defined. Check your environment variables.");
    }

    return {
        origin: ["https://ichgram.onrender.com",clientHost ,"http://localhost:5173" ], // Используем массив, чтобы избежать ошибки
        methods: ["GET", "POST", "DELETE", "PUT"],
        allowedHeaders: ["Content-Type", "Authorization"],
        exposedHeaders: ["Set-Cookie"],
        preflightContinue: false,
        credentials: true,
    };
};
