import express from 'express';
import { authenticate, requireAdmin } from '../middleware/auth';
import {
  getCompanyPaymentAccounts,
  getCompanyPaymentAccount,
  createCompanyPaymentAccount,
  updateCompanyPaymentAccount,
  deleteCompanyPaymentAccount,
  getEnabledCompanyPaymentAccounts,
  validateCreateCompanyAccount,
  validateUpdateCompanyAccount,
  validateCompanyAccountId
} from '../controllers/companyPaymentAccounts';

const router = express.Router();

// Public route - get enabled company payment accounts for checkout
router.get('/', getEnabledCompanyPaymentAccounts);

// Admin routes - require authentication and admin role
router.use(authenticate);
router.use(requireAdmin);

// Admin CRUD operations
router.get('/admin', getCompanyPaymentAccounts);
router.get('/admin/:id', validateCompanyAccountId, getCompanyPaymentAccount);
router.post('/admin', validateCreateCompanyAccount, createCompanyPaymentAccount);
router.patch('/admin/:id', validateUpdateCompanyAccount, updateCompanyPaymentAccount);
router.delete('/admin/:id', validateCompanyAccountId, deleteCompanyPaymentAccount);

export default router;
