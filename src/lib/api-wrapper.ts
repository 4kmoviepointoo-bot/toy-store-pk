import { NextRequest, NextResponse } from "next/server";

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code: string = "INTERNAL_ERROR"
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const COMPRESSION_HEADERS: Record<string, string> = {
  "Vary": "Accept-Encoding",
  "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
};

function jsonResponse(body: unknown, status: number): NextResponse {
  const res = NextResponse.json(body, { status });
  for (const [key, value] of Object.entries(COMPRESSION_HEADERS)) {
    res.headers.set(key, value);
  }
  return res;
}

export function apiSuccess<T>(data: T, status: number = 200): NextResponse {
  return jsonResponse({ success: true, data } satisfies ApiResponse<T>, status);
}

export function apiError(
  message: string,
  status: number = 500,
  code: string = "INTERNAL_ERROR"
): NextResponse {
  return jsonResponse(
    { success: false, error: message, code } satisfies ApiResponse,
    status
  );
}

type RouteHandler = (
  request: NextRequest,
  context?: { params: Promise<Record<string, string>> }
) => Promise<NextResponse | Response>;

export function createSafeRoute(handler: RouteHandler): RouteHandler {
  return async (request, context) => {
    try {
      return await handler(request, context);
    } catch (err) {
      if (err instanceof ApiError) {
        console.error(`[API] ${err.code}: ${err.message}`);
        return apiError(err.message, err.statusCode, err.code);
      }

      console.error("[API] Unhandled error:", err);
      return apiError("An unexpected error occurred", 500, "INTERNAL_ERROR");
    }
  };
}
