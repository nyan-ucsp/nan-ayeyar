import express from 'express';
import { authenticate } from '../middleware/auth';
import {
  getCustomerPaymentMethods,
  getCustomerPaymentMethod,
  createCustomerPaymentMethod,
  updateCustomerPaymentMethod,
  deleteCustomerPaymentMethod,
  getPaymentMethodTypes,
  validateCreatePaymentMethod,
  validateUpdatePaymentMethod,
  validatePaymentMethodId
} from '../controllers/customerPaymentMethods';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Customer payment method CRUD operations
router.get('/', getCustomerPaymentMethods);
router.get('/types', getPaymentMethodTypes);
router.get('/:id', validatePaymentMethodId, getCustomerPaymentMethod);
router.post('/', validateCreatePaymentMethod, createCustomerPaymentMethod);
router.patch('/:id', validateUpdatePaymentMethod, updateCustomerPaymentMethod);
router.delete('/:id', validatePaymentMethodId, deleteCustomerPaymentMethod);

export default router;
