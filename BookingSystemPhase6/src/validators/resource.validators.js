// src/validators/resource.validators.js
import { body } from "express-validator";

// Validation rules for POST /api/resources
export const resourceValidators = [
  body("resourceName")
    .exists({ checkFalsy: true })
    .withMessage("resourceName is required")
    .isString()
    .withMessage("resourceName must be a string")
    .trim()
    .matches(/^[a-zA-Z0-9äöåÄÖÅ \,\.\-]+$/)
    .withMessage("resourceName can only contain letters, numbers, spaces and symbols ,.-")
    .isLength({ min: 5, max: 30 })
    .withMessage("resourceName must be 5-30 characters"),

  body("resourceDescription")
    .exists({ checkFalsy: true })
    .withMessage("resourceDescription is required")
    .isString()
    .withMessage("resourceDescription must be a string")
    .trim()
    .matches(/^[a-zA-Z0-9äöåÄÖÅ \,\.\-]+$/)
    .withMessage("resourceDescription can only contain letters, numbers, spaces and symbols ,.-")
    .isLength({ min: 10, max: 50 })
    .withMessage("resourceDescription must be 10-50 characters"),

  body("resourceAvailable")
    .exists()
    .withMessage("resourceAvailable is required")
    .isBoolean()
    .withMessage("resourceAvailable must be boolean"),

  body("resourcePrice")
    .exists()
    .withMessage("resourcePrice is required")
    .isFloat({ min: 0 })
    .withMessage("resourcePrice must be a non-negative number"),

  body("resourcePriceUnit")
    .exists({ checkFalsy: true })
    .withMessage("resourcePriceUnit is required")
    .isString()
    .withMessage("resourcePriceUnit must be a string")
    .trim()
    .isIn(["hour", "day", "week", "month"])
    .withMessage("resourcePriceUnit must be 'hour', 'day', 'week', or 'month'"),
];