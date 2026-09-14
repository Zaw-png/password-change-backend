import bcrypt from "bcryptjs";

import { getClientPromise } from "@/lib/mongodb";
import { isAdmin } from "@/lib/auth";
import {
    errorResponse,
    successResponse,
} from "@/lib/utils";

export async function PATCH(request) {
    try {
        if (!isAdmin(request)) {
            return errorResponse(
                "Admin access required",
                403
            );
        }

        const data = await request.json();

        const username = data.username;
        const newPassword = data.newPassword;

        if (!username || !newPassword) {
            return errorResponse(
                "Username and new password are required",
                400
            );
        }

        const hashedPassword =
            await bcrypt.hash(
                newPassword,
                12
            );

        const client =
            await getClientPromise();

        const db =
            client.db(
                process.env.DB_NAME
            );

        const result =
            await db
                .collection("user")
                .updateOne(
                    {
                        username: username,
                    },
                    {
                        $set: {
                            password:
                                hashedPassword,
                        },
                    }
                );

        if (result.matchedCount === 0) {
            return errorResponse(
                "User not found",
                404
            );
        }

        return successResponse(
            {
                message:
                    "Password changed successfully",
            },
            200
        );
    } catch (error) {
        console.log(
            "Change password error:",
            error
        );

        return errorResponse(
            "Failed to change password",
            500
        );
    }
}
