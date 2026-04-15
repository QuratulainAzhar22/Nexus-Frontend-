import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Video, Check, X, Users, PlusCircle } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { meetingService, Meeting } from '../../services/meetingService';
import { userService } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export const MeetingsPage: React.FC = () => {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [entrepreneurs, setEntrepreneurs] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    participantId: '',
    title: '',
    description: '',
    startTime: '',
    endTime: '',
  });
  
  useEffect(() => {
    loadMeetings();
    if (user?.role === 'investor') {
      loadEntrepreneurs();
    }
  }, [user]);
  
  const loadMeetings = async () => {
    try {
      setLoading(true);
      const data = await meetingService.getUserMeetings();
      setMeetings(data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load meetings');
    } finally {
      setLoading(false);
    }
  };
  
  const loadEntrepreneurs = async () => {
    try {
      const data = await userService.getAllEntrepreneurs();
      setEntrepreneurs(data);
    } catch (error: any) {
      console.error('Failed to load entrepreneurs:', error);
    }
  };
  
  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await meetingService.createMeeting(formData);
      toast.success('Meeting scheduled successfully');
      setShowScheduleForm(false);
      setFormData({ participantId: '', title: '', description: '', startTime: '', endTime: '' });
      loadMeetings();
    } catch (error: any) {
      toast.error(error.message || 'Failed to schedule meeting');
    }
  };
  
  const handleAccept = async (id: number) => {
    try {
      await meetingService.acceptMeeting(id);
      toast.success('Meeting accepted');
      loadMeetings();
    } catch (error: any) {
      toast.error(error.message || 'Failed to accept meeting');
    }
  };
  
  const handleReject = async (id: number) => {
    try {
      await meetingService.rejectMeeting(id);
      toast.success('Meeting rejected');
      loadMeetings();
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject meeting');
    }
  };
  
  const handleJoinVideoCall = (meeting: Meeting) => {
    if (!user) return;
    const roomName = `meeting_${meeting.id}`;
    window.open(`https://meet.jit.si/${roomName}#config.disableDeepLinking=true`, '_blank');
  };
  
  const getStatusColor = (status: string): any => {
    switch (status) {
      case 'pending': return 'warning';
      case 'accepted': return 'success';
      case 'rejected': return 'error';
      default: return 'gray';
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
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Meetings</h1>
          <p className="text-sm sm:text-base text-gray-600">Schedule and manage your meetings</p>
        </div>
        
        {user?.role === 'investor' && (
          <Button leftIcon={<PlusCircle size={18} />} onClick={() => setShowScheduleForm(true)} className="w-full sm:w-auto">
            Schedule Meeting
          </Button>
        )}
      </div>
      
      {/* Schedule Form Modal */}
      {showScheduleForm && (
        <Card className="border-2 border-primary-200">
          <CardHeader>
            <h2 className="text-base sm:text-lg font-medium text-gray-900">Schedule New Meeting</h2>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSchedule} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Entrepreneur</label>
                <select
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  value={formData.participantId}
                  onChange={(e) => setFormData({ ...formData, participantId: e.target.value })}
                  required
                >
                  <option value="">Select an entrepreneur...</option>
                  {entrepreneurs.map(e => (
                    <option key={e.id} value={e.id}>{e.name} - {e.startupName || 'Startup'}</option>
                  ))}
                </select>
              </div>
              
              <Input
                label="Meeting Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              
              <Input
                label="Start Time"
                type="datetime-local"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                required
              />
              
              <Input
                label="End Time"
                type="datetime-local"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                required
              />
              
              <div className="flex flex-col sm:flex-row justify-end gap-2">
                <Button variant="outline" onClick={() => setShowScheduleForm(false)}>Cancel</Button>
                <Button type="submit">Schedule</Button>
              </div>
            </form>
          </CardBody>
        </Card>
      )}
      
      {/* Meetings List */}
      <div className="space-y-4">
        {meetings.length > 0 ? (
          meetings.map(meeting => (
            <Card key={meeting.id}>
              <CardBody className="p-4 sm:p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                      <div className="p-2 bg-primary-50 rounded-lg">
                        <Calendar size={16} className="sm:text-primary-600" />
                      </div>
                      <h3 className="text-base sm:text-lg font-medium text-gray-900">{meeting.title}</h3>
                      <Badge variant={getStatusColor(meeting.status)}>
                        {meeting.status.charAt(0).toUpperCase() + meeting.status.slice(1)}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">{meeting.description}</p>
                    
                    <div className="flex flex-wrap gap-3 sm:gap-4 text-xs sm:text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock size={14} className="sm:w-4 sm:h-4" />
                        <span>
                          {new Date(meeting.startTime).toLocaleString()} - {new Date(meeting.endTime).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users size={14} className="sm:w-4 sm:h-4" />
                        <span>With: {meeting.participant?.name || meeting.organizer?.name}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 w-full md:w-auto">
                    {meeting.status === 'pending' && user?.id === meeting.participantId && (
                      <div className="flex gap-2 w-full md:w-auto">
                        <Button variant="success" size="sm" leftIcon={<Check size={16} />} onClick={() => handleAccept(meeting.id)}>
                          Accept
                        </Button>
                        <Button variant="error" size="sm" leftIcon={<X size={16} />} onClick={() => handleReject(meeting.id)}>
                          Decline
                        </Button>
                      </div>
                    )}
                    
                    {meeting.status === 'accepted' && (
                      <Button variant="primary" size="sm" leftIcon={<Video size={16} />} onClick={() => handleJoinVideoCall(meeting)}>
                        Join Video Call
                      </Button>
                    )}
                  </div>
                </div>
              </CardBody>
            </Card>
          ))
        ) : (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gray-100 mb-4">
              <Calendar size={20} className="sm:text-gray-500" />
            </div>
            <p className="text-sm sm:text-base text-gray-600">No meetings scheduled</p>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">Schedule a meeting to connect with investors or entrepreneurs</p>
          </div>
        )}
      </div>
    </div>
  );
};