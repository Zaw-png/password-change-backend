import { NextResponse } from "next/server";

export function successResponse(data, status = 200) {
    return NextResponse.json(data, { status });
}

export function errorResponse(message, status = 400) {
    return NextResponse.json(
        { message },
        { status }
    );
}