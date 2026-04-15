import React, { useState, useEffect } from 'react';
import { Search, Filter, DollarSign, TrendingUp, Users, Calendar, Eye } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { useAuth } from '../../context/AuthContext';
import { collaborationService, CollaborationRequest } from '../../services/collaborationService';
import toast from 'react-hot-toast';

interface Deal {
  id: number;
  startupName: string;
  startupId: string;
  logo: string;
  industry: string;
  amount: string;
  equity: string;
  status: string;
  stage: string;
  lastActivity: Date;
}

export const DealsPage: React.FC = () => {
  const { user } = useAuth();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  
  const statuses = ['Pending', 'Accepted', 'Due Diligence', 'Term Sheet', 'Negotiation', 'Closed', 'Passed'];
  
  useEffect(() => {
    if (user?.role === 'investor') {
      loadDeals();
    }
  }, [user]);
  
  const loadDeals = async () => {
    try {
      setLoading(true);
      const acceptedRequests = await collaborationService.getRequestsFromInvestor();
      const accepted = acceptedRequests.filter(req => req.status === 'accepted');
      
      const dealsList: Deal[] = [];
      
      for (const req of accepted) {
        const entrepreneur = req.entrepreneur;
        if (entrepreneur) {
          dealsList.push({
            id: parseInt(req.id),
            startupName: entrepreneur.startupName || entrepreneur.name,
            startupId: entrepreneur.id,
            logo: entrepreneur.avatarUrl,
            industry: entrepreneur.industry || 'Technology',
            amount: entrepreneur.fundingNeeded || '$500K',
            equity: '10-15%',
            status: 'Negotiation',
            stage: entrepreneur.fundingNeeded?.includes('M') ? 'Series A' : 'Seed',
            lastActivity: new Date(req.createdAt),
          });
        }
      }
      
      setDeals(dealsList);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load deals');
    } finally {
      setLoading(false);
    }
  };
  
  const toggleStatus = (status: string) => {
    setSelectedStatus(prev => 
      prev.includes(status)
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };
  
  const getStatusColor = (status: string): any => {
    const statusMap: Record<string, any> = {
      'Pending': 'warning',
      'Accepted': 'success',
      'Due Diligence': 'primary',
      'Term Sheet': 'secondary',
      'Negotiation': 'accent',
      'Closed': 'success',
      'Passed': 'error',
    };
    return statusMap[status] || 'gray';
  };
  
  const filteredDeals = deals.filter(deal => {
    const matchesSearch = searchQuery === '' || 
      deal.startupName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deal.industry.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = selectedStatus.length === 0 || selectedStatus.includes(deal.status);
    
    return matchesSearch && matchesStatus;
  });
  
  const totalInvestment = deals.reduce((sum, deal) => {
    const amount = parseInt(deal.amount.replace(/[^0-9]/g, '')) || 0;
    return sum + amount;
  }, 0);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  if (user?.role !== 'investor') {
    return (
      <div className="text-center py-12 px-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Access Restricted</h2>
        <p className="text-sm sm:text-base text-gray-600 mt-2">Only investors can view deals.</p>
        <Button variant="outline" className="mt-4" onClick={() => window.location.href = '/'}>
          Go to Dashboard
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6 animate-fade-in px-4 sm:px-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Investment Deals</h1>
          <p className="text-sm sm:text-base text-gray-600">Track and manage your investment pipeline</p>
        </div>
      </div>
      
      {/* Stats - responsive grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardBody className="p-3 sm:p-4">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-primary-100 rounded-lg mr-2 sm:mr-3">
                <DollarSign size={16} className="sm:w-5 sm:h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Total Investment</p>
                <p className="text-sm sm:text-lg font-semibold text-gray-900">${(totalInvestment / 1000).toFixed(1)}K</p>
              </div>
            </div>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody className="p-3 sm:p-4">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-secondary-100 rounded-lg mr-2 sm:mr-3">
                <TrendingUp size={16} className="sm:w-5 sm:h-5 text-secondary-600" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Active Deals</p>
                <p className="text-sm sm:text-lg font-semibold text-gray-900">{deals.length}</p>
              </div>
            </div>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody className="p-3 sm:p-4">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-accent-100 rounded-lg mr-2 sm:mr-3">
                <Users size={16} className="sm:w-5 sm:h-5 text-accent-600" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Connections</p>
                <p className="text-sm sm:text-lg font-semibold text-gray-900">{deals.length}</p>
              </div>
            </div>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody className="p-3 sm:p-4">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-success-100 rounded-lg mr-2 sm:mr-3">
                <Calendar size={16} className="sm:w-5 sm:h-5 text-success-600" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Active Discussions</p>
                <p className="text-sm sm:text-lg font-semibold text-gray-900">{deals.filter(d => d.status === 'Negotiation').length}</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
      
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search deals by startup name or industry..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            startAdornment={<Search size={18} />}
            fullWidth
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <Filter size={18} className="text-gray-500 hidden sm:block" />
          <div className="flex flex-wrap gap-2">
            {statuses.slice(0, 5).map(status => (
              <Badge
                key={status}
                variant={selectedStatus.includes(status) ? getStatusColor(status) : 'gray'}
                className="cursor-pointer text-xs"
                onClick={() => toggleStatus(status)}
              >
                {status}
              </Badge>
            ))}
          </div>
        </div>
      </div>
      
      {/* Deals table - responsive with horizontal scroll */}
      <Card>
        <CardHeader>
          <h2 className="text-base sm:text-lg font-medium text-gray-900">Active Deals</h2>
        </CardHeader>
        <CardBody>
          {filteredDeals.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Startup</th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Equity</th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Stage</th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Last Activity</th>
                    <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredDeals.map((deal) => (
                    <tr key={deal.id} className="hover:bg-gray-50">
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Avatar src={deal.logo} alt={deal.startupName} size="sm" />
                          <div className="ml-2 sm:ml-4">
                            <div className="text-xs sm:text-sm font-medium text-gray-900">{deal.startupName}</div>
                            <div className="text-xs text-gray-500 hidden sm:block">{deal.industry}</div>
                          </div>
                        </div>
                       </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">{deal.amount}</td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 hidden sm:table-cell">{deal.equity}</td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <Badge variant={getStatusColor(deal.status)}>{deal.status}</Badge>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 hidden md:table-cell">{deal.stage}</td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs text-gray-500 hidden lg:table-cell">
                        {deal.lastActivity.toLocaleDateString()}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right">
                        <Button variant="outline" size="sm">
                          <Eye size={12} className="sm:mr-1" />
                          <span className="hidden sm:inline">View</span>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
               </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-sm sm:text-base text-gray-500">No deals yet. Start connecting with entrepreneurs to build your deal pipeline.</p>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};