import React, { useState } from 'react';
import { 
  X, 
  User, 
  MapPin, 
  CreditCard, 
  Package, 
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Truck,
  DollarSign,
  Image as ImageIcon
} from 'lucide-react';
import { Order, OrderStatus } from '@/types';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import ProductImage from '@/components/ui/ProductImage';
import { cn } from '@/utils/cn';

// Helper function to get available actions based on current status
const getAvailableActions = (currentStatus: OrderStatus) => {
  const actions = [];
  
  switch (currentStatus) {
    case 'PENDING':
      actions.push(
        { status: 'PROCESSING', label: 'Confirm Order', variant: 'primary' as const, icon: <CheckCircle className="h-4 w-4 mr-2" /> },
        { status: 'CANCELED', label: 'Cancel Order', variant: 'danger' as const, icon: <XCircle className="h-4 w-4 mr-2" /> }
      );
      break;
    case 'PROCESSING':
      actions.push(
        { status: 'SHIPPED', label: 'Mark as Shipped', variant: 'primary' as const, icon: <Truck className="h-4 w-4 mr-2" /> },
        { status: 'ON_HOLD', label: 'Put on Hold', variant: 'secondary' as const, icon: <Clock className="h-4 w-4 mr-2" /> },
        { status: 'CANCELED', label: 'Cancel Order', variant: 'danger' as const, icon: <XCircle className="h-4 w-4 mr-2" /> }
      );
      break;
    case 'ON_HOLD':
      actions.push(
        { status: 'PROCESSING', label: 'Resume Processing', variant: 'primary' as const, icon: <CheckCircle className="h-4 w-4 mr-2" /> },
        { status: 'CANCELED', label: 'Cancel Order', variant: 'danger' as const, icon: <XCircle className="h-4 w-4 mr-2" /> }
      );
      break;
    case 'SHIPPED':
      actions.push(
        { status: 'DELIVERED', label: 'Mark as Delivered', variant: 'success' as const, icon: <Package className="h-4 w-4 mr-2" /> },
        { status: 'RETURNED', label: 'Mark as Returned', variant: 'secondary' as const, icon: <XCircle className="h-4 w-4 mr-2" /> }
      );
      break;
    case 'DELIVERED':
      actions.push(
        { status: 'RETURNED', label: 'Process Return', variant: 'secondary' as const, icon: <XCircle className="h-4 w-4 mr-2" /> }
      );
      break;
    case 'RETURNED':
      // Refund is handled via dedicated refund form button for online transfers
      break;
    case 'CANCELED':
      // Only allow refund for cancelled online transfer orders (not COD)
      // COD orders can't be refunded when cancelled since no payment was made
      break;
    default:
      // No actions available for REFUNDED
      break;
  }
  
  return actions;
};

// Helper function to get status display info
const getStatusInfo = (status: OrderStatus) => {
  const statusConfig = {
    PENDING: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending', icon: <Clock className="h-4 w-4" /> },
    PROCESSING: { color: 'bg-blue-100 text-blue-800', label: 'Processing', icon: <CheckCircle className="h-4 w-4" /> },
    ON_HOLD: { color: 'bg-orange-100 text-orange-800', label: 'On Hold', icon: <Clock className="h-4 w-4" /> },
    SHIPPED: { color: 'bg-purple-100 text-purple-800', label: 'Shipped', icon: <Truck className="h-4 w-4" /> },
    DELIVERED: { color: 'bg-green-100 text-green-800', label: 'Delivered', icon: <Package className="h-4 w-4" /> },
    CANCELED: { color: 'bg-red-100 text-red-800', label: 'Canceled', icon: <XCircle className="h-4 w-4" /> },
    RETURNED: { color: 'bg-orange-100 text-orange-800', label: 'Returned', icon: <XCircle className="h-4 w-4" /> },
    REFUNDED: { color: 'bg-gray-100 text-gray-800', label: 'Refunded', icon: <DollarSign className="h-4 w-4" /> },
  };
  
  return statusConfig[status] || statusConfig.PENDING;
};

