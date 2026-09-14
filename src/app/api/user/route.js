import { getClientPromise } from "@/lib/mongodb";
import { isAdmin } from "@/lib/auth";
import {
    errorResponse,
    successResponse,
} from "@/lib/utils";

export async function GET(request) {
    try {
        if (!isAdmin(request)) {
            return errorResponse(
                "Admin access required",
                403
            );
        }

        const client = await getClientPromise();
        const db = client.db(process.env.DB_NAME);

        const users = await db
            .collection("user")
            .find(
                {},
                {
                    projection: {
                        password: 0,
                    },
                }
            )
            .toArray();

        return successResponse(
            { users },
            200
        );
    } catch (error) {
        console.log("Get users error:", error);

        return errorResponse(
            "Failed to get users",
            500
        );
    }
}
