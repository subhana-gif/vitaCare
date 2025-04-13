"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpMessage = exports.HttpStatus = void 0;
var HttpStatus;
(function (HttpStatus) {
    HttpStatus[HttpStatus["OK"] = 200] = "OK";
    HttpStatus[HttpStatus["CREATED"] = 201] = "CREATED";
    HttpStatus[HttpStatus["BAD_REQUEST"] = 400] = "BAD_REQUEST";
    HttpStatus[HttpStatus["UNAUTHORIZED"] = 401] = "UNAUTHORIZED";
    HttpStatus[HttpStatus["FORBIDDEN"] = 403] = "FORBIDDEN";
    HttpStatus[HttpStatus["NOT_FOUND"] = 404] = "NOT_FOUND";
    HttpStatus[HttpStatus["INTERNAL_SERVER_ERROR"] = 500] = "INTERNAL_SERVER_ERROR";
})(HttpStatus || (exports.HttpStatus = HttpStatus = {}));
var HttpMessage;
(function (HttpMessage) {
    HttpMessage["OK"] = "Success";
    HttpMessage["CREATED"] = "Resource created successfully";
    HttpMessage["BAD_REQUEST"] = "Bad request";
    HttpMessage["UNAUTHORIZED"] = "Unauthorized access";
    HttpMessage["FORBIDDEN"] = "Forbidden access";
    HttpMessage["NOT_FOUND"] = "Resource not found";
    HttpMessage["INTERNAL_SERVER_ERROR"] = "Internal server error";
})(HttpMessage || (exports.HttpMessage = HttpMessage = {}));
