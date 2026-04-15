import React, { createContext, useContext, useEffect, useState } from 'react';
import { videoCallService } from '../services/videoCallService';
import { useAuth } from './AuthContext';
import { JitsiVideoCall } from '../components/video/JitsiVideoCall';

interface IncomingCall {
  callerId: string;
  callerName: string;
  channelName: string;
  uid: number;
}

interface SignalRContextType {
  sendCallOffer: (targetUserId: string, callerName: string, channelName: string) => Promise<void>;
  acceptCall: (callerId: string, channelName: string) => Promise<void>;
  rejectCall: (callerId: string) => Promise<void>;
}

const SignalRContext = createContext<SignalRContextType | undefined>(undefined);

const toNumericUid = (userId: string): number => {
  const parsed = parseInt(userId);
  if (!isNaN(parsed)) return parsed;
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (Math.imul(31, hash) + userId.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % 99999 + 1;
};

export const SignalRProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      const token = localStorage.getItem('token');
      if (token) {
        videoCallService.connect(token).then(connected => {
          if (connected) {
            console.log('✅ SignalR Connected');
          }
        });
      }
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    videoCallService.onIncomingCall = (callerId, callerName, channelName) => {
      console.log('📞 Incoming call from:', callerName);
      const uid = toNumericUid(user?.id || '');
      setIncomingCall({ callerId, callerName, channelName, uid });
    };

    videoCallService.onCallAccepted = () => {
      console.log('Call accepted');
    };

    videoCallService.onCallRejected = () => {
      console.log('Call rejected');
    };
  }, [user]);

  const sendCallOffer = async (targetUserId: string, callerName: string, channelName: string) => {
    await videoCallService.sendCallOffer(targetUserId, callerName, channelName);
  };

  const acceptCall = async (callerId: string, channelName: string) => {
    await videoCallService.acceptCall(callerId, channelName);
    setIncomingCall(null);
  };

  const rejectCall = async (callerId: string) => {
    await videoCallService.rejectCall(callerId);
    setIncomingCall(null);
  };

  return (
    <SignalRContext.Provider value={{ sendCallOffer, acceptCall, rejectCall }}>
      {children}
      {incomingCall && (
        <JitsiVideoCall
          isOpen={true}
          onClose={() => setIncomingCall(null)}
          roomName={incomingCall.channelName}
          displayName={incomingCall.callerName}
        />
      )}
    </SignalRContext.Provider>
  );
};

export const useSignalR = () => {
  const context = useContext(SignalRContext);
  if (!context) throw new Error('useSignalR must be used within SignalRProvider');
  return context;
};