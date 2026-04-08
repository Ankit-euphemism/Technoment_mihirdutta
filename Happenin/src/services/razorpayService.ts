/**
 * RAZORPAY SERVICE (FRONTEND)
 * 
 * Handles Razorpay payment integration for ticket purchases
 * 
 * Flow:
 * 1. Frontend calls createRazorpayOrder() → Gets order ID from backend
 * 2. Frontend opens Razorpay modal with order details
 * 3. User pays via Razorpay
 * 4. Frontend gets payment_id from Razorpay
 * 5. Frontend calls verifyPayment() → Backend verifies signature
 * 6. Backend creates tickets if verification succeeds
 */

import { supabase } from '../lib/supabase';

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────
export interface RazorpayOrder {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: string;
  attempts: number;
  notes: {
    event_id: string;
    user_id: string;
    quantity: number;
  };
  created_at: number;
}

export interface RazorpayPaymentResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface PaymentVerificationRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  event_id: string;
  user_id: string;
  quantity: number;
}

// ──────────────────────────────────────────────
// Load Razorpay Script
// ──────────────────────────────────────────────
export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

// ──────────────────────────────────────────────
// Create Razorpay Order (Backend)
// ──────────────────────────────────────────────
export const createRazorpayOrder = async (
  eventId: string,
  userId: string,
  quantity: number,
  amount: number // in paise (e.g., 9900 = ₹99.00)
): Promise<RazorpayOrder> => {
  try {
    // Call backend Edge Function to create order
    const { data, error } = await supabase.functions.invoke('create-razorpay-order', {
      body: {
        event_id: eventId,
        user_id: userId,
        quantity,
        amount, // already in paise
      },
    });

    if (error) throw error;
    return data as RazorpayOrder;
  } catch (err) {
    console.error('Failed to create Razorpay order:', err);
    throw err;
  }
};

// ──────────────────────────────────────────────
// Open Razorpay Payment Modal
// ──────────────────────────────────────────────
export const openRazorpayPayment = async (
  order: RazorpayOrder,
  userEmail: string,
  userPhone: string,
  onSuccess: (response: RazorpayPaymentResponse) => void,
  onError: (error: string) => void
): Promise<void> => {
  // Ensure Razorpay script is loaded
  const isLoaded = await loadRazorpayScript();
  if (!isLoaded) {
    throw new Error('Failed to load Razorpay script');
  }

  // Declare Razorpay type
  declare global {
    interface Window {
      Razorpay: any;
    }
  }

  const options = {
    key: import.meta.env.VITE_RAZORPAY_KEY_ID,
    order_id: order.id,
    amount: order.amount,
    currency: order.currency,
    name: 'Happenin',
    description: `Ticket Purchase (${order.notes.quantity} ticket${order.notes.quantity > 1 ? 's' : ''})`,
    image: '/logo.png', // Optional: your app logo
    prefill: {
      email: userEmail,
      contact: userPhone,
    },
    handler: function (response: RazorpayPaymentResponse) {
      onSuccess(response);
    },
    modal: {
      ondismiss: function () {
        onError('Payment cancelled by user');
      },
    },
    timeout: 900, // 15 minutes
    notes: {
      event_id: order.notes.event_id,
      user_id: order.notes.user_id,
      quantity: order.notes.quantity.toString(),
    },
  };

  try {
    const razorpay = new window.Razorpay(options);
    razorpay.open();
  } catch (error) {
    onError(error instanceof Error ? error.message : 'Failed to open payment modal');
  }
};

// ──────────────────────────────────────────────
// Verify Payment (Backend verifies signature)
// ──────────────────────────────────────────────
export const verifyPayment = async (
  paymentVerification: PaymentVerificationRequest
): Promise<{ success: boolean; tickets: any[] }> => {
  try {
    const { data, error } = await supabase.functions.invoke('verify-razorpay-payment', {
      body: paymentVerification,
    });

    if (error) throw error;

    return data;
  } catch (err) {
    console.error('Payment verification failed:', err);
    throw err;
  }
};

// ──────────────────────────────────────────────
// Format Amount to Paise (for Razorpay)
// ──────────────────────────────────────────────
export const formatAmountToPaise = (amountInRupees: number): number => {
  return Math.round(amountInRupees * 100);
};

// ──────────────────────────────────────────────
// Format Paise to Rupees (for display)
// ──────────────────────────────────────────────
export const formatPaiseToRupees = (paise: number): number => {
  return Math.round(paise / 100 * 100) / 100;
};
