import React, { useState, useRef } from 'react';
import { useIdentity } from '../hooks/useIdentity';
import type { Credential } from '../types';
import CredentialCard from './CredentialCard';
import ShareModal from './ShareModal';
import VerificationPanel from './VerificationPanel';
import { DocumentPlusIcon, LogoutIcon } from './icons';

const Dashboard: React.FC = () => {
  const { identity, credentials, issueCredential, logout } = useIdentity();
  const [selectedCredential, setSelectedCredential] = useState<Credential | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsLoading(true);
      try {
        await issueCredential(file);
      } catch (error) {
        console.error("Failed to issue credential:", error);
        alert("Failed to issue credential. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  const handleAddDocumentClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleShare = (credential: Credential) => {
    setSelectedCredential(credential);
    setIsModalOpen(true);
  };
  
  return (
    <div className="animate-slide-in-up">
      <div className="flex justify-between items-center mb-6">
        <div>
            <h2 className="text-2xl font-bold text-white">My Digital Vault</h2>
            <p className="text-sm text-brand-light/60 break-all">DID: {identity?.did}</p>
        </div>
        <button onClick={logout} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-dark/50 rounded-lg hover:bg-brand-dark transition-colors border border-brand-secondary/30">
            <LogoutIcon className="w-5 h-5" />
            <span>Logout</span>
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-white">My Credentials</h3>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                <button 
                  onClick={handleAddDocumentClick} 
                  disabled={isLoading}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-secondary rounded-lg hover:bg-sky-400 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
                >
                  <DocumentPlusIcon className="w-5 h-5" />
                  <span>{isLoading ? 'Issuing...' : 'Add Document'}</span>
                </button>
            </div>
            {credentials.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {credentials.map(cred => (
                        <CredentialCard key={cred.id} credential={cred} onShare={handleShare} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 px-6 bg-brand-dark/20 rounded-xl border-2 border-dashed border-brand-dark">
                    <h4 className="text-lg font-medium text-white">Your vault is empty.</h4>
                    <p className="mt-1 text-sm text-brand-light/60">Click "Add Document" to issue your first verifiable credential.</p>
                </div>
            )}
        </div>

        <div className="lg:col-span-2">
            <VerificationPanel />
        </div>
      </div>
      
      {isModalOpen && selectedCredential && (
        <ShareModal
          credential={selectedCredential}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;