import React, { useState, useMemo, useRef, useCallback } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { useIdentity } from '../hooks/useIdentity';
import type { Credential, SharedProof } from '../types';
import { CloseIcon, ShareIcon, DownloadIcon, ClipboardIcon } from './icons';

interface ShareModalProps {
  credential: Credential;
  onClose: () => void;
}

const ShareModal: React.FC<ShareModalProps> = ({ credential, onClose }) => {
  const [selectedClaims, setSelectedClaims] = useState<string[]>([]);
  const { generateProof } = useIdentity();
  const qrRef = useRef<HTMLDivElement>(null);
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const proof = useMemo(() => {
    return generateProof(credential.id, selectedClaims);
  }, [credential.id, selectedClaims, generateProof]);

  const qrValue = proof ? JSON.stringify(proof) : '';
  
  const showFeedback = (message: string) => {
      setFeedbackMessage(message);
      setTimeout(() => setFeedbackMessage(''), 3000);
  };

  const getCanvas = (): HTMLCanvasElement | null => {
      return qrRef.current?.querySelector('canvas') ?? null;
  }

  const handleShare = useCallback(async () => {
    const canvas = getCanvas();
    if (!canvas || !navigator.share) {
        showFeedback('Web Share API not available on this browser.');
        return;
    }
    
    canvas.toBlob(async (blob) => {
        if (!blob) {
            showFeedback('Could not generate QR code image.');
            return;
        }
        const file = new File([blob], 'mysafepocket-proof.png', { type: 'image/png' });
        try {
            await navigator.share({
                title: 'MySafePocket Verifiable Proof',
                text: 'Scan this QR code to verify my credential.',
                files: [file],
            });
        } catch (error) {
            console.error('Error sharing:', error);
            showFeedback('Sharing was cancelled or failed.');
        }
    }, 'image/png');
  }, [qrValue]);

  const handleDownload = useCallback(() => {
    const canvas = getCanvas();
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'mysafepocket-proof.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }, [qrValue]);

  const handleCopy = useCallback(() => {
      if(!qrValue) return;
      navigator.clipboard.writeText(qrValue)
        .then(() => showFeedback('Proof data copied to clipboard!'))
        .catch(() => showFeedback('Failed to copy data.'));
  }, [qrValue]);

  const handleClaimToggle = (claimKey: string) => {
    setSelectedClaims(prev =>
      prev.includes(claimKey)
        ? prev.filter(key => key !== claimKey)
        : [...prev, claimKey]
    );
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
      <div className="bg-brand-dark rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-brand-secondary/30" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b border-brand-secondary/20">
          <h2 className="text-xl font-bold text-white">Create a Verifiable Proof</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
        
        <div className="flex-grow p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left: Claim Selection */}
            <div>
                <h3 className="font-semibold text-brand-accent">Select information to share:</h3>
                <p className="text-sm text-brand-light/60 mb-4">Only checked items will be included in the QR code.</p>
                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                    {Object.entries(credential.claims).map(([key, value]) => (
                        <label key={key} className="flex items-center p-3 space-x-3 bg-brand-primary/50 rounded-lg cursor-pointer hover:bg-brand-primary transition-colors">
                            <input
                                type="checkbox"
                                checked={selectedClaims.includes(key)}
                                onChange={() => handleClaimToggle(key)}
                                className="h-5 w-5 rounded bg-brand-dark border-brand-secondary/50 text-brand-secondary focus:ring-brand-secondary"
                            />
                            <span className="flex flex-col text-sm">
                                <span className="font-medium text-brand-light">{key}</span>
                                <span className="text-brand-light/70">{String(value)}</span>
                            </span>
                        </label>
                    ))}
                </div>
            </div>
            {/* Right: QR Code */}
            <div className="flex flex-col items-center justify-center p-6 bg-brand-primary/40 rounded-xl relative">
                 <h3 className="font-semibold text-brand-accent mb-2">Your Sharable QR Code</h3>
                {selectedClaims.length > 0 && proof ? (
                    <div ref={qrRef} className="p-4 bg-white rounded-lg">
                        <QRCodeCanvas value={qrValue} size={256} includeMargin={true} />
                    </div>
                ) : (
                    <div className="w-[288px] h-[288px] flex items-center justify-center bg-gray-700/50 rounded-lg text-center text-brand-light/60 p-4">
                        Select at least one claim to generate a QR code.
                    </div>
                )}
                 <p className="text-xs text-brand-light/50 mt-4 text-center h-8 flex items-center">
                    {feedbackMessage ? (
                         <span className="text-brand-accent animate-fade-in">{feedbackMessage}</span>
                    ) : (
                        "A verifier can scan this to receive only what you've selected."
                    )}
                 </p>
                 {selectedClaims.length > 0 && (
                     <div className="mt-2 flex items-center justify-center gap-2">
                        {navigator.share && (
                             <button onClick={handleShare} className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-white bg-brand-secondary rounded-md hover:bg-sky-400 transition-colors">
                                <ShareIcon className="w-4 h-4" /> Share
                            </button>
                        )}
                        <button onClick={handleDownload} className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-white bg-white/10 rounded-md hover:bg-white/20 transition-colors">
                            <DownloadIcon className="w-4 h-4" /> Download QR
                        </button>
                        <button onClick={handleCopy} className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-white bg-white/10 rounded-md hover:bg-white/20 transition-colors">
                            <ClipboardIcon className="w-4 h-4" /> Copy Data
                        </button>
                     </div>
                 )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;