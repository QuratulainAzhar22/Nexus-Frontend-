import { api } from './api';

export interface Document {
  id: number;
  name: string;
  type: string;
  size: string;
  lastModified: string;
  shared: boolean;
  url: string;
  ownerId: string;
  signatureImageUrl?: string;
  isSigned?: boolean;
  signedAt?: string;
  signedByUserId?: string;
}

export const documentService = {
  async getUserDocuments(): Promise<Document[]> {
    return api.get('/Documents');
  },
  
  async getDocumentById(id: number): Promise<Document> {
    return api.get(`/Documents/${id}`);
  },
  
  async uploadDocument(file: File, shared: boolean = false): Promise<Document> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Content = (reader.result as string).split(',')[1];
        const response = await api.post('/Documents/upload', {
          name: file.name,
          type: file.type,
          size: file.size.toString(),
          base64Content: base64Content,
          shared: shared,
        });
        resolve(response.document);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },
  
  async shareDocument(id: number, shared: boolean): Promise<void> {
    await api.put(`/Documents/${id}/share`, { shared });
  },
  
  async deleteDocument(id: number): Promise<void> {
    await api.delete(`/Documents/${id}`);
  },
  
  async downloadDocument(id: number): Promise<void> {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${api.baseURL}/Documents/download/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Download failed');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `document_${id}`;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (match && match[1]) {
          filename = match[1].replace(/['"]/g, '');
        }
      }
      
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Download error:', error);
      throw new Error(error.message || 'Failed to download document');
    }
  },

  // ==============================================
  // E-SIGNATURE METHOD
  // ==============================================
  
  async signDocument(id: number, signatureImageUrl: string): Promise<Document> {
    const response = await api.post(`/Documents/${id}/sign`, { signatureImageUrl });
    return response.document;
  },
};