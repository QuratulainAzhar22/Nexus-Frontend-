import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Bell, Calendar, TrendingUp, AlertCircle, PlusCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { CollaborationRequestCard } from '../../components/collaboration/CollaborationRequestCard';
import { InvestorCard } from '../../components/investor/InvestorCard';
import { useAuth } from '../../context/AuthContext';
import { collaborationService, CollaborationRequest } from '../../services/collaborationService';
import { userService } from '../../services/userService';
import { User } from '../../services/authService';
import toast from 'react-hot-toast';

export const EntrepreneurDashboard: React.FC = () => {
  const { user } = useAuth();
  const [collaborationRequests, setCollaborationRequests] = useState<CollaborationRequest[]>([]);
  const [recommendedInvestors, setRecommendedInvestors] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);
  
  const loadData = async () => {
    try {
      setLoading(true);
      const [requests, investors] = await Promise.all([
        collaborationService.getRequestsForEntrepreneur(),
        userService.getAllInvestors(),
      ]);
      setCollaborationRequests(requests);
      setRecommendedInvestors(investors.slice(0, 3));
    } catch (error: any) {
      toast.error(error.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };
  
  const handleRequestStatusUpdate = async (requestId: string, status: 'accepted' | 'rejected') => {
    try {
      await collaborationService.updateRequestStatus(parseInt(requestId), status);
      await loadData();
      toast.success(`Request ${status}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update request');
    }
  };
  
  if (loading || !user) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  const pendingRequests = collaborationRequests.filter(req => req.status === 'pending');
  const acceptedRequests = collaborationRequests.filter(req => req.status === 'accepted');
  
  return (
    <div className="space-y-6 animate-fade-in px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Welcome, {user.name}</h1>
          <p className="text-sm sm:text-base text-gray-600">Here's what's happening with your startup today</p>
        </div>
        
        <Link to="/investors">
          <Button leftIcon={<PlusCircle size={18} />} className="w-full sm:w-auto">
            Find Investors
          </Button>
        </Link>
      </div>
      
      {/* Summary cards - responsive grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="bg-primary-50 border border-primary-100">
          <CardBody className="p-3 sm:p-4">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-primary-100 rounded-full mr-3 sm:mr-4">
                <Bell size={16} className="sm:text-primary-700" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-primary-700">Pending Requests</p>
                <h3 className="text-lg sm:text-xl font-semibold text-primary-900">{pendingRequests.length}</h3>
              </div>
            </div>
          </CardBody>
        </Card>
        
        <Card className="bg-secondary-50 border border-secondary-100">
          <CardBody className="p-3 sm:p-4">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-secondary-100 rounded-full mr-3 sm:mr-4">
                <Users size={16} className="sm:text-secondary-700" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-secondary-700">Total Connections</p>
                <h3 className="text-lg sm:text-xl font-semibold text-secondary-900">{acceptedRequests.length}</h3>
              </div>
            </div>
          </CardBody>
        </Card>
        
        <Card className="bg-accent-50 border border-accent-100">
          <CardBody className="p-3 sm:p-4">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-accent-100 rounded-full mr-3 sm:mr-4">
                <Calendar size={16} className="sm:text-accent-700" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-accent-700">Upcoming Meetings</p>
                <h3 className="text-lg sm:text-xl font-semibold text-accent-900">0</h3>
              </div>
            </div>
          </CardBody>
        </Card>
        
        <Card className="bg-success-50 border border-success-100">
          <CardBody className="p-3 sm:p-4">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-green-100 rounded-full mr-3 sm:mr-4">
                <TrendingUp size={16} className="text-success-700" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-success-700">Profile Views</p>
                <h3 className="text-lg sm:text-xl font-semibold text-success-900">0</h3>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Collaboration requests */}
        <div className="flex-1 space-y-4">
          <Card>
            <CardHeader className="flex justify-between items-center">
              <h2 className="text-base sm:text-lg font-medium text-gray-900">Collaboration Requests</h2>
              <Badge variant="primary">{pendingRequests.length} pending</Badge>
            </CardHeader>
            
            <CardBody>
              {collaborationRequests.length > 0 ? (
                <div className="space-y-4">
                  {collaborationRequests.map(request => (
                    <CollaborationRequestCard
                      key={request.id}
                      request={request as any}
                      onStatusUpdate={handleRequestStatusUpdate}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gray-100 mb-4">
                    <AlertCircle size={20} className="sm:text-gray-500" />
                  </div>
                  <p className="text-sm sm:text-base text-gray-600">No collaboration requests yet</p>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">When investors are interested, requests will appear here</p>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
        
        {/* Recommended investors */}
        <div className="w-full lg:w-80 space-y-4">
          <Card>
            <CardHeader className="flex justify-between items-center">
              <h2 className="text-base sm:text-lg font-medium text-gray-900">Recommended Investors</h2>
              <Link to="/investors" className="text-xs sm:text-sm font-medium text-primary-600 hover:text-primary-500">
                View all
              </Link>
            </CardHeader>
            
            <CardBody className="space-y-4">
              {recommendedInvestors.map(investor => (
                <InvestorCard
                  key={investor.id}
                  investor={investor as any}
                  showActions={false}
                />
              ))}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};