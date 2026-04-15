import React, { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Button } from '../ui/Button';
import { X, Save, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface SignaturePadProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (signatureImage: string) => void;
  documentName: string;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({
  isOpen,
  onClose,
  onSave,
  documentName,
}) => {
  const signatureRef = useRef<SignatureCanvas>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const clearSignature = () => {
    signatureRef.current?.clear();
  };

  const saveSignature = () => {
    if (signatureRef.current?.isEmpty()) {
      toast.error('Please draw your signature first');
      return;
    }

    // Get signature as image data URL (PNG)
    const signatureDataUrl = signatureRef.current?.toDataURL();
    if (signatureDataUrl) {
      onSave(signatureDataUrl);
      toast.success('Signature saved successfully');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold">Sign Document</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4">
          <p className="text-sm text-gray-600 mb-2">
            Signing: <span className="font-medium">{documentName}</span>
          </p>
          <p className="text-xs text-gray-500 mb-4">
            Draw your signature in the box below
          </p>

          {/* Signature Canvas */}
          <div className="border-2 border-gray-300 rounded-lg overflow-hidden bg-white">
            <SignatureCanvas
              ref={signatureRef}
              canvasProps={{
                className: 'w-full h-40 cursor-crosshair',
                style: { width: '100%', height: '160px' },
              }}
              onBegin={() => setIsDrawing(true)}
              onEnd={() => setIsDrawing(false)}
              penColor="#1D4ED8"
              backgroundColor="#FFFFFF"
            />
          </div>

          <div className="flex justify-between mt-4">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Trash2 size={16} />}
              onClick={clearSignature}
            >
              Clear
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Save size={16} />}
              onClick={saveSignature}
            >
              Save Signature
            </Button>
          </div>
        </div>

        <div className="p-4 border-t bg-gray-50">
          <p className="text-xs text-gray-500 text-center">
            By signing, you agree to the terms and conditions of this document
          </p>
        </div>
      </div>
    </div>
  );
};