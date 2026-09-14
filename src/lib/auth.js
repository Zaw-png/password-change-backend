import jwt from "jsonwebtoken";
import { X_HEADER_USER_ID } from "./constant";

const JWT_SECRET = process.env.JWT_SECRET;

export function createJWT(user) {
    return jwt.sign(
        {
            id: user._id.toString(),
            username: user.username,
            email: user.email,
            role: user.role,
        },
        JWT_SECRET,
        {
            expiresIn: "1d",
        }
    );
}

export function verifyJWT(request) {
    try {
        const token =
            request.cookies.get("token")?.value;

        if (!token) {
            return null;
        }

        return jwt.verify(
            token,
            JWT_SECRET
        );
    } catch (error) {
        console.log("JWT verification failed");
        return null;
    }
}

export function isAdmin(request) {
    const userId =
        request.headers.get(
            X_HEADER_USER_ID
        );

    return userId === "-1";
}