// Helper function to generate order timeline
const getOrderTimeline = (order: Order) => {
  const timeline = [
    {
      status: 'PENDING',
      label: 'Order Placed',
      icon: <Clock className="h-4 w-4" />,
      date: new Date(order.createdAt).toLocaleString(),
      completed: true,
      current: false
    }
  ];

  // Only show statuses that actually occurred based on current status
  switch (order.status) {
    case 'PROCESSING':
      timeline.push({
        status: 'PROCESSING',
        label: 'Order Confirmed',
        icon: <CheckCircle className="h-4 w-4" />,
        date: new Date(order.updatedAt).toLocaleString(),
        completed: true,
        current: true
      });
      break;
    
    case 'ON_HOLD':
      timeline.push({
        status: 'PROCESSING',
        label: 'Order Confirmed',
        icon: <CheckCircle className="h-4 w-4" />,
        date: new Date(order.updatedAt).toLocaleString(),
        completed: true,
        current: false
      });
      timeline.push({
        status: 'ON_HOLD',
        label: 'Order On Hold',
        icon: <Clock className="h-4 w-4" />,
        date: new Date(order.updatedAt).toLocaleString(),
        completed: true,
        current: true
      });
      break;
    
    case 'SHIPPED':
      timeline.push({
        status: 'PROCESSING',
        label: 'Order Confirmed',
        icon: <CheckCircle className="h-4 w-4" />,
        date: new Date(order.updatedAt).toLocaleString(),
        completed: true,
        current: false
      });
      timeline.push({
        status: 'SHIPPED',
        label: 'Order Shipped',
        icon: <Truck className="h-4 w-4" />,
        date: new Date(order.updatedAt).toLocaleString(),
        completed: true,
        current: true
      });
      break;
    
    case 'DELIVERED':
      timeline.push({
        status: 'PROCESSING',
        label: 'Order Confirmed',
        icon: <CheckCircle className="h-4 w-4" />,
        date: new Date(order.updatedAt).toLocaleString(),
        completed: true,
        current: false
      });
      timeline.push({
        status: 'SHIPPED',
        label: 'Order Shipped',
        icon: <Truck className="h-4 w-4" />,
        date: new Date(order.updatedAt).toLocaleString(),
        completed: true,
        current: false
      });
      timeline.push({
        status: 'DELIVERED',
        label: 'Order Delivered',
        icon: <Package className="h-4 w-4" />,
        date: new Date(order.updatedAt).toLocaleString(),
        completed: true,
        current: true
      });
      break;
    
    case 'CANCELED':
      timeline.push({
        status: 'CANCELED',
        label: 'Order Cancelled',
        icon: <XCircle className="h-4 w-4" />,
        date: new Date(order.updatedAt).toLocaleString(),
        completed: true,
        current: true
      });
      break;
    
    case 'RETURNED':
      timeline.push({
        status: 'PROCESSING',
        label: 'Order Confirmed',
        icon: <CheckCircle className="h-4 w-4" />,
        date: new Date(order.updatedAt).toLocaleString(),
        completed: true,
        current: false
      });
      timeline.push({
        status: 'SHIPPED',
        label: 'Order Shipped',
        icon: <Truck className="h-4 w-4" />,
        date: new Date(order.updatedAt).toLocaleString(),
        completed: true,
        current: false
      });
      timeline.push({
        status: 'DELIVERED',
        label: 'Order Delivered',
        icon: <Package className="h-4 w-4" />,
        date: new Date(order.updatedAt).toLocaleString(),
        completed: true,
        current: false
      });
      timeline.push({
        status: 'RETURNED',
        label: 'Order Returned',
        icon: <XCircle className="h-4 w-4" />,
        date: new Date(order.updatedAt).toLocaleString(),
        completed: true,
        current: true
      });
      break;
    
    case 'REFUNDED':
      // For refunded orders, show the path that led to refund
      if (order.status === 'REFUNDED') {
        timeline.push({
          status: 'REFUNDED',
          label: 'Order Refunded',
          icon: <DollarSign className="h-4 w-4" />,
          date: new Date(order.updatedAt).toLocaleString(),
          completed: true,
          current: true
        });
      }
      break;
  }

  return timeline;
};

interface OrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onStatusUpdate: (orderId: string, status: OrderStatus, refundData?: { amount: number; reason: string }) => void;
}

