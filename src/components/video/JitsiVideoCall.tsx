import React, { useEffect, useRef } from 'react';
import { PhoneOff } from 'lucide-react';
import { Button } from '../ui/Button';

interface JitsiVideoCallProps {
  isOpen: boolean;
  onClose: () => void;
  roomName: string;
  displayName: string;
}

declare const JitsiMeetExternalAPI: any;

export const JitsiVideoCall: React.FC<JitsiVideoCallProps> = ({
  isOpen,
  onClose,
  roomName,
  displayName,
}) => {
  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<any>(null);
  const scriptLoadedRef = useRef(false);

  useEffect(() => {
    if (isOpen && roomName && jitsiContainerRef.current) {
      loadJitsiScript();
    }
    return () => {
      if (apiRef.current) {
        apiRef.current.dispose();
        apiRef.current = null;
      }
    };
  }, [isOpen, roomName]);

  const loadJitsiScript = () => {
    // Check if script already exists
    const existingScript = document.querySelector('#jitsi-script');
    if (existingScript) {
      if (typeof JitsiMeetExternalAPI !== 'undefined') {
        initializeJitsi();
      } else {
        existingScript.addEventListener('load', initializeJitsi);
      }
      return;
    }

    const script = document.createElement('script');
    script.id = 'jitsi-script';
    script.src = 'https://meet.jit.si/external_api.js';
    script.async = true;
    script.onload = () => {
      console.log('Jitsi script loaded');
      initializeJitsi();
    };
    script.onerror = () => {
      console.error('Failed to load Jitsi script');
    };
    document.body.appendChild(script);
  };

  const initializeJitsi = () => {
    if (!jitsiContainerRef.current || apiRef.current) return;
    
    console.log('Initializing Jitsi with room:', roomName);
    
    try {
      const domain = 'meet.jit.si';
      const options = {
        roomName: roomName,
        width: '100%',
        height: '100%',
        parentNode: jitsiContainerRef.current,
        userInfo: {
          displayName: displayName,
        },
        configOverwrite: {
          startWithAudioMuted: false,
          startWithVideoMuted: false,
          prejoinPageEnabled: false,
          disableDeepLinking: true,
          disableInviteFunctions: true,
        },
        interfaceConfigOverwrite: {
          DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
          TOOLBAR_BUTTONS: [
            'microphone',
            'camera',
            'desktop',
            'fullscreen',
            'hangup',
            'settings',
            'chat',
          ],
        },
      };

      apiRef.current = new JitsiMeetExternalAPI(domain, options);

      // Handle when call is ended
      apiRef.current.addEventListener('videoConferenceLeft', () => {
        handleClose();
      });
      
      apiRef.current.addEventListener('readyToClose', () => {
        handleClose();
      });
    } catch (error) {
      console.error('Error initializing Jitsi:', error);
    }
  };

  const handleClose = () => {
    if (apiRef.current) {
      try {
        apiRef.current.dispose();
      } catch (e) {
        console.error('Error disposing Jitsi:', e);
      }
      apiRef.current = null;
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center">
      <div className="relative w-full max-w-6xl h-[90vh] bg-gray-900 rounded-xl overflow-hidden shadow-2xl">
        {/* Jitsi container */}
        <div ref={jitsiContainerRef} className="w-full h-full" />
        
        {/* Custom end call button (as backup) */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
          <Button
            variant="error"
            size="lg"
            className="rounded-full w-14 h-14 flex items-center justify-center shadow-lg"
            onClick={handleClose}
          >
            <PhoneOff size={24} />
          </Button>
        </div>
      </div>
    </div>
  );
};