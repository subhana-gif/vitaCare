"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const express_validator_1 = require("express-validator");
const validate = () => [
    (0, express_validator_1.body)("name")
        .optional()
        .isString()
        .withMessage("Name must be a string")
        .trim()
        .isLength({ min: 2 })
        .withMessage("Name must be at least 2 characters long"),
    (0, express_validator_1.body)("email")
        .isEmail()
        .withMessage("Please provide a valid email")
        .normalizeEmail(),
    (0, express_validator_1.body)("password")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters long"),
    (0, express_validator_1.body)("phone")
        .optional()
        .isMobilePhone("any")
        .withMessage("Invalid phone number format"),
    (0, express_validator_1.body)("gender")
        .optional()
        .isIn(["male", "female", "other"])
        .withMessage("Gender must be either male, female, or other"),
    (0, express_validator_1.body)("dob")
        .optional()
        .isISO8601()
        .withMessage("Invalid date format. Use YYYY-MM-DD"),
];
exports.validate = validate;
