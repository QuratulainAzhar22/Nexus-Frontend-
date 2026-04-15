import React, { useState, useEffect, useRef } from 'react';
import { FileText, Upload, Download, Trash2, Share2, AlertCircle, PenTool } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { documentService, Document } from '../../services/documentService';
import { SignaturePad } from '../../components/documents/SignaturePad';
import toast from 'react-hot-toast';

export const DocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    loadDocuments();
  }, []);
  
  const loadDocuments = async () => {
    try {
      setLoading(true);
      const data = await documentService.getUserDocuments();
      setDocuments(data);
    } catch (error: any) {
      console.error('Load documents error:', error);
      toast.error(error.message || 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  };
  
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    try {
      await documentService.uploadDocument(file);
      toast.success('Document uploaded successfully');
      loadDocuments();
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload document');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  const handleDelete = async (id: number, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await documentService.deleteDocument(id);
        toast.success('Document deleted successfully');
        loadDocuments();
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete document');
      }
    }
  };
  
  const handleShare = async (id: number, currentShared: boolean) => {
    try {
      await documentService.shareDocument(id, !currentShared);
      toast.success(`Document ${!currentShared ? 'shared' : 'unshared'} successfully`);
      loadDocuments();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update sharing status');
    }
  };
  
  const handleDownload = async (id: number) => {
    try {
      await documentService.downloadDocument(id);
    } catch (error: any) {
      toast.error(error.message || 'Failed to download document');
    }
  };
  
  const handleSign = (document: Document) => {
    setSelectedDocument(document);
    setShowSignaturePad(true);
  };
  
  const handleSaveSignature = async (signatureImageUrl: string) => {
    if (selectedDocument) {
      try {
        await documentService.signDocument(selectedDocument.id, signatureImageUrl);
        toast.success(`Document signed successfully`);
        loadDocuments();
      } catch (error: any) {
        toast.error(error.message || 'Failed to sign document');
      }
    }
  };
  
  const totalSize = documents.reduce((sum, doc) => {
    const sizeNum = parseInt(doc.size) || 0;
    return sum + sizeNum;
  }, 0);
  const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(1);
  const usedPercentage = Math.min((totalSize / (20 * 1024 * 1024)) * 100, 100);
  
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
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Documents</h1>
          <p className="text-sm sm:text-base text-gray-600">Manage your important files</p>
        </div>
        
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileChange}
          disabled={uploading}
        />
        
        <Button 
          leftIcon={<Upload size={18} />} 
          disabled={uploading}
          onClick={handleUploadClick}
          className="w-full sm:w-auto"
        >
          {uploading ? 'Uploading...' : 'Upload Document'}
        </Button>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Storage info */}
        <div className="w-full lg:w-64">
          <Card>
            <CardHeader>
              <h2 className="text-base sm:text-lg font-medium text-gray-900">Storage</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Used</span>
                  <span className="font-medium text-gray-900">{totalSizeMB} MB</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full">
                  <div className="h-2 bg-primary-600 rounded-full" style={{ width: `${usedPercentage}%` }}></div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Available</span>
                  <span className="font-medium text-gray-900">20 MB</span>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Quick Access</h3>
                <div className="space-y-2">
                  <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
                    All Files
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
                    Shared with Me
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
                    Signed Documents
                  </button>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
        
        {/* Document list */}
        <div className="flex-1">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
              <h2 className="text-base sm:text-lg font-medium text-gray-900">All Documents</h2>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">Sort by</Button>
                <Button variant="outline" size="sm">Filter</Button>
              </div>
            </CardHeader>
            <CardBody>
              {documents.length > 0 ? (
                <div className="space-y-3">
                  {documents.map(doc => (
                    <div
                      key={doc.id}
                      className="flex flex-col p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                    >
                      {/* Top row: Icon and Name */}
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-primary-50 rounded-lg flex-shrink-0">
                          <FileText size={20} className="text-primary-600" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-sm font-medium text-gray-900 break-words">
                              {doc.name}
                            </h3>
                            <div className="flex flex-wrap gap-1">
                              {doc.shared && <Badge variant="secondary" size="sm">Shared</Badge>}
                              {(doc as any).isSigned && <Badge variant="success" size="sm">✓ Signed</Badge>}
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-gray-500">
                            <span>{doc.type?.split('/')[1]?.toUpperCase() || 'FILE'}</span>
                            <span>{doc.size}</span>
                            <span>Modified {new Date(doc.lastModified).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Bottom row: Action buttons */}
                      <div className="flex items-center justify-end gap-2 mt-3 pt-2 border-t border-gray-100">
                        <Button variant="ghost" size="sm" className="p-2" onClick={() => handleDownload(doc.id)}>
                          <Download size={16} />
                        </Button>
                        
                        <Button variant="ghost" size="sm" className="p-2" onClick={() => handleShare(doc.id, doc.shared)}>
                          <Share2 size={16} />
                        </Button>
                        
                        {!(doc as any).isSigned && (
                          <Button variant="ghost" size="sm" className="p-2 text-primary-600" onClick={() => handleSign(doc)}>
                            <PenTool size={16} />
                          </Button>
                        )}
                        
                        <Button variant="ghost" size="sm" className="p-2 text-error-600" onClick={() => handleDelete(doc.id, doc.name)}>
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gray-100 mb-4">
                    <AlertCircle size={20} className="text-gray-500" />
                  </div>
                  <p className="text-sm sm:text-base text-gray-600">No documents yet</p>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">Upload your first document to get started</p>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
      
      {showSignaturePad && selectedDocument && (
        <SignaturePad
          isOpen={showSignaturePad}
          onClose={() => {
            setShowSignaturePad(false);
            setSelectedDocument(null);
          }}
          onSave={handleSaveSignature}
          documentName={selectedDocument.name}
        />
      )}
    </div>
  );
};