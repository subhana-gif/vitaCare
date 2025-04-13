"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const HttpStatus_1 = require("../enums/HttpStatus");
const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    if (err.name === 'ValidationError') {
        res.status(HttpStatus_1.HttpStatus.BAD_REQUEST).json({
            success: false,
            error: err.message
        });
        return;
    }
    res.status(HttpStatus_1.HttpStatus.INTERNAL_SERVER_ERROR).json(Object.assign({ success: false, error: process.env.NODE_ENV === 'production'
            ? 'Internal server error'
            : err.message }, (process.env.NODE_ENV === 'development' && { stack: err.stack })));
};
exports.default = errorHandler;
