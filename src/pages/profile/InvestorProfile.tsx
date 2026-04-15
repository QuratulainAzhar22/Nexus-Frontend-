import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MessageCircle, Building2, MapPin, UserCircle, BarChart3, Briefcase, Edit2, DollarSign, TrendingUp } from 'lucide-react';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';
import { User } from '../../services/authService';
import toast from 'react-hot-toast';

export const InvestorProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();
  const [investor, setInvestor] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    bio: '',
    investmentInterests: '',
    investmentStage: '',
    portfolioCompanies: '',
    totalInvestments: 0,
    minimumInvestment: '',
    maximumInvestment: '',
  });
  
  useEffect(() => {
    if (id) {
      loadInvestor();
    }
  }, [id]);
  
  const loadInvestor = async () => {
    try {
      setLoading(true);
      const data = await userService.getInvestorById(id!);
      setInvestor(data);
      setEditForm({
        name: data.name,
        bio: data.bio || '',
        investmentInterests: (data.investmentInterests || []).join(', '),
        investmentStage: (data.investmentStage || []).join(', '),
        portfolioCompanies: (data.portfolioCompanies || []).join(', '),
        totalInvestments: data.totalInvestments || 0,
        minimumInvestment: data.minimumInvestment || '',
        maximumInvestment: data.maximumInvestment || '',
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to load investor profile');
    } finally {
      setLoading(false);
    }
  };
  
  const handleUpdateProfile = async () => {
    try {
      const updateData = {
        name: editForm.name,
        bio: editForm.bio,
        investmentInterests: editForm.investmentInterests.split(',').map(s => s.trim()).filter(s => s),
        investmentStage: editForm.investmentStage.split(',').map(s => s.trim()).filter(s => s),
        portfolioCompanies: editForm.portfolioCompanies.split(',').map(s => s.trim()).filter(s => s),
        totalInvestments: editForm.totalInvestments,
        minimumInvestment: editForm.minimumInvestment,
        maximumInvestment: editForm.maximumInvestment,
      };
      await userService.updateProfile(updateData);
      await loadInvestor();
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    }
  };
  
  const isCurrentUser = currentUser?.id === investor?.id;
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  if (!investor) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Investor not found</h2>
        <p className="text-gray-600 mt-2">The investor profile you're looking for doesn't exist or has been removed.</p>
        <Link to="/dashboard/entrepreneur">
          <Button variant="outline" className="mt-4">Back to Dashboard</Button>
        </Link>
      </div>
    );
  }
  
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Profile header */}
      <Card>
        <CardBody className="sm:flex sm:items-start sm:justify-between p-6">
          <div className="sm:flex sm:space-x-6">
            <Avatar
              src={investor.avatarUrl}
              alt={investor.name}
              size="xl"
              status={investor.isOnline ? 'online' : 'offline'}
              className="mx-auto sm:mx-0"
            />
            
            <div className="mt-4 sm:mt-0 text-center sm:text-left">
              {isEditing ? (
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="text-2xl font-bold text-gray-900 border rounded px-2 py-1"
                />
              ) : (
                <h1 className="text-2xl font-bold text-gray-900">{investor.name}</h1>
              )}
              <p className="text-gray-600 flex items-center justify-center sm:justify-start mt-1">
                <Building2 size={16} className="mr-1" />
                Investor • {investor.totalInvestments || 0} investments
              </p>
              
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start mt-3">
                <Badge variant="primary">
                  <MapPin size={14} className="mr-1" />
                  {investor.location || 'Location not specified'}
                </Badge>
                {!isEditing && (investor.investmentStage || []).map((stage, index) => (
                  <Badge key={index} variant="secondary" size="sm">{stage}</Badge>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-6 sm:mt-0 flex flex-col sm:flex-row gap-2 justify-center sm:justify-end">
            {!isCurrentUser && !isEditing && (
              <Link to={`/chat/${investor.id}`}>
                <Button leftIcon={<MessageCircle size={18} />}>
                  Message
                </Button>
              </Link>
            )}
            
            {isCurrentUser && !isEditing && (
              <Button
                variant="outline"
                leftIcon={<Edit2 size={18} />}
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </Button>
            )}
            
            {isEditing && (
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateProfile}>
                  Save Changes
                </Button>
              </div>
            )}
          </div>
        </CardBody>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content - left side */}
        <div className="lg:col-span-2 space-y-6">
          {/* About */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">About</h2>
            </CardHeader>
            <CardBody>
              {isEditing ? (
                <textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  rows={4}
                  className="w-full border rounded-md p-2"
                  placeholder="Tell us about your investment philosophy..."
                />
              ) : (
                <p className="text-gray-700">{investor.bio || 'No bio provided yet.'}</p>
              )}
            </CardBody>
          </Card>
          
          {/* Investment Interests */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">Investment Interests</h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div>
                  <h3 className="text-md font-medium text-gray-900">Industries</h3>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.investmentInterests}
                      onChange={(e) => setEditForm({ ...editForm, investmentInterests: e.target.value })}
                      className="w-full border rounded-md p-2 mt-1"
                      placeholder="FinTech, SaaS, HealthTech (comma separated)"
                    />
                  ) : (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {(investor.investmentInterests || []).map((interest, index) => (
                        <Badge key={index} variant="primary" size="md">{interest}</Badge>
                      ))}
                      {(investor.investmentInterests || []).length === 0 && (
                        <p className="text-gray-500 text-sm">No investment interests specified</p>
                      )}
                    </div>
                  )}
                </div>
                
                <div>
                  <h3 className="text-md font-medium text-gray-900">Investment Stages</h3>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.investmentStage}
                      onChange={(e) => setEditForm({ ...editForm, investmentStage: e.target.value })}
                      className="w-full border rounded-md p-2 mt-1"
                      placeholder="Seed, Series A, Series B (comma separated)"
                    />
                  ) : (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {(investor.investmentStage || []).map((stage, index) => (
                        <Badge key={index} variant="secondary" size="md">{stage}</Badge>
                      ))}
                      {(investor.investmentStage || []).length === 0 && (
                        <p className="text-gray-500 text-sm">No investment stages specified</p>
                      )}
                    </div>
                  )}
                </div>
                
                <div>
                  <h3 className="text-md font-medium text-gray-900">Investment Range</h3>
                  {isEditing ? (
                    <div className="flex gap-2 mt-1">
                      <input
                        type="text"
                        value={editForm.minimumInvestment}
                        onChange={(e) => setEditForm({ ...editForm, minimumInvestment: e.target.value })}
                        className="w-1/2 border rounded-md p-2"
                        placeholder="Min ($250K)"
                      />
                      <input
                        type="text"
                        value={editForm.maximumInvestment}
                        onChange={(e) => setEditForm({ ...editForm, maximumInvestment: e.target.value })}
                        className="w-1/2 border rounded-md p-2"
                        placeholder="Max ($1.5M)"
                      />
                    </div>
                  ) : (
                    <p className="text-md font-medium text-gray-900 mt-1">
                      {investor.minimumInvestment && investor.maximumInvestment 
                        ? `${investor.minimumInvestment} - ${investor.maximumInvestment}`
                        : 'Not specified'}
                    </p>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>
          
          {/* Portfolio Companies */}
          <Card>
            <CardHeader className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Portfolio Companies</h2>
              <span className="text-sm text-gray-500">{(investor.portfolioCompanies || []).length} companies</span>
            </CardHeader>
            <CardBody>
              {isEditing ? (
                <textarea
                  value={editForm.portfolioCompanies}
                  onChange={(e) => setEditForm({ ...editForm, portfolioCompanies: e.target.value })}
                  rows={3}
                  className="w-full border rounded-md p-2"
                  placeholder="Company A, Company B, Company C (comma separated)"
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(investor.portfolioCompanies || []).map((company, index) => (
                    <div key={index} className="flex items-center p-3 border border-gray-200 rounded-md">
                      <div className="p-3 bg-primary-50 rounded-md mr-3">
                        <Briefcase size={18} className="text-primary-700" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">{company}</h3>
                        <p className="text-xs text-gray-500">Portfolio Company</p>
                      </div>
                    </div>
                  ))}
                  {(investor.portfolioCompanies || []).length === 0 && (
                    <p className="text-gray-500 text-sm col-span-2">No portfolio companies added yet</p>
                  )}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
        
        {/* Sidebar - right side */}
        <div className="space-y-6">
          {/* Investment Details */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">Investment Details</h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div>
                  <span className="text-sm text-gray-500">Total Investments</span>
                  {isEditing ? (
                    <input
                      type="number"
                      value={editForm.totalInvestments}
                      onChange={(e) => setEditForm({ ...editForm, totalInvestments: parseInt(e.target.value) })}
                      className="text-md font-medium border rounded px-2 py-1 block mt-1 w-full"
                    />
                  ) : (
                    <p className="text-lg font-semibold text-gray-900">{investor.totalInvestments || 0} companies</p>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>
          
          {/* Stats */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">Investment Stats</h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                <div className="p-3 border border-gray-200 rounded-md bg-gray-50">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Active Investments</h3>
                      <p className="text-xl font-semibold text-primary-700 mt-1">{investor.totalInvestments || 0}</p>
                    </div>
                    <TrendingUp size={24} className="text-primary-600" />
                  </div>
                </div>
                
                <div className="p-3 border border-gray-200 rounded-md bg-gray-50">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Portfolio Size</h3>
                      <p className="text-xl font-semibold text-primary-700 mt-1">{(investor.portfolioCompanies || []).length}</p>
                    </div>
                    <BarChart3 size={24} className="text-primary-600" />
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};