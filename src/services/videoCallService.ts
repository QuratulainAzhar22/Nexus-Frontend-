import * as signalR from '@microsoft/signalr';

const API_BASE_URL = 'http://localhost:5286';

class VideoCallService {
  private connection: signalR.HubConnection | null = null;

  onIncomingCall: ((callerId: string, callerName: string, channelName: string) => void) | null = null;
  onCallAccepted: ((acceptorId: string, channelName: string) => void) | null = null;
  onCallRejected: ((rejectorId: string) => void) | null = null;

  async connect(token: string): Promise<boolean> {
    try {
      console.log('Connecting to SignalR at:', `${API_BASE_URL}/videoHub`);
      
      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(`${API_BASE_URL}/videoHub`, {
          accessTokenFactory: () => token,
        })
        .withAutomaticReconnect()
        .build();

      this.connection.on('ReceiveCallOffer', (callerId: string, callerName: string, roomId: string) => {
        console.log('📞 Incoming call from:', callerName);
        this.onIncomingCall?.(callerId, callerName, roomId);
      });

      this.connection.on('CallAccepted', (acceptorId: string, roomId: string) => {
        console.log('Call accepted by:', acceptorId);
        this.onCallAccepted?.(acceptorId, roomId);
      });

      this.connection.on('CallRejected', (rejectorId: string) => {
        console.log('Call rejected by:', rejectorId);
        this.onCallRejected?.(rejectorId);
      });

      await this.connection.start();
      console.log('✅ SignalR connected successfully');
      return true;
    } catch (error) {
      console.error('SignalR connection failed:', error);
      return false;
    }
  }

  async sendCallOffer(targetUserId: string, callerName: string, channelName: string): Promise<void> {
    if (!this.connection || this.connection.state !== signalR.HubConnectionState.Connected) {
      console.error('SignalR not connected, cannot send call offer');
      return;
    }
    await this.connection.invoke('SendCallOffer', targetUserId, callerName, channelName);
  }

  async acceptCall(callerId: string, channelName: string): Promise<void> {
    if (!this.connection || this.connection.state !== signalR.HubConnectionState.Connected) {
      console.error('SignalR not connected, cannot accept call');
      return;
    }
    await this.connection.invoke('AcceptCall', callerId, channelName);
  }

  async rejectCall(callerId: string): Promise<void> {
    if (!this.connection || this.connection.state !== signalR.HubConnectionState.Connected) {
      console.error('SignalR not connected, cannot reject call');
      return;
    }
    await this.connection.invoke('RejectCall', callerId);
  }

  isConnected(): boolean {
    return this.connection?.state === signalR.HubConnectionState.Connected;
  }
}

export const videoCallService = new VideoCallService();