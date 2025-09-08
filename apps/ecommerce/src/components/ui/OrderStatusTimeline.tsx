import React from 'react';
import { cn } from '../../utils/cn';

export type OrderStatus = 
  | 'PENDING'
  | 'PROCESSING'
  | 'ON_HOLD'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELED'
  | 'RETURNED'
  | 'REFUNDED';

export interface OrderStatusTimelineProps {
  currentStatus: OrderStatus;
  className?: string;
}

const statusConfig = {
  PENDING: {
    label: 'Pending',
    description: 'Order received',
    icon: '⏳',
    color: 'warning',
  },
  PROCESSING: {
    label: 'Processing',
    description: 'Order confirmed',
    icon: '🔄',
    color: 'primary',
  },
  ON_HOLD: {
    label: 'On Hold',
    description: 'Payment verification',
    icon: '⏸️',
    color: 'warning',
  },
  SHIPPED: {
    label: 'Shipped',
    description: 'On the way',
    icon: '🚚',
    color: 'primary',
  },
  DELIVERED: {
    label: 'Delivered',
    description: 'Order completed',
    icon: '✅',
    color: 'success',
  },
  CANCELED: {
    label: 'Canceled',
    description: 'Order canceled',
    icon: '❌',
    color: 'error',
  },
  RETURNED: {
    label: 'Returned',
    description: 'Order returned',
    icon: '↩️',
    color: 'error',
  },
  REFUNDED: {
    label: 'Refunded',
    description: 'Refund processed',
    icon: '💰',
    color: 'error',
  },
};

const statusOrder: OrderStatus[] = [
  'PENDING',
  'PROCESSING',
  'ON_HOLD',
  'SHIPPED',
  'DELIVERED',
];

const getStatusIndex = (status: OrderStatus): number => {
  return statusOrder.indexOf(status);
};

const getStatusColor = (color: string, isActive: boolean, isCompleted: boolean) => {
  if (isCompleted) {
    return 'bg-success-500 border-success-500 text-white';
  }
  if (isActive) {
    switch (color) {
      case 'primary':
        return 'bg-primary-500 border-primary-500 text-white';
      case 'warning':
        return 'bg-warning-500 border-warning-500 text-white';
      case 'error':
        return 'bg-error-500 border-error-500 text-white';
      default:
        return 'bg-primary-500 border-primary-500 text-white';
    }
  }
  return 'bg-neutral-200 border-neutral-200 text-neutral-500';
};

export const OrderStatusTimeline: React.FC<OrderStatusTimelineProps> = ({
  currentStatus,
  className,
}) => {
  const currentIndex = getStatusIndex(currentStatus);
  const isErrorStatus = ['CANCELED', 'RETURNED', 'REFUNDED'].includes(currentStatus);

  return (
    <div className={cn('w-full', className)}>
      {/* Desktop: Horizontal Timeline */}
      <div className="hidden md:block">
        <div className="flex items-center justify-between">
          {statusOrder.map((status, index) => {
            const config = statusConfig[status];
            const isActive = index === currentIndex;
            const isCompleted = index < currentIndex;
            const isLast = index === statusOrder.length - 1;

            return (
              <React.Fragment key={status}>
                {/* Status Step */}
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-semibold transition-all duration-300',
                      getStatusColor(config.color, isActive, isCompleted)
                    )}
                  >
                    {isCompleted ? '✓' : config.icon}
                  </div>
                  <div className="mt-2 text-center">
                    <p className={cn(
                      'text-xs font-medium',
                      isActive || isCompleted ? 'text-neutral-900' : 'text-neutral-500'
                    )}>
                      {config.label}
                    </p>
                    <p className="text-xs text-neutral-400 mt-1">
                      {config.description}
                    </p>
                  </div>
                </div>

                {/* Connector Line */}
                {!isLast && (
                  <div className="flex-1 mx-4">
                    <div className={cn(
                      'h-0.5 transition-all duration-300',
                      isCompleted ? 'bg-success-500' : 'bg-neutral-200'
                    )} />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Mobile: Vertical Timeline */}
      <div className="md:hidden">
        <div className="space-y-4">
          {statusOrder.map((status, index) => {
            const config = statusConfig[status];
            const isActive = index === currentIndex;
            const isCompleted = index < currentIndex;

            return (
              <div key={status} className="flex items-start">
                {/* Status Icon */}
                <div
                  className={cn(
                    'w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-semibold transition-all duration-300 flex-shrink-0',
                    getStatusColor(config.color, isActive, isCompleted)
                  )}
                >
                  {isCompleted ? '✓' : config.icon}
                </div>

                {/* Status Info */}
                <div className="ml-3 flex-1">
                  <p className={cn(
                    'text-sm font-medium',
                    isActive || isCompleted ? 'text-neutral-900' : 'text-neutral-500'
                  )}>
                    {config.label}
                  </p>
                  <p className="text-xs text-neutral-400 mt-1">
                    {config.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Error Status Display */}
      {isErrorStatus && (
        <div className="mt-6 p-4 bg-error-50 border border-error-200 rounded-lg">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-error-500 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
              {statusConfig[currentStatus].icon}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-error-800">
                {statusConfig[currentStatus].label}
              </p>
              <p className="text-xs text-error-600 mt-1">
                {statusConfig[currentStatus].description}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderStatusTimeline;
