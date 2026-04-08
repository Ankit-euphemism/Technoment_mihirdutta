import React, { useState } from 'react';
import {
  createRazorpayOrder,
  openRazorpayPayment,
  verifyPayment,
  formatAmountToPaise,
} from '../../services/razorpayService';
import type { Event } from '../../types';

interface TicketPurchaseProps {
  event: Event;
  userId: string;
  userEmail?: string;
  userPhone?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

/**
 * TICKET PURCHASE COMPONENT WITH RAZORPAY
 * 
 * Payment Flow:
 * 1️⃣ User selects quantity
 * 2️⃣ Clicks "Buy Now" → Creates order on backend
 * 3️⃣ Razorpay modal opens
 * 4️⃣ User pays
 * 5️⃣ Backend verifies signature
 * 6️⃣ Tickets created & QR codes sent to email
 * 
 * ⚠️ SECURITY:
 * ✅ Payment verified on backend (signature check)
 * ✅ Duplicate payment detection
 * ✅ QR codes time-bound & signed (JWT)
 */
const TicketPurchase: React.FC<TicketPurchaseProps> = ({
  event,
  userId,
  userEmail = 'user@example.com',
  userPhone = '9999999999',
  onSuccess,
  onError,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [verifying, setVerifying] = useState(false);

  const pricePerTicket = 99; // ₹99.00
  const totalPrice = quantity * pricePerTicket;
  const totalPaise = formatAmountToPaise(totalPrice);

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // Step 1: Create Razorpay order on backend
      const order = await createRazorpayOrder(
        event.id,
        userId,
        quantity,
        totalPaise
      );

      // Step 2: Open Razorpay payment modal
      await openRazorpayPayment(
        order,
        userEmail,
        userPhone,
        async (paymentResponse) => {
          // Step 3: Payment successful - verify on backend
          await handlePaymentSuccess(paymentResponse, order);
        },
        (error) => {
          setMessage({ type: 'error', text: error });
          setLoading(false);
        }
      );
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to initiate payment. Please try again.';
      setMessage({ type: 'error', text: errorMsg });
      onError?.(errorMsg);
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (paymentResponse: any, order: any) => {
    setVerifying(true);
    try {
      // Verify payment signature on backend
      const result = await verifyPayment({
        razorpay_order_id: paymentResponse.razorpay_order_id,
        razorpay_payment_id: paymentResponse.razorpay_payment_id,
        razorpay_signature: paymentResponse.razorpay_signature,
        event_id: event.id,
        user_id: userId,
        quantity,
      });

      if (result.success) {
        setMessage({
          type: 'success',
          text: `✅ Payment successful! ${quantity} ticket${quantity > 1 ? 's' : ''} purchased. Check your email for QR codes.`,
        });
        setQuantity(1);
        onSuccess?.();
      } else {
        throw new Error('Payment verification failed');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Payment verification failed. Please contact support.';
      setMessage({ type: 'error', text: errorMsg });
      onError?.(errorMsg);
    } finally {
      setLoading(false);
      setVerifying(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900">{event.title}</h3>
        <p className="text-sm text-gray-600 mt-1">{event.location}</p>
        <p className="text-sm text-gray-500 mt-2">Capacity: {event.max_capacity} attendees</p>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`p-3 rounded-lg mb-4 text-sm font-medium ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handlePurchase} className="space-y-4">
        {/* Quantity Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Number of Tickets
          </label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1 || loading || verifying}
              className="px-3 py-2 bg-gray-200 text-gray-900 rounded font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
            >
              −
            </button>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              min="1"
              max="10"
              className="w-16 px-3 py-2 border border-gray-300 rounded text-center font-semibold"
              disabled={loading || verifying}
            />
            <button
              type="button"
              onClick={() => setQuantity(Math.min(10, quantity + 1))}
              disabled={quantity >= 10 || loading || verifying}
              className="px-3 py-2 bg-gray-200 text-gray-900 rounded font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
            >
              +
            </button>
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Price per ticket:</span>
            <span className="font-medium text-gray-900">₹{(pricePerTicket).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Quantity:</span>
            <span className="font-medium text-gray-900">{quantity}</span>
          </div>
          <div className="border-t border-gray-200 pt-2 flex justify-between">
            <span className="font-semibold text-gray-900">Total:</span>
            <span className="text-lg font-bold text-blue-600">₹{(totalPrice).toFixed(2)}</span>
          </div>
        </div>

        {/* Payment Method Info */}
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 text-sm">
          <p className="flex items-start gap-2 text-blue-800">
            <span>💳</span>
            <span>
              <strong>Secure Payment via Razorpay:</strong> Credit Card, Debit Card, Net Banking, UPI, Wallets
            </span>
          </p>
        </div>

        {/* Security Notes */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>✅ QR codes sent to your email instantly</p>
          <p>🔐 Codes are unique, signed, and expire at event end</p>
          <p>🛡️ Payment processed securely by Razorpay (PCI-DSS compliant)</p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || verifying}
          className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>🔄 Creating Order...</>
          ) : verifying ? (
            <>✓ Verifying Payment...</>
          ) : (
            <>💳 Pay ₹{(totalPrice).toFixed(2)}</>
          )}
        </button>
      </form>

      {/* Footer Note */}
      <p className="text-xs text-gray-400 text-center mt-4">
        Powered by Razorpay · Your payment information is secure
      </p>
    </div>
  );
};

export default TicketPurchase;
