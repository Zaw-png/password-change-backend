import { getClientPromise } from "@/lib/mongodb";

export async function writeAuditLog({
    action,
    userId,
    username,
    itemId = null,
}) {
    const client = await getClientPromise();
    const db = client.db(process.env.DB_NAME);

    await db.collection("audit_log").insertOne({
        action,
        userId,
        username,
        itemId,
        timestamp: new Date(),
    });
}
