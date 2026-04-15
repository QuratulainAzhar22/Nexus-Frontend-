import { api } from './api';

export interface Meeting {
  id: number;
  organizerId: string;
  participantId: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  meetingUrl: string;
  createdAt: string;
  organizer?: any;
  participant?: any;
}

export const meetingService = {
  async createMeeting(data: {
    participantId: string;
    title: string;
    description: string;
    startTime: string;
    endTime: string;
  }): Promise<Meeting> {
    return api.post('/Meetings', data);
  },
  
  async getUserMeetings(): Promise<Meeting[]> {
    return api.get('/Meetings');
  },
  
  async getUpcomingMeetings(): Promise<Meeting[]> {
    return api.get('/Meetings/upcoming');
  },
  
  async getMeetingById(id: number): Promise<Meeting> {
    return api.get(`/Meetings/${id}`);
  },
  
  async acceptMeeting(id: number): Promise<void> {
    await api.put(`/Meetings/${id}/accept`, {});
  },
  
  async rejectMeeting(id: number): Promise<void> {
    await api.put(`/Meetings/${id}/reject`, {});
  },
  
  async completeMeeting(id: number): Promise<void> {
    await api.put(`/Meetings/${id}/complete`, {});
  },
  
  async checkConflict(startTime: string, endTime: string): Promise<boolean> {
    const response = await api.post('/Meetings/check-conflict', { startTime, endTime });
    return response.hasConflict;
  },
};