const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  isOpen,
  onClose,
  order,
  onStatusUpdate,
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showRefundForm, setShowRefundForm] = useState(false);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [refundError, setRefundError] = useState<string | null>(null);

  const handleStatusUpdate = async (newStatus: OrderStatus) => {
    if (!order) return;
    
    setIsUpdating(true);
    try {
      await onStatusUpdate(order.id, newStatus);
      // Close modal after successful update
      onClose();
    } catch (error) {
      console.error('Failed to update order status:', error);
      // You might want to show a toast notification here
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRefund = async () => {
    if (!order || !refundAmount || !refundReason) return;
    const amountNum = parseFloat(refundAmount);
    if (isNaN(amountNum) || amountNum <= 0 || amountNum > order.total) {
      setRefundError(`Amount must be between 0 and ${order.total}`);
      return;
    }
    
    setIsUpdating(true);
    try {
      await onStatusUpdate(order.id, 'REFUNDED', {
        amount: amountNum,
        reason: refundReason,
      });
      setShowRefundForm(false);
      setRefundAmount('');
      setRefundReason('');
      setRefundError(null);
      onClose();
    } catch (error) {
      console.error('Failed to process refund:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  if (!order) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount) + ' MMK';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };





  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Order #${order.id.slice(-8)}`}
      size="2xl"
    >
      <div className="space-y-6">
        {/* Order Status */}
        <Card>
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Order Status</h3>
              <span className={cn(
                'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
                getStatusInfo(order.status).color
              )}>
                {getStatusInfo(order.status).icon}
                <span className="ml-2">{getStatusInfo(order.status).label}</span>
              </span>
            </div>
          </div>
          <div className="p-6">
            <div className="text-sm text-gray-600">
              Current order status. Use the actions below to update the status.
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Customer Information */}
          <Card>
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Customer Information
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Name</label>
                  <p className="text-sm text-gray-900">{order.customerName || 'Unknown'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-sm text-gray-900">{order.customerEmail || 'Unknown'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Address</label>
                  <p className="text-sm text-gray-900">{order.shippingAddress?.address || 'Unknown'}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Shipping Information */}
          <Card>
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Shipping Address
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Name</label>
                  <p className="text-sm text-gray-900">{order.shippingAddress.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Address</label>
                  <p className="text-sm text-gray-900">{order.shippingAddress.address}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone</label>
                  <p className="text-sm text-gray-900">{order.shippingAddress.phone}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Payment Information */}
        <Card>
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              Payment Information
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Payment Type</label>
                  <p className="text-sm text-gray-900">{order.paymentType}</p>
                </div>
                {order.paymentMethod && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Payment Method</label>
                    <p className="text-sm text-gray-900">
                      {order.paymentMethod.type} - {order.paymentMethod.details.accountName}
                    </p>
                  </div>
                )}
                {order.transactionId && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Transaction ID</label>
                    <p className="text-sm text-gray-900 font-mono">{order.transactionId}</p>
                  </div>
                )}
              </div>
              
              {order.paymentScreenshot && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Payment Screenshot</label>
                  <div className="mt-2">
                    <img
                      src={order.paymentScreenshot}
                      alt="Payment Screenshot"
                      className="w-full h-48 object-cover rounded-lg border border-gray-200"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Order Items */}
        <Card>
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Package className="h-5 w-5 mr-2" />
              Order Items
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
                    <ProductImage
                      src={item.product?.images && item.product.images.length > 0 ? item.product.images[0] : undefined}
                      alt={item.productName || 'Product'}
                      className="w-full h-full rounded-lg"
                      showLoadingSpinner={false}
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{item.productName || 'Unknown Product'}</h4>
                    <p className="text-sm text-gray-500">SKU: {item.product?.sku || 'N/A'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      {formatCurrency(item.price)} × {item.quantity}
                    </p>
                    <p className="text-sm text-gray-500">
                      Total: {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">Total Amount</span>
                <span className="text-lg font-bold text-gray-900">
                  {formatCurrency(order.total)}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Order Timeline */}
        <Card>
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Order Timeline
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {getOrderTimeline(order).map((timelineItem, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className={cn(
                    'w-3 h-3 rounded-full mt-1',
                    timelineItem.completed ? 'bg-green-500' : 
                    timelineItem.current ? 'bg-blue-500' : 'bg-gray-300'
                  )}></div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      {timelineItem.icon}
                      <p className={cn(
                        'text-sm font-medium',
                        timelineItem.completed ? 'text-green-700' :
                        timelineItem.current ? 'text-blue-700' : 'text-gray-500'
                      )}>
                        {timelineItem.label}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {timelineItem.date}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Refund Form */}
        {showRefundForm && (
          <Card>
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {order.status === 'CANCELED' ? 'Process Refund for Cancelled Order' : 'Process Refund'}
              </h3>
              {order.status === 'CANCELED' && (
                <p className="text-sm text-gray-600 mt-1">
                  This order was cancelled but the customer has already paid. Process a refund to return their payment.
                </p>
              )}
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Refund Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    max={order.total}
                    value={refundAmount}
                    onChange={(e) => {
                      setRefundAmount(e.target.value);
                      setRefundError(null);
                    }}
                    placeholder={order.status === 'CANCELED' ? order.total.toString() : "0.00"}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  {refundError && (
                    <p className="mt-1 text-sm text-red-600">{refundError}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Refund Reason
                  </label>
                  <textarea
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                    rows={3}
                    placeholder={order.status === 'CANCELED' ? "Order was cancelled - refunding customer payment..." : "Enter reason for refund..."}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowRefundForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="danger"
                    onClick={handleRefund}
                    loading={isUpdating}
                    disabled={!refundAmount || !refundReason}
                  >
                    Process Refund
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Order Actions */}
        <Card>
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Order Actions</h3>
          </div>
          <div className="p-6">
            <div className="flex flex-wrap gap-3">
              {/* Status-based actions */}
              {getAvailableActions(order.status).map((action) => (
                <Button
                  key={action.status}
                  variant={action.variant}
                  onClick={() => handleStatusUpdate(action.status as OrderStatus)}
                  loading={isUpdating}
                  disabled={isUpdating}
                >
                  {action.icon}
                  {action.label}
                </Button>
              ))}
              
              {/* Refund action for online payments - only for returned orders or cancelled online transfer orders */}
              {order.paymentType === 'ONLINE_TRANSFER' && 
               order.status !== 'REFUNDED' && 
               (order.status === 'RETURNED' || order.status === 'CANCELED') && (
                <Button
                  variant="danger"
                  onClick={() => setShowRefundForm(!showRefundForm)}
                >
                  {showRefundForm ? 'Cancel Refund' : 'Process Refund'}
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Actions Footer */}
        <div className="flex justify-end pt-6 border-t border-gray-200">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default OrderDetailModal;
