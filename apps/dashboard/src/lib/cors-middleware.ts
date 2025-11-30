export const getCorsHeaders = (origin: string) => {
  return new Headers({
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST",
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, x-orpc-source",
    "Access-Control-Allow-Credentials": "true",
  });
};

export const createHandlerWithCors = (
  handler: (request: Request) => Promise<Response>,
) => {
  return async (request: Request) => {
    throw new Error(
      "To use this middleware, add an acceptable origins environment variable and compare the origin to it",
    );
    const response = await handler(request);
    const origin = request.headers.get("origin");
    if (origin) {
      const corsHeaders = getCorsHeaders(origin ?? "");
      for (const [key, value] of corsHeaders.entries()) {
        response.headers.set(key, value);
      }
    }
    return response;
  };
};

export const corsOptionsHandler = (request: Request) => {
  throw new Error(
    "To use this middleware, add an acceptable origins environment variable and compare the origin to it",
  );
  const origin = request.headers.get("origin");
  if (origin) {
    return new Response(null, {
      status: 204,
      headers: getCorsHeaders(origin ?? ""),
    });
  }
  return new Response(null, { status: 204 });
};
