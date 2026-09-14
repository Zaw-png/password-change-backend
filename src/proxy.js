import { NextResponse } from "next/server";

import { verifyJWT } from "./lib/auth";
import {
    X_HEADER_USER_ID,
    X_HEADER_USER_NAME,
    X_HEADER_USER_EMAIL,
} from "./lib/constant";

export function proxy(request) {
    if (request.method === "OPTIONS") {
        return NextResponse.next();
    }

    const user = verifyJWT(request);
    if (!user) {
        return NextResponse.json(
            { message: "Unauthorized Request" },
            { status: 401 }
        );
    }

    const requestHeaders = new Headers(
        request.headers
    );

    requestHeaders.set(
        X_HEADER_USER_ID,
        String(user.id)
    );

    requestHeaders.set(
        X_HEADER_USER_NAME,
        user.username || ""
    );

    requestHeaders.set(
        X_HEADER_USER_EMAIL,
        user.email || ""
    );

    return NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    });
}

export const config = {
    matcher: [
        "/api/item/:path*",
        "/api/user/:path*",
    ],
};
