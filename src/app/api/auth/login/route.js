import bcrypt from "bcryptjs";

import { getClientPromise } from "@/lib/mongodb";
import { createJWT } from "@/lib/auth";
import {
    errorResponse,
    successResponse,
} from "@/lib/utils";

export async function POST(request) {
    try {
        const data = await request.json();

        const username = data.username;
        const password = data.password;

        if (!username || !password) {
            return errorResponse(
                "Username and password are required",
                400
            );
        }

        const client =
            await getClientPromise();

        const db =
            client.db(
                process.env.DB_NAME
            );

        const user =
            await db
                .collection("user")
                .findOne({
                    username: username,
                });

        if (!user) {
            return errorResponse(
                "Invalid username or password",
                401
            );
        }

        const passwordMatches =
            await bcrypt.compare(
                password,
                user.password
            );

        if (!passwordMatches) {
            return errorResponse(
                "Invalid username or password",
                401
            );
        }

        const token =
            createJWT(user);

        const response =
            successResponse(
                {
                    message:
                        "Login successful",
                    user: {
                        _id:
                            user._id.toString(),
                        username:
                            user.username,
                        email:
                            user.email,
                        role:
                            user.role,
                    },
                },
                200
            );

        response.cookies.set(
            "token",
            token,
            {
                httpOnly: true,
                secure:
                    process.env.NODE_ENV ===
                    "production",
                    sameSite:
                        process.env.NODE_ENV === "production"
                            ? "none"
                            : "lax",
                path: "/",
                maxAge:
                    60 * 60 * 24,
            }
        );

        return response;
    } catch (error) {
        console.log(
            "Login error:",
            error
        );

        return errorResponse(
            "Login failed",
            500
        );
    }
}