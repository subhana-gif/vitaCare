export enum HttpStatus {
    OK = 200,
    CREATED = 201,
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    INTERNAL_SERVER_ERROR = 500,
}

export enum HttpMessage {
    OK = "Success",
    CREATED = "Resource created successfully",
    BAD_REQUEST = "Bad request",
    UNAUTHORIZED = "Unauthorized access",
    FORBIDDEN = "Forbidden access",
    NOT_FOUND = "Resource not found",
    INTERNAL_SERVER_ERROR = "Internal server error",
}
