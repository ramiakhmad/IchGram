import jwt, { JwtPayload, VerifyErrors } from 'jsonwebtoken';
import { NextFunction, Response, Request } from "express";
import { TokenPayload } from "../types/express";

// Middleware для проверки наличия и действительности токена
const ifAuthenticated = (req: Request, res: Response, next: NextFunction): void => {
    const token = req.cookies?.token; // Извлекаем токен из cookies
    if (token && process.env.JWT_KEY) {
        jwt.verify(token, process.env.JWT_KEY, (err: VerifyErrors | null, decoded: JwtPayload | string | undefined) => {
            if (err) {
                res.status(403).json({ message: 'Forbidden: Invalid or expired token' });
                return;
            }
            
            // Если декодированный токен существует, присваиваем его в request
            if (decoded && typeof decoded !== 'string') {
                req.user = decoded as TokenPayload;
                next(); // Продолжаем выполнение запроса
            } else {
                res.status(400).json({ message: 'Token is malformed or invalid' });
            }
        });
    } else {
        // Если токен отсутствует или некорректен
        if (req.url !== '/check-access-token') {
            res.status(401).json({ message: 'Unauthorized: Token missing or invalid' });
        } else {
            next(); // Разрешаем доступ к маршруту для проверки токена
        }
    }
};

export default ifAuthenticated;
