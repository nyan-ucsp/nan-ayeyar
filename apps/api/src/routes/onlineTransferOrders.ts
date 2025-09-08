import express from 'express';
import { authenticate, requireAdmin } from '../middleware/auth';
import {
  createOnlineTransferOrder,
  confirmPayment,
  getPaymentDetails,
  getOrderPaymentInfo,
  validateOnlineTransferOrder,
  validatePaymentConfirmation,
  validateOrderId
} from '../controllers/onlineTransferOrders';

const router = express.Router();

// Customer routes - require authentication
router.post('/', authenticate, validateOnlineTransferOrder, createOnlineTransferOrder);
router.get('/:id/payment-info', authenticate, validateOrderId, getOrderPaymentInfo);

// Admin routes - require authentication and admin role
router.use(authenticate);
router.use(requireAdmin);

router.patch('/:id/payment-confirmation', validatePaymentConfirmation, confirmPayment);
router.get('/:id/payment-details', validateOrderId, getPaymentDetails);

export default router;
