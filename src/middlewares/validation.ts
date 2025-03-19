import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { PaymentMethod } from '../entities/MyTransaction';
import { DiscountUnit } from '../entities/Product';
/**
 * Create a validation middleware using Joi schema
 * @param schema Joi schema for validation
 */
// const createValidationMiddleware = async (schema: Joi.ObjectSchema): Promise<any> => {
//   return (req: Request, res: Response, next: NextFunction) => {
//     const { error } = schema.validate(req.body, {
//       abortEarly: false,
//       stripUnknown: true,
//       allowUnknown: false
//     });

//     if (error) {
//       const errorMessage = error.details.map(detail => detail.message).join(', ');
//       return res.status(400).json({
//         success: false,
//         error: 'Validation Error',
//         details: error.details,
//         message: errorMessage
//       });
//     }

//     next();
//   };
// };

/**
 * Joi validation schema for creating a sale transaction
 */
const createSaleTransactionSchema = Joi.object({
  customerId: Joi.number().integer().positive().required()
    .messages({
      'number.base': 'Customer ID must be a number',
      'number.integer': 'Customer ID must be an integer',
      'number.positive': 'Customer ID must be positive',
      'any.required': 'Customer ID is required'
    }),

  warehouseId: Joi.string().required()
    .messages({
      'string.base': 'Warehouse ID must be a string',
      'any.required': 'Warehouse ID is required'
    }),

  paymentMethod: Joi.string().valid(...Object.values(PaymentMethod)).default(PaymentMethod.CASH)
    .messages({
      'string.base': 'Payment method must be a string',
      'any.only': `Payment method must be one of: ${Object.values(PaymentMethod).join(', ')}`
    }),

  saleItems: Joi.array().items(
    Joi.object({
      productId: Joi.string().required()
        .messages({
          'string.base': 'Product ID must be a string',
          'any.required': 'Product ID is required'
        }),

      quantity: Joi.number().integer().positive().required()
        .messages({
          'number.base': 'Quantity must be a number',
          'number.integer': 'Quantity must be an integer',
          'number.positive': 'Quantity must be positive',
          'any.required': 'Quantity is required'
        }),

      unitPrice: Joi.number().positive().required()
        .messages({
          'number.base': 'Unit price must be a number',
          'number.positive': 'Unit price must be positive',
          'any.required': 'Unit price is required'
        }),

      batchId: Joi.string().optional()
        .messages({
          'string.base': 'Batch ID must be a string'
        })
    })
  ).min(1).required()
    .messages({
      'array.base': 'Sale items must be an array',
      'array.min': 'At least one sale item is required',
      'any.required': 'Sale items are required'
    }),

  discount: Joi.number().min(0).default(0)
    .messages({
      'number.base': 'Discount must be a number',
      'number.min': 'Discount cannot be negative'
    }),

  discountUnit: Joi.string().valid(...Object.values(DiscountUnit)).default(DiscountUnit.PERCENTAGE)
    .messages({
      'string.base': 'Discount unit must be a string',
      'any.only': `Discount unit must be one of: ${Object.values(DiscountUnit).join(', ')}`
    }),

  vat: Joi.number().min(0).default(0)
    .messages({
      'number.base': 'VAT must be a number',
      'number.min': 'VAT cannot be negative'
    }),

  saleNote: Joi.string().optional().allow('', null)
    .messages({
      'string.base': 'Sale note must be a string'
    })
});

/**
 * Middleware for validating sale transaction creation
 */
export const validateCreateSaleTransaction = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const { error } = createSaleTransactionSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
    allowUnknown: false
  });

  if (error) {
    const errorMessage = error.details.map(detail => detail.message).join(', ');
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      details: error.details,
      message: errorMessage
    });
  }

  next();
};