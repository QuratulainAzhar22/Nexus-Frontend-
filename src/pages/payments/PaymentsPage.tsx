import React, { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownLeft, Wallet, History, CreditCard } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../context/AuthContext';
import { paymentService, Transaction } from '../../services/paymentService';
import { userService } from '../../services/userService';
import { User } from '../../services/authService';
import { StripePaymentForm } from '../../components/payments/StripePaymentForm';
import toast from 'react-hot-toast';

export const PaymentsPage: React.FC = () => {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const [balanceData, transactionsData, usersData] = await Promise.all([
        paymentService.getBalance(),
        paymentService.getTransactionHistory(),
        user.role === 'investor' ? userService.getAllEntrepreneurs() : userService.getAllInvestors(),
      ]);
      setBalance(balanceData);
      setTransactions(transactionsData);
      setUsers(usersData);
    } catch (error: any) {
      console.error('Load data error:', error);
      toast.error(error.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async () => {
    const transferAmount = parseFloat(amount);
    if (isNaN(transferAmount) || transferAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (transferAmount > balance) {
      toast.error('Insufficient balance');
      return;
    }

    if (!selectedUser) {
      toast.error('Please select a user to transfer to');
      return;
    }

    setProcessing(true);
    try {
      await paymentService.transfer(selectedUser, transferAmount);
      toast.success(`$${transferAmount} transferred successfully`);
      setShowTransferModal(false);
      setAmount('');
      setSelectedUser('');
      loadData();
    } catch (error: any) {
      console.error('Transfer error:', error);
      toast.error(error.message || 'Transfer failed');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in px-4 sm:px-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Payments</h1>
        <p className="text-sm sm:text-base text-gray-600">Manage your funds and transactions</p>
      </div>

      {/* Balance Cards - responsive grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-r from-primary-500 to-primary-700 text-white">
          <CardBody className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-primary-100 text-xs sm:text-sm">Total Balance</p>
                <h2 className="text-2xl sm:text-3xl font-bold mt-1">${balance.toFixed(2)}</h2>
              </div>
              <div className="p-2 sm:p-3 bg-white/20 rounded-full">
                <Wallet size={20} className="sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4 sm:p-6 flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs sm:text-sm">Deposit Funds</p>
              <p className="text-xs text-gray-400 mt-1">Add money to your wallet</p>
            </div>
            <Button onClick={() => setShowDepositModal(true)} size="sm" className="sm:default">
              <CreditCard size={14} className="sm:mr-2" />
              <span className="hidden sm:inline">Deposit</span>
            </Button>
          </CardBody>
        </Card>

        {user?.role === 'investor' && (
          <Card>
            <CardBody className="p-4 sm:p-6 flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs sm:text-sm">Transfer to Entrepreneur</p>
                <p className="text-xs text-gray-400 mt-1">Send funds to startup</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowTransferModal(true)}>
                <ArrowUpRight size={14} className="sm:mr-2" />
                <span className="hidden sm:inline">Transfer</span>
              </Button>
            </CardBody>
          </Card>
        )}
      </div>

      {/* Transaction History - responsive table */}
      <Card>
        <CardHeader>
          <h2 className="text-base sm:text-lg font-medium text-gray-900">Transaction History</h2>
        </CardHeader>
        <CardBody>
          {transactions.length > 0 ? (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border-b border-gray-100 last:border-0 gap-2 sm:gap-0">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${tx.amount > 0 ? 'bg-green-100' : 'bg-red-100'} flex-shrink-0`}>
                      {tx.amount > 0 ? (
                        <ArrowDownLeft size={14} className="sm:w-4 sm:h-4 text-green-600" />
                      ) : (
                        <ArrowUpRight size={14} className="sm:w-4 sm:h-4 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm sm:text-base">
                        {tx.type === 'deposit' ? 'Deposit' : tx.type === 'transfer' ? 'Transfer' : 'Withdrawal'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className={`font-semibold text-sm sm:text-base pl-11 sm:pl-0 ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount > 0 ? `$${tx.amount.toFixed(2)}` : `-$${Math.abs(tx.amount).toFixed(2)}`}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <History size={28} className="sm:w-8 sm:h-8 mx-auto text-gray-400 mb-2" />
              <p className="text-sm sm:text-base text-gray-500">No transactions yet</p>
              <p className="text-xs sm:text-sm text-gray-400 mt-1">Deposit funds to get started</p>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Deposit Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-5 sm:p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Deposit Funds</h3>
            <Input
              label="Amount ($)"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              min="1"
              step="1"
            />
            {amount && parseFloat(amount) > 0 ? (
              <StripePaymentForm
                amount={parseFloat(amount)}
                onSuccess={() => {
                  setShowDepositModal(false);
                  setAmount('');
                  loadData();
                }}
                onClose={() => setShowDepositModal(false)}
              />
            ) : (
              <div className="text-center text-gray-400 py-4 text-sm">
                Enter an amount to proceed
              </div>
            )}
          </div>
        </div>
      )}

      {/* Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-5 sm:p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Transfer to Entrepreneur</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Entrepreneur</label>
              <select
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm"
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
              >
                <option value="">Select...</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>{u.name} - {u.startupName || 'Startup'}</option>
                ))}
              </select>
            </div>
            <Input
              label="Amount ($)"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
            />
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setShowTransferModal(false)}>Cancel</Button>
              <Button onClick={handleTransfer} isLoading={processing}>Transfer</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};