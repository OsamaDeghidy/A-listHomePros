import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FaCreditCard, FaPaypal, FaApplePay, FaGoogle, FaLock, FaHistory, FaMoneyBillWave } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import { paymentsService } from '../services/api';

const PaymentPage = () => {
  const { appointmentId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [appointmentDetails, setAppointmentDetails] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState('payment'); // 'payment' or 'history'
  
  // Form state
  const [cardholderName, setCardholderName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [saveCard, setSaveCard] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [processingPayment, setProcessingPayment] = useState(false);
  
  // Fetch appointment details and saved payment methods
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // In a real implementation, you would fetch appointment details from the API
        // Here we'll use mock data for demonstration
        if (appointmentId) {
          const mockAppointmentData = {
            id: appointmentId,
            service: 'Plumbing Repair',
            professional: {
              id: 'pro123',
              name: 'Ahmed Hassan',
              profession: 'Plumber',
              rating: 4.8,
              avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
            },
            date: '2023-08-15',
            time: '10:00 AM',
            duration: 2, // hours
            location: '123 Main St, Cairo',
            subtotal: 450,
            fees: 20,
            tax: 30,
            total: 500,
            currency: 'USD'
          };
          setAppointmentDetails(mockAppointmentData);
        }
        
        // Fetch saved payment methods
        try {
          const response = await paymentsService.getPaymentMethods();
          setPaymentMethods(response.data);
        } catch (err) {
          console.error('Error fetching payment methods:', err);
          // Mock data for development
          setPaymentMethods([
            {
              id: 'pm_1',
              type: 'card',
              card: {
                brand: 'visa',
                last4: '4242',
                exp_month: 12,
                exp_year: 2024
              },
              billing_details: {
                name: 'Mohamed Ahmed'
              },
              isDefault: true
            },
            {
              id: 'pm_2',
              type: 'card',
              card: {
                brand: 'mastercard',
                last4: '5678',
                exp_month: 10,
                exp_year: 2025
              },
              billing_details: {
                name: 'Mohamed Ahmed'
              },
              isDefault: false
            }
          ]);
        }
        
        // Fetch transaction history
        try {
          const transactionsResponse = await paymentsService.getTransactions();
          setTransactions(transactionsResponse.data);
        } catch (err) {
          console.error('Error fetching transactions:', err);
          // Mock data for development
          setTransactions([
            {
              id: 'tx_1',
              date: '2023-07-28',
              service: 'Electrical Repair',
              amount: 350,
              currency: 'EGP',
              status: 'completed',
              professional: {
                name: 'Omar Khaled',
                profession: 'Electrician'
              }
            },
            {
              id: 'tx_2',
              date: '2023-07-15',
              service: 'House Cleaning',
              amount: 200,
              currency: 'EGP',
              status: 'completed',
              professional: {
                name: 'Nora Hassan',
                profession: 'Cleaner'
              }
            },
            {
              id: 'tx_3',
              date: '2023-06-30',
              service: 'Furniture Assembly',
              amount: 500,
              currency: 'EGP',
              status: 'refunded',
              professional: {
                name: 'Ahmed Mahmoud',
                profession: 'Carpenter'
              }
            }
          ]);
        }
      } catch (err) {
        console.error('Error fetching payment data:', err);
        setError('Error loading payment information. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [appointmentId]);
  
  // Validate form
  const validateForm = () => {
    const errors = {};
    
    if (!cardholderName.trim()) {
      errors.cardholderName = 'Cardholder name is required';
    }
    
    if (!cardNumber.trim()) {
      errors.cardNumber = 'Card number is required';
    } else if (!/^\d{16}$/.test(cardNumber.replace(/\s/g, ''))) {
      errors.cardNumber = 'Invalid card number';
    }
    
    if (!expiryDate.trim()) {
      errors.expiryDate = 'Expiry date is required';
    } else if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
      errors.expiryDate = 'Invalid format (MM/YY)';
    }
    
    if (!cvv.trim()) {
      errors.cvv = 'CVV is required';
    } else if (!/^\d{3,4}$/.test(cvv)) {
      errors.cvv = 'Invalid CVV';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Format card number with spaces
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };
  
  // Handle card selection
  const handleSelectCard = (paymentMethodId) => {
    setSelectedMethod(paymentMethodId);
    // Clear form errors when switching to saved card
    setFormErrors({});
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (selectedMethod) {
      // Process payment with selected method
      await processPayment(selectedMethod);
    } else {
      // Validate and process with new card
      if (validateForm()) {
        setProcessingPayment(true);
        
        try {
          // In a real app, you would create a payment method and then charge it
          // For demo purposes, we'll simulate a payment success
          setTimeout(() => {
            // Navigate to confirmation page
            navigate(`/booking-confirmation`);
          }, 2000);
        } catch (err) {
          console.error('Payment error:', err);
          setError('Payment failed. Please try again or use a different payment method.');
          setProcessingPayment(false);
        }
      }
    }
  };
  
  // Process payment with existing method
  const processPayment = async (paymentMethodId) => {
    setProcessingPayment(true);
    
    try {
      // In a real app, you would call your API to process the payment
      // const response = await paymentsService.createPaymentIntent({
      //   appointment_id: appointmentId,
      //   payment_method: paymentMethodId,
      //   amount: appointmentDetails.total,
      //   currency: appointmentDetails.currency.toLowerCase()
      // });
      
      // Simulate API call
      setTimeout(() => {
        // Navigate to confirmation page
        navigate(`/booking-confirmation`);
      }, 2000);
    } catch (err) {
      console.error('Payment error:', err);
      setError('Payment failed. Please try again or use a different payment method.');
      setProcessingPayment(false);
    }
  };
  
  // Format currency
  const formatCurrency = (amount, currency = 'EGP') => {
    return `${amount} ${currency}`;
  };
  
  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Render payment method card
  const renderPaymentMethod = (method) => (
    <div 
      key={method.id}
      className={`border rounded-lg p-4 mb-3 cursor-pointer transition-colors ${
        selectedMethod === method.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
      }`}
      onClick={() => handleSelectCard(method.id)}
    >
      <div className="flex items-center">
        <div className="mr-3">
          {method.card.brand === 'visa' ? (
            <FaCreditCard className="text-blue-700 text-2xl" />
          ) : method.card.brand === 'mastercard' ? (
            <FaCreditCard className="text-red-600 text-2xl" />
          ) : (
            <FaCreditCard className="text-gray-600 text-2xl" />
          )}
        </div>
        <div className="flex-1">
          <p className="font-medium">
            {method.card.brand.charAt(0).toUpperCase() + method.card.brand.slice(1)} •••• {method.card.last4}
          </p>
          <p className="text-sm text-gray-600">
            Expires {method.card.exp_month}/{method.card.exp_year.toString().slice(-2)}
          </p>
        </div>
        {method.isDefault && (
          <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
            Default
          </div>
        )}
      </div>
    </div>
  );
  
  return (
    <>
      <Helmet>
        <title>Payment | A-List Home Pros</title>
        <meta name="description" content="Secure payment processing for your home service booking." />
      </Helmet>
      
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <h1 className="text-3xl font-bold mb-8 text-center">Payment</h1>
        
        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="grid grid-cols-2 gap-1 bg-gray-100 p-1 rounded-lg">
            <button
              className={`px-6 py-2 rounded-md text-sm font-medium ${
                activeTab === 'payment' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setActiveTab('payment')}
            >
              Make Payment
            </button>
            <button
              className={`px-6 py-2 rounded-md text-sm font-medium ${
                activeTab === 'history' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setActiveTab('history')}
            >
              Payment History
            </button>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center my-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 text-red-700 p-4 rounded-md mb-6">
            {error}
          </div>
        ) : (
          <>
            {activeTab === 'payment' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Payment Form Section */}
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-6">Payment Method</h2>
                    
                    {/* Payment Method Tabs */}
                    <div className="grid grid-cols-4 gap-2 mb-6">
                      <button 
                        className="flex flex-col items-center justify-center p-3 bg-blue-50 rounded-md border border-blue-200 text-blue-700"
                      >
                        <FaCreditCard className="text-xl mb-1" />
                        <span className="text-xs">Card</span>
                      </button>
                      <button 
                        className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-md border border-gray-200 text-gray-500"
                        disabled
                      >
                        <FaPaypal className="text-xl mb-1" />
                        <span className="text-xs">PayPal</span>
                      </button>
                      <button 
                        className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-md border border-gray-200 text-gray-500"
                        disabled
                      >
                        <FaApplePay className="text-xl mb-1" />
                        <span className="text-xs">Apple Pay</span>
                      </button>
                      <button 
                        className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-md border border-gray-200 text-gray-500" 
                        disabled
                      >
                        <FaGoogle className="text-xl mb-1" />
                        <span className="text-xs">Google Pay</span>
                      </button>
                    </div>
                    
                    {/* Saved Cards */}
                    {paymentMethods.length > 0 && (
                      <div className="mb-6">
                        <h3 className="text-md font-medium mb-3">Saved Cards</h3>
                        <div>
                          {paymentMethods.map(method => renderPaymentMethod(method))}
                          <button 
                            className="text-blue-600 text-sm hover:underline flex items-center mt-1"
                            onClick={() => setSelectedMethod(null)}
                          >
                            + Add a new card
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {/* New Card Form */}
                    {(!paymentMethods.length || selectedMethod === null) && (
                      <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                          <label htmlFor="cardholderName" className="block text-sm font-medium text-gray-700 mb-1">
                            Cardholder Name
                          </label>
                          <input
                            type="text"
                            id="cardholderName"
                            className={`w-full p-3 border rounded-md ${formErrors.cardholderName ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="Full name on card"
                            value={cardholderName}
                            onChange={(e) => setCardholderName(e.target.value)}
                          />
                          {formErrors.cardholderName && (
                            <p className="text-red-500 text-xs mt-1">{formErrors.cardholderName}</p>
                          )}
                        </div>
                        
                        <div className="mb-4">
                          <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
                            Card Number
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              id="cardNumber"
                              className={`w-full p-3 border rounded-md ${formErrors.cardNumber ? 'border-red-500' : 'border-gray-300'}`}
                              placeholder="1234 5678 9012 3456"
                              value={cardNumber}
                              onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                              maxLength={19}
                            />
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                              <FaCreditCard className="text-gray-400" />
                            </div>
                          </div>
                          {formErrors.cardNumber && (
                            <p className="text-red-500 text-xs mt-1">{formErrors.cardNumber}</p>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">
                              Expiry Date
                            </label>
                            <input
                              type="text"
                              id="expiryDate"
                              className={`w-full p-3 border rounded-md ${formErrors.expiryDate ? 'border-red-500' : 'border-gray-300'}`}
                              placeholder="MM/YY"
                              value={expiryDate}
                              onChange={(e) => setExpiryDate(e.target.value)}
                              maxLength={5}
                            />
                            {formErrors.expiryDate && (
                              <p className="text-red-500 text-xs mt-1">{formErrors.expiryDate}</p>
                            )}
                          </div>
                          
                          <div>
                            <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">
                              CVV
                            </label>
                            <input
                              type="text"
                              id="cvv"
                              className={`w-full p-3 border rounded-md ${formErrors.cvv ? 'border-red-500' : 'border-gray-300'}`}
                              placeholder="123"
                              value={cvv}
                              onChange={(e) => setCvv(e.target.value)}
                              maxLength={4}
                            />
                            {formErrors.cvv && (
                              <p className="text-red-500 text-xs mt-1">{formErrors.cvv}</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="mb-6">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              className="w-4 h-4 text-blue-600 rounded"
                              checked={saveCard}
                              onChange={(e) => setSaveCard(e.target.checked)}
                            />
                            <span className="ml-2 text-sm text-gray-600">Save card for future payments</span>
                          </label>
                        </div>
                      </form>
                    )}
                    
                    <div className="border-t border-gray-200 pt-4 mt-6">
                      <div className="flex items-center text-gray-600 text-sm mb-6">
                        <FaLock className="mr-2 text-green-600" />
                        <span>Your payment information is secure and encrypted</span>
                      </div>
                      
                      <button
                        className={`w-full py-3 px-4 rounded-md font-medium text-white ${
                          processingPayment 
                            ? 'bg-blue-400 cursor-not-allowed' 
                            : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                        onClick={handleSubmit}
                        disabled={processingPayment}
                      >
                        {processingPayment ? (
                          <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                          </span>
                        ) : (
                          `Pay ${appointmentDetails ? formatCurrency(appointmentDetails.total, appointmentDetails.currency) : ''}`
                        )}
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Order Summary Section */}
                <div className="lg:col-span-1">
                  {appointmentDetails && (
                    <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
                      <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                      
                      <div className="border-b border-gray-200 pb-4 mb-4">
                        <div className="flex items-start">
                          <img 
                            src={appointmentDetails.professional.avatar} 
                            alt={appointmentDetails.professional.name}
                            className="w-12 h-12 rounded-full object-cover mr-3"
                          />
                          <div>
                            <h3 className="font-medium">{appointmentDetails.service}</h3>
                            <p className="text-sm text-gray-600">{appointmentDetails.professional.name}</p>
                            <div className="flex items-center mt-1 text-sm text-gray-500">
                              <span className="mr-2">{appointmentDetails.date}</span>
                              <span>{appointmentDetails.time}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Subtotal</span>
                          <span>{formatCurrency(appointmentDetails.subtotal, appointmentDetails.currency)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Service Fee</span>
                          <span>{formatCurrency(appointmentDetails.fees, appointmentDetails.currency)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tax</span>
                          <span>{formatCurrency(appointmentDetails.tax, appointmentDetails.currency)}</span>
                        </div>
                      </div>
                      
                      <div className="border-t border-gray-200 pt-4 mt-4">
                        <div className="flex justify-between font-bold">
                          <span>Total</span>
                          <span>{formatCurrency(appointmentDetails.total, appointmentDetails.currency)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {activeTab === 'history' && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Payment History</h2>
                  
                  <div className="flex">
                    <div className="relative">
                      <select 
                        className="appearance-none pl-3 pr-8 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="all">All Transactions</option>
                        <option value="completed">Completed</option>
                        <option value="pending">Pending</option>
                        <option value="refunded">Refunded</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
                
                {transactions.length === 0 ? (
                  <div className="text-center py-12">
                    <FaHistory className="mx-auto text-gray-300 text-5xl mb-4" />
                    <h3 className="text-lg font-medium text-gray-700 mb-2">No transactions yet</h3>
                    <p className="text-gray-500 mb-6">Your payment history will appear here once you make your first payment</p>
                    <Link to="/search" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
                      Browse Services
                    </Link>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-gray-500 text-sm border-b">
                          <th className="pb-3 font-medium">Date</th>
                          <th className="pb-3 font-medium">Service</th>
                          <th className="pb-3 font-medium">Professional</th>
                          <th className="pb-3 font-medium">Amount</th>
                          <th className="pb-3 font-medium">Status</th>
                          <th className="pb-3 font-medium">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {transactions.map(transaction => (
                          <tr key={transaction.id} className="hover:bg-gray-50">
                            <td className="py-3 text-sm">{transaction.date}</td>
                            <td className="py-3">{transaction.service}</td>
                            <td className="py-3 text-sm">
                              {transaction.professional.name}
                              <div className="text-xs text-gray-500">{transaction.professional.profession}</div>
                            </td>
                            <td className="py-3 font-medium">{formatCurrency(transaction.amount, transaction.currency)}</td>
                            <td className="py-3">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                                {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                              </span>
                            </td>
                            <td className="py-3">
                              <Link to={`/receipt/${transaction.id}`} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                Receipt
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default PaymentPage;
