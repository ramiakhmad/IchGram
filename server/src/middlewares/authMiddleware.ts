import jwt, { JwtPayload, VerifyErrors } from "jsonwebtoken";
import { NextFunction, Response, Request } from "express";
import { TokenPayload } from "../types/express";

const ifAuthenticated = (req: Request, res: Response, next: NextFunction): void => {
    const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Unauthorized: Token missing" });
    }

    jwt.verify(token, process.env.JWT_KEY as string, (err: VerifyErrors | null, decoded: JwtPayload | string | undefined) => {
        if (err) {
            return res.status(err.name === "TokenExpiredError" ? 401 : 403).json({ 
                message: err.name === "TokenExpiredError" ? "Unauthorized: Token expired" : "Forbidden: Invalid token"
            });
        }

        if (!decoded || typeof decoded === "string") {
            return res.status(400).json({ message: "Token is malformed" });
        }

        req.user = decoded as TokenPayload;
        next();
    });
};

export default ifAuthenticated;
