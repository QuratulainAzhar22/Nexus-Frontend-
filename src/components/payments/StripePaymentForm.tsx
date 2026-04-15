import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '../ui/Button';
import { paymentService } from '../../services/paymentService';
import toast from 'react-hot-toast';

let stripePromise: any;

const getStripe = async () => {
  const config = await paymentService.getConfig();
  if (!stripePromise) {
    stripePromise = loadStripe(config.publishableKey);
  }
  return stripePromise;
};

interface CardInputProps {
  amount: number;
  onSuccess: () => void;
  onClose: () => void;
}

const CardInput = ({ amount, onSuccess, onClose }: CardInputProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      toast.error('Payment system not ready');
      return;
    }

    setLoading(true);

    try {
      // Create Payment Intent
      const intentData = await paymentService.createPaymentIntent(amount);
      
      if (!intentData.clientSecret) {
        throw new Error('Failed to create payment intent');
      }

      // Confirm Payment with card details
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      const { error, paymentIntent } = await stripe.confirmCardPayment(
        intentData.clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: 'Customer',
            }
          }
        }
      );

      if (error) {
        toast.error(error.message || 'Payment failed');
      } else if (paymentIntent?.status === 'succeeded') {
        // Confirm deposit with backend
        await paymentService.confirmDeposit(paymentIntent.id);
        toast.success(`$${amount} deposited successfully!`);
        onSuccess();
        onClose();
      } else {
        toast.error(`Payment status: ${paymentIntent?.status}`);
      }
    } catch (err: any) {
      console.error('Payment error:', err);
      toast.error(err.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Card Details
        </label>
        <div className="border rounded-lg p-3 bg-white">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4'
                  }
                },
                invalid: {
                  color: '#9e2146'
                }
              }
            }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Test card: 4242 4242 4242 4242 | Exp: 12/26 | CVC: 123
        </p>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" type="button" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={!stripe || loading}>
          {loading ? 'Processing...' : `Pay $${amount}`}
        </Button>
      </div>
    </form>
  );
};

interface StripePaymentFormProps {
  amount: number;
  onSuccess: () => void;
  onClose: () => void;
}

export const StripePaymentForm = ({ amount, onSuccess, onClose }: StripePaymentFormProps) => {
  const [stripePromiseState, setStripePromiseState] = useState<any>(null);

  useEffect(() => {
    getStripe().then(setStripePromiseState);
  }, []);

  if (!stripePromiseState) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
        <p className="text-gray-500 mt-2">Loading payment system...</p>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromiseState}>
      <CardInput amount={amount} onSuccess={onSuccess} onClose={onClose} />
    </Elements>
  );
};