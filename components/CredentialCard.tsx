
import React from 'react';
import type { Credential } from '../types';
import { DocumentTextIcon, QrCodeIcon } from './icons';

interface CredentialCardProps {
  credential: Credential;
  onShare: (credential: Credential) => void;
}

const CredentialCard: React.FC<CredentialCardProps> = ({ credential, onShare }) => {
  const claimCount = Object.keys(credential.claims).length;

  return (
    <div className="bg-brand-dark/40 rounded-xl shadow-lg p-5 flex flex-col justify-between border border-brand-secondary/20 hover:border-brand-secondary/50 transition-all duration-300">
      <div>
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-bold text-white">{credential.typeName}</h3>
          <DocumentTextIcon className="w-8 h-8 text-brand-accent/70" />
        </div>
        <p className="text-sm text-brand-light/60 mt-1">Contains {claimCount} verifiable claims.</p>
        <div className="mt-4 text-xs text-brand-light/50 space-y-1">
            <p className="break-all">File: {credential.file.name}</p>
            <p className="break-all">IPFS: {credential.file.ipfsHash.substring(0, 12)}...</p>
        </div>
      </div>
      <div className="mt-6">
        <button
          onClick={() => onShare(credential)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-brand-secondary/80 rounded-lg hover:bg-brand-secondary transition-colors"
        >
          <QrCodeIcon className="w-5 h-5" />
          Share Proof
        </button>
      </div>
    </div>
  );
};

export default CredentialCard;
