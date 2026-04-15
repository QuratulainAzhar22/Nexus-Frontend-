import React, { useState } from 'react';
import { User, Lock, Bell, Globe, Palette, CreditCard, Save } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';
import { authService } from '../../services/authService';
import toast from 'react-hot-toast';

export const SettingsPage: React.FC = () => {
  const { user, updateProfile, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    startupName: user?.startupName || '',
    pitchSummary: user?.pitchSummary || '',
    fundingNeeded: user?.fundingNeeded || '',
    industry: user?.industry || '',
    location: user?.location || '',
    teamSize: user?.teamSize || 1,
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  
  if (!user) return null;
  
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await userService.updateProfile(profileData);
      await updateProfile(profileData);
      console.log('Profile updated successfully');
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };
  
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    try {
      await authService.changePassword(passwordData.currentPassword, passwordData.newPassword);
      toast.success('Password changed successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      console.error('Password change error:', error);
      toast.error(error.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteAccount = async () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      toast.error('Account deletion not implemented in demo');
    }
  };
  
  return (
    <div className="space-y-6 animate-fade-in px-4 sm:px-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm sm:text-base text-gray-600">Manage your account preferences and settings</p>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Settings navigation - horizontal scroll on mobile */}
        <div className="w-full lg:w-64 overflow-x-auto pb-2 lg:pb-0">
          <div className="flex lg:flex-col gap-1 min-w-max lg:min-w-0">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-md whitespace-nowrap lg:whitespace-normal ${
                activeTab === 'profile'
                  ? 'text-primary-700 bg-primary-50'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <User size={18} className="mr-3 flex-shrink-0" />
              Profile
            </button>
            
            <button
              onClick={() => setActiveTab('security')}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-md whitespace-nowrap lg:whitespace-normal ${
                activeTab === 'security'
                  ? 'text-primary-700 bg-primary-50'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Lock size={18} className="mr-3 flex-shrink-0" />
              Security
            </button>
            
            <button
              onClick={() => setActiveTab('notifications')}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-md whitespace-nowrap lg:whitespace-normal ${
                activeTab === 'notifications'
                  ? 'text-primary-700 bg-primary-50'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Bell size={18} className="mr-3 flex-shrink-0" />
              Notifications
            </button>
            
            <button
              onClick={() => setActiveTab('appearance')}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-md whitespace-nowrap lg:whitespace-normal ${
                activeTab === 'appearance'
                  ? 'text-primary-700 bg-primary-50'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Palette size={18} className="mr-3 flex-shrink-0" />
              Appearance
            </button>
            
            <button
              onClick={() => setActiveTab('billing')}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-md whitespace-nowrap lg:whitespace-normal ${
                activeTab === 'billing'
                  ? 'text-primary-700 bg-primary-50'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <CreditCard size={18} className="mr-3 flex-shrink-0" />
              Billing
            </button>
          </div>
        </div>
        
        {/* Main settings content */}
        <div className="flex-1 space-y-6">
          {/* Profile Settings */}
          {activeTab === 'profile' && (
            <Card>
              <CardHeader>
                <h2 className="text-base sm:text-lg font-medium text-gray-900">Profile Settings</h2>
              </CardHeader>
              <CardBody className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <Avatar src={user.avatarUrl} alt={user.name} size="xl" className="mx-auto sm:mx-0" />
                  <div>
                    <p className="text-sm text-gray-500 text-center sm:text-left">
                      Avatar is automatically generated from your name
                    </p>
                  </div>
                </div>
                
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <Input
                      label="Full Name"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      required
                    />
                    
                    <Input label="Email" value={user.email} disabled />
                    
                    <Input
                      label="Location"
                      value={profileData.location}
                      onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                    />
                    
                    {user.role === 'entrepreneur' && (
                      <>
                        <Input
                          label="Startup Name"
                          value={profileData.startupName}
                          onChange={(e) => setProfileData({ ...profileData, startupName: e.target.value })}
                        />
                        
                        <Input
                          label="Industry"
                          value={profileData.industry}
                          onChange={(e) => setProfileData({ ...profileData, industry: e.target.value })}
                        />
                        
                        <Input
                          label="Funding Needed"
                          value={profileData.fundingNeeded}
                          onChange={(e) => setProfileData({ ...profileData, fundingNeeded: e.target.value })}
                        />
                        
                        <Input
                          label="Team Size"
                          type="number"
                          value={profileData.teamSize}
                          onChange={(e) => setProfileData({ ...profileData, teamSize: parseInt(e.target.value) })}
                        />
                      </>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                    <textarea
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm"
                      rows={4}
                      value={profileData.bio}
                      onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                    />
                  </div>
                  
                  {user.role === 'entrepreneur' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Pitch Summary</label>
                      <textarea
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm"
                        rows={4}
                        value={profileData.pitchSummary}
                        onChange={(e) => setProfileData({ ...profileData, pitchSummary: e.target.value })}
                      />
                    </div>
                  )}
                  
                  <div className="flex flex-col sm:flex-row justify-end gap-3">
                    <Button variant="outline" type="button" onClick={() => {
                      setProfileData({
                        name: user.name,
                        bio: user.bio || '',
                        startupName: user.startupName || '',
                        pitchSummary: user.pitchSummary || '',
                        fundingNeeded: user.fundingNeeded || '',
                        industry: user.industry || '',
                        location: user.location || '',
                        teamSize: user.teamSize || 1,
                      });
                    }}>
                      Cancel
                    </Button>
                    <Button type="submit" isLoading={loading}>
                      <Save size={16} className="mr-2" />
                      Save Changes
                    </Button>
                  </div>
                </form>
              </CardBody>
            </Card>
          )}
          
          {/* Security Settings */}
          {activeTab === 'security' && (
            <Card>
              <CardHeader>
                <h2 className="text-base sm:text-lg font-medium text-gray-900">Security Settings</h2>
              </CardHeader>
              <CardBody className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-4">Two-Factor Authentication</h3>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                      <Badge variant={twoFAEnabled ? 'success' : 'error'} className="mt-1">
                        {twoFAEnabled ? 'Enabled' : 'Not Enabled'}
                      </Badge>
                    </div>
                    <Button variant="outline" onClick={() => setTwoFAEnabled(!twoFAEnabled)}>
                      {twoFAEnabled ? 'Disable' : 'Enable'}
                    </Button>
                  </div>
                </div>
                
                <div className="pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900 mb-4">Change Password</h3>
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <Input
                      label="Current Password"
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      required
                    />
                    
                    <Input
                      label="New Password"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      required
                    />
                    
                    <Input
                      label="Confirm New Password"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      required
                    />
                    
                    <div className="flex justify-end">
                      <Button type="submit" isLoading={loading}>Update Password</Button>
                    </div>
                  </form>
                </div>
                
                <div className="pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900 mb-4">Danger Zone</h3>
                  <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <p className="text-sm text-red-700 mb-3">
                      Once you delete your account, there is no going back. All your data will be permanently removed.
                    </p>
                    <Button variant="error" onClick={handleDeleteAccount}>Delete Account</Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}
          
          {/* Notifications Settings */}
          {activeTab === 'notifications' && (
            <Card>
              <CardHeader>
                <h2 className="text-base sm:text-lg font-medium text-gray-900">Notification Preferences</h2>
              </CardHeader>
              <CardBody className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-gray-100 gap-3">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Email Notifications</h3>
                    <p className="text-sm text-gray-500">Receive email notifications for important updates</p>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary-600 flex-shrink-0">
                    <span className="inline-block h-4 w-4 translate-x-1 rounded-full bg-white transition"></span>
                  </button>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-gray-100 gap-3">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Push Notifications</h3>
                    <p className="text-sm text-gray-500">Get real-time alerts on your device</p>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-300 flex-shrink-0">
                    <span className="inline-block h-4 w-4 translate-x-6 rounded-full bg-white transition"></span>
                  </button>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 gap-3">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Message Alerts</h3>
                    <p className="text-sm text-gray-500">Get notified when you receive new messages</p>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary-600 flex-shrink-0">
                    <span className="inline-block h-4 w-4 translate-x-1 rounded-full bg-white transition"></span>
                  </button>
                </div>
              </CardBody>
            </Card>
          )}
          
          {/* Appearance Settings */}
          {activeTab === 'appearance' && (
            <Card>
              <CardHeader>
                <h2 className="text-base sm:text-lg font-medium text-gray-900">Appearance</h2>
              </CardHeader>
              <CardBody>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    <button className="p-2 sm:p-3 border-2 border-primary-500 rounded-lg bg-white">
                      <div className="w-full h-12 sm:h-16 bg-white border rounded mb-2"></div>
                      <span className="text-xs sm:text-sm font-medium">Light</span>
                    </button>
                    <button className="p-2 sm:p-3 border border-gray-200 rounded-lg bg-gray-900">
                      <div className="w-full h-12 sm:h-16 bg-gray-900 border rounded mb-2"></div>
                      <span className="text-xs sm:text-sm font-medium text-white">Dark</span>
                    </button>
                    <button className="p-2 sm:p-3 border border-gray-200 rounded-lg bg-gradient-to-r from-white to-gray-900">
                      <div className="w-full h-12 sm:h-16 bg-gradient-to-r from-white to-gray-900 border rounded mb-2"></div>
                      <span className="text-xs sm:text-sm font-medium">System</span>
                    </button>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}
          
          {/* Billing Settings */}
          {activeTab === 'billing' && (
            <Card>
              <CardHeader>
                <h2 className="text-base sm:text-lg font-medium text-gray-900">Billing & Subscription</h2>
              </CardHeader>
              <CardBody>
                <div className="text-center py-8">
                  <CreditCard size={36} className="sm:w-12 sm:h-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-base sm:text-lg font-medium text-gray-900">Free Plan</h3>
                  <p className="text-sm text-gray-500 mt-1">You are currently on the free plan</p>
                  <Button className="mt-4" disabled>Upgrade to Premium (Coming Soon)</Button>
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};