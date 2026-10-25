import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { paymentService } from '../../services/apiServices';
import { X, CreditCard, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

export const StripePaymentModal = ({ booking, court, venue, slot, onClose }) => {
  const navigate = useNavigate();

  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [cardholderName, setCardholderName] = useState('Rahul Sharma');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const isMock = !booking.stripePaymentIntentId || booking.stripePaymentIntentId.startsWith('pi_mock');

  const fillTestCard = () => {
    setCardNumber('4242 4242 4242 4242');
    setExpiry('12/28');
    setCvc('123');
    setCardholderName('Rahul Sharma');
  };

  const handlePay = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setError('');

    try {
      if (!isMock && booking.stripePublishableKey && !booking.stripePublishableKey.includes('mock')) {
        const stripe = await loadStripe(booking.stripePublishableKey);
        if (!stripe) {
          throw new Error('Failed to load Stripe SDK');
        }

        const { error: stripeError } = await stripe.confirmCardPayment(booking.stripeClientSecret, {
          payment_method: {
            card: {
              number: cardNumber.replace(/\s+/g, ''),
              exp_month: parseInt(expiry.split('/')[0], 10),
              exp_year: parseInt('20' + expiry.split('/')[1], 10),
              cvc: cvc,
            },
            billing_details: {
              name: cardholderName,
            },
          },
        });

        if (stripeError) {
          throw new Error(stripeError.message);
        }
      } else {
        await new Promise((res) => setTimeout(res, 1000));
      }

      // Confirm payment in backend
      const confirmRes = await paymentService.confirm(booking.bookingNumber);
      if (confirmRes.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate(`/booking/confirmation/${booking.id}`);
        }, 800);
      } else {
        throw new Error(confirmRes.message || 'Payment confirmation failed');
      }
    } catch (err) {
      setError(err.message || 'Payment failed. Please check your card details and try again.');
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/75 p-4 backdrop-blur-md" role="dialog" aria-modal="true" aria-label="Payment">
      <div className="glass-panel my-6 w-full max-w-md overflow-hidden text-white">
        
        {/* Header */}
        <div className="relative border-b border-white/[0.07] bg-white/[0.02] p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Checkout with Stripe
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-white/[0.06] hover:text-white"
            aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-3 flex items-baseline justify-between">
            <div>
              <h2 className="text-lg font-bold font-display text-white">{venue.name}</h2>
              <p className="text-xs text-slate-400 mt-0.5">{court.courtName} • {slot.startTime?.substring(0, 5)} - {slot.endTime?.substring(0, 5)}</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block font-medium">Total Due</span>
              <span className="text-xl font-bold font-display text-emerald-400">₹{booking.totalAmount || court.pricePerHour}</span>
            </div>
          </div>

          <div className="mt-2.5 flex items-center gap-2 text-[11px] text-slate-400">
            <span>Ref #{booking.bookingNumber}</span>
          </div>
        </div>

        {/* Body Form */}
        <form onSubmit={handlePay} className="p-5 space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Payment confirmed! Generating booking receipt...</span>
            </div>
          )}

          {/* Test Card Quick Fill Button */}
          <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] p-2.5 text-xs">
            <span className="text-slate-400">Testing payments?</span>
            <button
              type="button"
              onClick={fillTestCard}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5"
            >
              Auto-fill Test Card
            </button>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Cardholder Name
            </label>
            <input
              type="text"
              required
              value={cardholderName}
              onChange={(e) => setCardholderName(e.target.value)}
              placeholder="Full Name"
              className="neo-input w-full px-3.5 py-2.5 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Card Number
            </label>
            <div className="relative">
              <CreditCard className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                required
                maxLength="19"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                placeholder="4242 4242 4242 4242"
                className="neo-input w-full pl-10 pr-4 py-2.5 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Expiry Date
              </label>
              <input
                type="text"
                required
                maxLength="5"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                placeholder="MM/YY"
                className="neo-input w-full px-3.5 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                CVC / CVV
              </label>
              <input
                type="password"
                required
                maxLength="4"
                value={cvc}
                onChange={(e) => setCvc(e.target.value)}
                placeholder="•••"
                className="neo-input w-full px-3.5 py-2.5 text-sm"
              />
            </div>
          </div>

          {/* Pay Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={processing || success}
              className="btn-primary w-full py-3"
            >
              {processing ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-900/40 border-t-slate-900 rounded-full animate-spin"></div>
                  <span>Processing Payment...</span>
                </>
              ) : success ? (
                <span>Payment received — sending for venue approval…</span>
              ) : (
                <span>Pay ₹{booking.totalAmount || court.pricePerHour} with Stripe</span>
              )}
            </button>
          </div>

          <div className="rounded-xl border border-amber-400/20 bg-amber-400/[0.07] p-3 text-center text-xs text-slate-300">
            <strong>Venue confirmation:</strong> after payment, the venue reviews and confirms your booking. If the venue declines, a refund is initiated.
          </div>

        </form>
      </div>
    </div>
  );
};
