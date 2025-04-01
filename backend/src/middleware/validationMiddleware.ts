import { body, ValidationChain } from "express-validator";

export const validate = (): ValidationChain[] => [
  body("name")
    .optional()
    .isString()
    .withMessage("Name must be a string")
    .trim()
    .isLength({ min: 2 })
    .withMessage("Name must be at least 2 characters long"),

  body("email")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),

  body("phone")
    .optional()
    .isMobilePhone("any")
    .withMessage("Invalid phone number format"),

  body("gender")
    .optional()
    .isIn(["male", "female", "other"])
    .withMessage("Gender must be either male, female, or other"),

  body("dob")
    .optional()
    .isISO8601()
    .withMessage("Invalid date format. Use YYYY-MM-DD"),
];
