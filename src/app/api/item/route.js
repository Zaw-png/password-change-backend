import { ObjectId } from "mongodb";

import { getClientPromise } from "@/lib/mongodb";
import { writeAuditLog } from "@/lib/audit";
import {
    X_HEADER_USER_ID,
    X_HEADER_USER_NAME,
} from "@/lib/constant";
import {
    errorResponse,
    successResponse,
} from "@/lib/utils";

export async function GET(request) {
    try {
        const client = await getClientPromise();
        const db = client.db(process.env.DB_NAME);

        const items = await db
            .collection("item")
            .find({})
            .toArray();

        await writeAuditLog({
            action: "GET_ITEMS",
            userId: request.headers.get(
                X_HEADER_USER_ID
            ),
            username: request.headers.get(
                X_HEADER_USER_NAME
            ),
        });

        return successResponse({ items });
    } catch (error) {
        console.log(error);

        return errorResponse(
            "Failed to get items",
            500
        );
    }
}

export async function POST(request) {
    try {
        const data = await request.json();

        if (!data.name) {
            return errorResponse(
                "Item name is required",
                400
            );
        }

        const client = await getClientPromise();
        const db = client.db(process.env.DB_NAME);

        const result = await db
            .collection("item")
            .insertOne({
                name: data.name,
                createdAt: new Date(),
            });

        await writeAuditLog({
            action: "CREATE_ITEM",
            userId: request.headers.get(
                X_HEADER_USER_ID
            ),
            username: request.headers.get(
                X_HEADER_USER_NAME
            ),
            itemId: result.insertedId.toString(),
        });

        return successResponse(
            {
                message: "Item created",
                id: result.insertedId,
            },
            201
        );
    } catch (error) {
        console.log(error);

        return errorResponse(
            "Failed to create item",
            500
        );
    }
}

export async function PATCH(request) {
    try {
        const data = await request.json();

        if (!data.id || !data.name) {
            return errorResponse(
                "ID and name are required",
                400
            );
        }

        const client = await getClientPromise();
        const db = client.db(process.env.DB_NAME);

        await db.collection("item").updateOne(
            {
                _id: new ObjectId(data.id),
            },
            {
                $set: {
                    name: data.name,
                },
            }
        );

        await writeAuditLog({
            action: "UPDATE_ITEM",
            userId: request.headers.get(
                X_HEADER_USER_ID
            ),
            username: request.headers.get(
                X_HEADER_USER_NAME
            ),
            itemId: data.id,
        });

        return successResponse({
            message: "Item updated",
        });
    } catch (error) {
        console.log(error);

        return errorResponse(
            "Failed to update item",
            500
        );
    }
}

export async function DELETE(request) {
    try {
        const data = await request.json();

        if (!data.id) {
            return errorResponse(
                "ID is required",
                400
            );
        }

        const client = await getClientPromise();
        const db = client.db(process.env.DB_NAME);

        await db.collection("item").deleteOne({
            _id: new ObjectId(data.id),
        });

        await writeAuditLog({
            action: "DELETE_ITEM",
            userId: request.headers.get(
                X_HEADER_USER_ID
            ),
            username: request.headers.get(
                X_HEADER_USER_NAME
            ),
            itemId: data.id,
        });

        return successResponse({
            message: "Item deleted",
        });
    } catch (error) {
        console.log(error);

        return errorResponse(
            "Failed to delete item",
            500
        );
    }
}
