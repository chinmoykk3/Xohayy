import { NextResponse } from "next/server";
import { createHash } from "crypto";
import type { ApiErrorCode, ApiErrorBody } from "@/types";

export interface OkResponseOptions {
  status?: number;
  headers?: HeadersInit;
  cacheControl?: string;
}

/**
 * Computes an ETag for arbitrary data using SHA-1.
 */
export function computeEtag(data: unknown): string {
  const serialized = typeof data === "string" ? data : JSON.stringify(data);
  return `"${createHash("sha1").update(serialized).digest("hex")}"`;
}

/**
 * Returns a standardized JSON success response with conditional ETag validation.
 * Returns 304 Not Modified if the client's If-None-Match matches the payload ETag.
 */
export function conditionalOkResponse<T>(
  request: Request,
  data: T,
  contentForEtag: unknown,
  options: OkResponseOptions = {}
): NextResponse {
  const etag = computeEtag(contentForEtag);
  const ifNoneMatch = request.headers.get("if-none-match");

  const responseHeaders = new Headers(options.headers);
  responseHeaders.set("ETag", etag);
  if (options.cacheControl) {
    responseHeaders.set("Cache-Control", options.cacheControl);
  }

  if (ifNoneMatch && (ifNoneMatch === etag || ifNoneMatch === `W/${etag}`)) {
    return new NextResponse(null, {
      status: 304,
      headers: responseHeaders,
    });
  }

  return NextResponse.json(data, {
    status: options.status ?? 200,
    headers: responseHeaders,
  });
}

/**
 * Returns a standardized JSON success response.
 */
export function okResponse<T>(data: T, options: OkResponseOptions = {}): NextResponse<T> {
  const { status = 200, headers = {}, cacheControl } = options;
  const responseHeaders = new Headers(headers);

  if (cacheControl) {
    responseHeaders.set("Cache-Control", cacheControl);
  }

  return NextResponse.json(data, {
    status,
    headers: responseHeaders,
  });
}

/**
 * Returns a standardized JSON error response conforming to Section 19 specification.
 * Never includes stack traces to prevent security/information leakage.
 */
export function errorResponse(
  code: ApiErrorCode,
  message: string,
  status = 400,
  details?: Record<string, unknown>,
  headers?: HeadersInit
): NextResponse<ApiErrorBody> {
  const body: ApiErrorBody = {
    error: {
      code,
      message,
      ...(details ? { details } : {}),
    },
  };

  return NextResponse.json(body, {
    status,
    headers,
  });
}

export interface SafeJsonOptions {
  maxBytes?: number; // Defaults to 10 KB (10240 bytes)
}

export type SafeJsonResult<T> =
  { success: true; data: T } | { success: false; response: NextResponse<ApiErrorBody> };

/**
 * Safely parses request body JSON with strict content-type and size enforcement.
 */
export async function safeJson<T = unknown>(
  request: Request,
  options: SafeJsonOptions = {}
): Promise<SafeJsonResult<T>> {
  const maxBytes = options.maxBytes ?? 10 * 1024; // 10 KB

  // 1. Enforce content-type header
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return {
      success: false,
      response: errorResponse("VALIDATION_ERROR", "Content-Type must be application/json", 400),
    };
  }

  // 2. Enforce Content-Length if provided
  const contentLength = request.headers.get("content-length");
  if (contentLength && parseInt(contentLength, 10) > maxBytes) {
    return {
      success: false,
      response: errorResponse("VALIDATION_ERROR", "Payload exceeds maximum allowed size", 413),
    };
  }

  // 3. Read body safely
  let rawText = "";
  try {
    rawText = await request.text();
  } catch {
    return {
      success: false,
      response: errorResponse("SERVER_ERROR", "Unable to read request payload", 500),
    };
  }

  // Check actual byte size
  const byteLength = new TextEncoder().encode(rawText).length;
  if (byteLength > maxBytes) {
    return {
      success: false,
      response: errorResponse("VALIDATION_ERROR", "Payload exceeds maximum allowed size", 413),
    };
  }

  // 4. Parse JSON safely without exposing parser stack trace
  try {
    const parsed = JSON.parse(rawText) as T;
    return {
      success: true,
      data: parsed,
    };
  } catch {
    return {
      success: false,
      response: errorResponse("VALIDATION_ERROR", "Malformed JSON payload", 400),
    };
  }
}
