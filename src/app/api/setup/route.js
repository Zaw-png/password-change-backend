import bcrypt from "bcryptjs";

import { getClientPromise } from "@/lib/mongodb";
import {
    errorResponse,
    successResponse,
} from "@/lib/utils";

export async function POST() {
    try {
        const client = await getClientPromise();
        const db = client.db(process.env.DB_NAME);

        const users = db.collection("user");

        const existingAdmin = await users.findOne({
            username: "admin",
        });

        if (existingAdmin) {
            return errorResponse(
                "Setup has already been completed",
                400
            );
        }

        const adminPassword =
            await bcrypt.hash("Admin12345", 12);

        const userPassword =
            await bcrypt.hash("User12345", 12);

        await users.insertMany([
            {
                _id: -1,
                username: "admin",
                email: "admin@example.com",
                password: adminPassword,
                role: "admin",
            },
            {
                _id: 1,
                username: "user1",
                email: "user1@example.com",
                password: userPassword,
                role: "user",
            },
        ]);

        return successResponse(
            {
                message: "Setup completed",
                accounts: [
                    {
                        username: "admin",
                        password: "Admin12345",
                    },
                    {
                        username: "user1",
                        password: "User12345",
                    },
                ],
            },
            201
        );
    } catch (error) {
        console.log("Setup error:", error);

        return errorResponse(
            "Setup failed",
            500
        );
    }
}