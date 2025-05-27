import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { FaSearch, FaFileDownload, FaFilter, FaCreditCard, FaCheck, FaTimes, FaClock } from 'react-icons/fa';

const PaymentHistoryPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    // In a real app, fetch transactions from API
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        // Simulating API call with timeout
        setTimeout(() => {
          const dummyTransactions = [
            {
              id: 'TRX-87652',
              date: '2023-10-15T10:30:00',
              type: 'payment',
              description: 'Plumbing Service - John Smith',
              amount: 125.00,
              status: 'completed',
              paymentMethod: 'Credit Card (**** 4832)',
              recipient: 'John Smith',
              serviceDate: '2023-10-14',
              receiptUrl: '#',
              bookingId: 'BKG-12345'
            },
            {
              id: 'TRX-87530',
              date: '2023-10-05T14:45:00',
              type: 'payment',
              description: 'Electrical Repairs - Emily Johnson',
              amount: 210.50,
              status: 'completed',
              paymentMethod: 'Credit Card (**** 4832)',
              recipient: 'Emily Johnson',
              serviceDate: '2023-10-05',
              receiptUrl: '#',
              bookingId: 'BKG-12320'
            },
            {
              id: 'TRX-87421',
              date: '2023-09-28T09:15:00',
              type: 'refund',
              description: 'Refund: Canceled Cleaning Service',
              amount: 95.00,
              status: 'completed',
              paymentMethod: 'Credit Card (**** 4832)',
              recipient: 'Your Account',
              serviceDate: '2023-09-30',
              receiptUrl: '#',
              bookingId: 'BKG-12290'
            },
            {
              id: 'TRX-87390',
              date: '2023-09-20T16:20:00',
              type: 'payment',
              description: 'HVAC Maintenance - Michael Brown',
              amount: 180.00,
              status: 'pending',
              paymentMethod: 'Bank Transfer',
              recipient: 'Michael Brown',
              serviceDate: '2023-09-22',
              receiptUrl: '#',
              bookingId: 'BKG-12275'
            },
            {
              id: 'TRX-87254',
              date: '2023-09-10T11:10:00',
              type: 'payment',
              description: 'Lawn Care Service - Green Lawns Inc.',
              amount: 75.00,
              status: 'failed',
              paymentMethod: 'Credit Card (**** 4832)',
              recipient: 'Green Lawns Inc.',
              serviceDate: '2023-09-11',
              receiptUrl: '#',
              bookingId: 'BKG-12230'
            },
            {
              id: 'TRX-87142',
              date: '2023-08-25T13:40:00',
              type: 'payment',
              description: 'Painting Service - Color Masters',
              amount: 350.00,
              status: 'completed',
              paymentMethod: 'Credit Card (**** 4832)',
              recipient: 'Color Masters',
              serviceDate: '2023-08-28',
              receiptUrl: '#',
              bookingId: 'BKG-12195'
            },
            {
              id: 'TRX-87098',
              date: '2023-08-15T09:30:00',
              type: 'payment',
              description: 'Flooring Installation - Floor Experts',
              amount: 520.00,
              status: 'completed',
              paymentMethod: 'Bank Transfer',
              recipient: 'Floor Experts',
              serviceDate: '2023-08-20',
              receiptUrl: '#',
              bookingId: 'BKG-12150'
            },
            {
              id: 'TRX-86987',
              date: '2023-08-05T15:15:00',
              type: 'refund',
              description: 'Refund: Service Rescheduled',
              amount: 45.00,
              status: 'completed',
              paymentMethod: 'Credit Card (**** 4832)',
              recipient: 'Your Account',
              serviceDate: '2023-08-06',
              receiptUrl: '#',
              bookingId: 'BKG-12120'
            }
          ];
          
          setTransactions(dummyTransactions);
          setFilteredTransactions(dummyTransactions);
          setLoading(false);
        }, 1000);
      } catch (err) {
        setError('Failed to load transaction history');
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  // Filter transactions based on search term and filters
  useEffect(() => {
    let results = transactions;
    
    // Apply status filter
    if (statusFilter !== 'all') {
      results = results.filter(trx => trx.status === statusFilter);
    }
    
    // Apply type filter
    if (typeFilter !== 'all') {
      results = results.filter(trx => trx.type === typeFilter);
    }
    
    // Apply date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
      const ninetyDaysAgo = new Date(now.setDate(now.getDate() - 90));
      
      if (dateFilter === 'last30days') {
        results = results.filter(trx => new Date(trx.date) >= thirtyDaysAgo);
      } else if (dateFilter === 'last90days') {
        results = results.filter(trx => new Date(trx.date) >= ninetyDaysAgo);
      }
    }
    
    // Apply search term
    if (searchTerm) {
      results = results.filter(trx => 
        trx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trx.recipient.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredTransactions(results);
  }, [searchTerm, statusFilter, typeFilter, dateFilter, transactions]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
  };

  const handleTypeFilterChange = (type) => {
    setTypeFilter(type);
  };

  const handleDateFilterChange = (date) => {
    setDateFilter(date);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setTypeFilter('all');
    setDateFilter('all');
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <FaCheck className="mr-1" size={10} />
            Completed
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <FaClock className="mr-1" size={10} />
            Pending
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <FaTimes className="mr-1" size={10} />
            Failed
          </span>
        );
      default:
        return null;
    }
  };

  const getTransactionTypeIndicator = (type, amount) => {
    if (type === 'payment') {
      return <span className="text-red-600">-{formatCurrency(amount)}</span>;
    } else if (type === 'refund') {
      return <span className="text-green-600">+{formatCurrency(amount)}</span>;
    }
    return formatCurrency(amount);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
        <Link to="/" className="mt-4 text-blue-600 hover:underline">Return to Home</Link>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Payment History | A-List Home Pros</title>
        <meta name="description" content="View and manage your payment history, transactions, and receipts." />
      </Helmet>

      <div className="bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Payment History</h1>
            <p className="text-gray-600">View and manage your past transactions and payment receipts</p>
          </div>
          
          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <div className="relative w-full md:w-1/2">
                <input
                  type="text"
                  placeholder="Search transactions..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <FaFilter size={14} />
                  <span>Filters</span>
                </button>
                
                <button 
                  className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <FaFileDownload size={14} />
                  <span>Export</span>
                </button>
              </div>
            </div>
            
            {showFilters && (
              <div className="pt-4 border-t border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => handleStatusFilterChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">All Statuses</option>
                      <option value="completed">Completed</option>
                      <option value="pending">Pending</option>
                      <option value="failed">Failed</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select
                      value={typeFilter}
                      onChange={(e) => handleTypeFilterChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">All Types</option>
                      <option value="payment">Payments</option>
                      <option value="refund">Refunds</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                    <select
                      value={dateFilter}
                      onChange={(e) => handleDateFilterChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">All Time</option>
                      <option value="last30days">Last 30 Days</option>
                      <option value="last90days">Last 90 Days</option>
                    </select>
                  </div>
                </div>
                
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={resetFilters}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Transactions List */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {filteredTransactions.length === 0 ? (
              <div className="p-8 text-center">
                <FaCreditCard className="mx-auto text-gray-300 mb-4" size={48} />
                <h3 className="text-lg font-medium text-gray-700 mb-2">No transactions found</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' || dateFilter !== 'all'
                    ? "Try adjusting your filters to see more results"
                    : "You haven't made any payments yet"}
                </p>
                {(searchTerm || statusFilter !== 'all' || typeFilter !== 'all' || dateFilter !== 'all') && (
                  <button
                    onClick={resetFilters}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Transaction ID
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment Method
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredTransactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {transaction.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(transaction.date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {transaction.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {getTransactionTypeIndicator(transaction.type, transaction.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(transaction.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {transaction.paymentMethod}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          <div className="flex space-x-2 justify-end">
                            <Link
                              to={`/booking/${transaction.bookingId}`}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              View
                            </Link>
                            {transaction.status === 'completed' && (
                              <a
                                href={transaction.receiptUrl}
                                className="text-gray-600 hover:text-gray-800"
                              >
                                Receipt
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
          {/* Payment Methods Section */}
          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Payment Methods</h2>
              <Link
                to="/dashboard/settings"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Manage Payment Methods
              </Link>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-blue-50 p-3 rounded-lg mr-4">
                      <FaCreditCard className="text-blue-600" size={24} />
                    </div>
                    <div>
                      <h3 className="text-base font-medium text-gray-900">Visa ending in 4832</h3>
                      <p className="text-sm text-gray-500">Expires 05/25</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                    Default
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-gray-50 p-3 rounded-lg mr-4">
                      <svg className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-base font-medium text-gray-900">Bank Account</h3>
                      <p className="text-sm text-gray-500">Bank of America ****6789</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentHistoryPage; 