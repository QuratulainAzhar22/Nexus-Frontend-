import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MessageCircle, Users, Calendar, Building2, MapPin, UserCircle, FileText, DollarSign, Send, Edit2 } from 'lucide-react';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';
import { collaborationService } from '../../services/collaborationService';
import { User } from '../../services/authService';
import toast from 'react-hot-toast';

export const EntrepreneurProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();
  const [entrepreneur, setEntrepreneur] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasRequested, setHasRequested] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    bio: '',
    startupName: '',
    pitchSummary: '',
    fundingNeeded: '',
    industry: '',
    location: '',
    teamSize: 1,
  });
  
  useEffect(() => {
    if (id) {
      loadEntrepreneur();
    }
  }, [id]);
  
  useEffect(() => {
    if (currentUser && entrepreneur && currentUser.role === 'investor') {
      checkRequestStatus();
    }
  }, [currentUser, entrepreneur]);
  
  const loadEntrepreneur = async () => {
    try {
      setLoading(true);
      const data = await userService.getEntrepreneurById(id!);
      setEntrepreneur(data);
      setEditForm({
        name: data.name,
        bio: data.bio || '',
        startupName: data.startupName || '',
        pitchSummary: data.pitchSummary || '',
        fundingNeeded: data.fundingNeeded || '',
        industry: data.industry || '',
        location: data.location || '',
        teamSize: data.teamSize || 1,
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to load entrepreneur profile');
    } finally {
      setLoading(false);
    }
  };
  
  const checkRequestStatus = async () => {
    try {
      const requests = await collaborationService.getRequestsFromInvestor();
      const existingRequest = requests.find(r => r.entrepreneurId === id);
      setHasRequested(!!existingRequest);
    } catch (error) {
      console.error('Failed to check request status:', error);
    }
  };
  
  const handleSendRequest = async () => {
    if (!currentUser || !entrepreneur) return;
    
    try {
      await collaborationService.sendRequest(
        entrepreneur.id,
        `I'm interested in learning more about ${entrepreneur.startupName} and would like to explore potential investment opportunities.`
      );
      setHasRequested(true);
      toast.success('Collaboration request sent successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send request');
    }
  };
  
  const handleUpdateProfile = async () => {
    try {
      await userService.updateProfile(editForm);
      await loadEntrepreneur();
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    }
  };
  
  const isCurrentUser = currentUser?.id === entrepreneur?.id;
  const isInvestor = currentUser?.role === 'investor';
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  if (!entrepreneur) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Entrepreneur not found</h2>
        <p className="text-gray-600 mt-2">The entrepreneur profile you're looking for doesn't exist or has been removed.</p>
        <Link to="/dashboard/investor">
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
              src={entrepreneur.avatarUrl}
              alt={entrepreneur.name}
              size="xl"
              status={entrepreneur.isOnline ? 'online' : 'offline'}
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
                <h1 className="text-2xl font-bold text-gray-900">{entrepreneur.name}</h1>
              )}
              <p className="text-gray-600 flex items-center justify-center sm:justify-start mt-1">
                <Building2 size={16} className="mr-1" />
                Founder at {isEditing ? (
                  <input
                    type="text"
                    value={editForm.startupName}
                    onChange={(e) => setEditForm({ ...editForm, startupName: e.target.value })}
                    className="ml-1 border rounded px-1"
                  />
                ) : (
                  entrepreneur.startupName || 'Not specified'
                )}
              </p>
              
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start mt-3">
                {isEditing ? (
                  <>
                    <input
                      type="text"
                      value={editForm.industry}
                      onChange={(e) => setEditForm({ ...editForm, industry: e.target.value })}
                      placeholder="Industry"
                      className="px-2 py-1 border rounded text-sm"
                    />
                    <input
                      type="text"
                      value={editForm.location}
                      onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                      placeholder="Location"
                      className="px-2 py-1 border rounded text-sm"
                    />
                  </>
                ) : (
                  <>
                    <Badge variant="primary">{entrepreneur.industry || 'Not specified'}</Badge>
                    <Badge variant="gray">
                      <MapPin size={14} className="mr-1" />
                      {entrepreneur.location || 'Location not specified'}
                    </Badge>
                    <Badge variant="accent">
                      <Calendar size={14} className="mr-1" />
                      Founded {entrepreneur.foundedYear || 'N/A'}
                    </Badge>
                    <Badge variant="secondary">
                      <Users size={14} className="mr-1" />
                      {entrepreneur.teamSize || 1} team members
                    </Badge>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="mt-6 sm:mt-0 flex flex-col sm:flex-row gap-2 justify-center sm:justify-end">
            {!isCurrentUser && !isEditing && (
              <>
                <Link to={`/chat/${entrepreneur.id}`}>
                  <Button variant="outline" leftIcon={<MessageCircle size={18} />}>
                    Message
                  </Button>
                </Link>
                
                {isInvestor && (
                  <Button
                    leftIcon={<Send size={18} />}
                    disabled={hasRequested}
                    onClick={handleSendRequest}
                  >
                    {hasRequested ? 'Request Sent' : 'Request Collaboration'}
                  </Button>
                )}
              </>
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
                  placeholder="Tell us about yourself..."
                />
              ) : (
                <p className="text-gray-700">{entrepreneur.bio || 'No bio provided yet.'}</p>
              )}
            </CardBody>
          </Card>
          
          {/* Startup Description */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">Startup Overview</h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div>
                  <h3 className="text-md font-medium text-gray-900">Pitch Summary</h3>
                  {isEditing ? (
                    <textarea
                      value={editForm.pitchSummary}
                      onChange={(e) => setEditForm({ ...editForm, pitchSummary: e.target.value })}
                      rows={4}
                      className="w-full border rounded-md p-2 mt-1"
                      placeholder="Describe your startup..."
                    />
                  ) : (
                    <p className="text-gray-700 mt-1">
                      {entrepreneur.pitchSummary || 'No pitch summary provided yet.'}
                    </p>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
        
        {/* Sidebar - right side */}
        <div className="space-y-6">
          {/* Funding Details */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">Funding</h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div>
                  <span className="text-sm text-gray-500">Current Round</span>
                  <div className="flex items-center mt-1">
                    <DollarSign size={18} className="text-accent-600 mr-1" />
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.fundingNeeded}
                        onChange={(e) => setEditForm({ ...editForm, fundingNeeded: e.target.value })}
                        className="text-lg font-semibold border rounded px-2 py-1"
                      />
                    ) : (
                      <p className="text-lg font-semibold text-gray-900">{entrepreneur.fundingNeeded || 'Not specified'}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <span className="text-sm text-gray-500">Team Size</span>
                  {isEditing ? (
                    <input
                      type="number"
                      value={editForm.teamSize}
                      onChange={(e) => setEditForm({ ...editForm, teamSize: parseInt(e.target.value) })}
                      className="text-md font-medium border rounded px-2 py-1 block mt-1"
                    />
                  ) : (
                    <p className="text-md font-medium text-gray-900">{entrepreneur.teamSize || 1} people</p>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>
          
          {/* Documents */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">Documents</h2>
            </CardHeader>
            <CardBody>
              <div className="text-center py-4">
                <FileText size={32} className="mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">Documents are managed in the Documents section</p>
                <Link to="/documents">
                  <Button variant="outline" size="sm" className="mt-3">
                    Go to Documents
                  </Button>
                </Link>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};