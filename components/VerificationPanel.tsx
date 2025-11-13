import React, { useState } from 'react';
import type { SharedProof } from '../types';
import { useIdentity } from '../hooks/useIdentity';
import { CheckCircleIcon, ShieldExclamationIcon, QrCodeIcon, ClipboardIcon } from './icons';

interface VerificationResult {
    status: 'idle' | 'verified' | 'failed' | 'error';
    proof?: SharedProof;
    errorMessage?: string;
}

const VerificationPanel: React.FC = () => {
    const { verifyProof } = useIdentity();
    const [pastedData, setPastedData] = useState('');
    const [result, setResult] = useState<VerificationResult>({ status: 'idle' });

    const handleVerify = () => {
        if (!pastedData.trim()) {
            setResult({ status: 'error', errorMessage: 'Proof data cannot be empty.' });
            return;
        }
        try {
            const parsedProof = JSON.parse(pastedData) as SharedProof;
            // Basic validation of proof structure
            if (!parsedProof.claims || !parsedProof.issuer || !parsedProof.proof) {
                 throw new Error("Invalid proof structure.");
            }

            const isVerified = verifyProof(parsedProof);
            if (isVerified) {
                setResult({ status: 'verified', proof: parsedProof });
            } else {
                setResult({ status: 'failed', proof: parsedProof });
            }
        } catch (e) {
            setResult({ status: 'error', errorMessage: 'Invalid proof data. Please paste the exact data.' });
            console.error(e);
        }
    };


    const renderContent = () => {
        if (result.status === 'idle') {
            return (
                <div className="text-center w-full">
                    <QrCodeIcon className="w-12 h-12 mx-auto text-brand-secondary/30"/>
                    <h3 className="mt-4 text-lg font-medium text-white">Verification Panel</h3>
                    <p className="mt-1 text-sm text-brand-light/50">Paste proof data from a QR code to verify a credential.</p>
                </div>
            );
        }

        return (
            <>
                {result.status === 'verified' && (
                    <div className="flex flex-col items-center text-center text-green-300">
                        <CheckCircleIcon className="w-12 h-12" />
                        <h3 className="mt-2 text-xl font-bold">Proof Verified</h3>
                    </div>
                )}
                {(result.status === 'failed' || result.status === 'error') && (
                    <div className="flex flex-col items-center text-center text-red-400">
                        <ShieldExclamationIcon className="w-12 h-12" />
                        <h3 className="mt-2 text-xl font-bold">Verification Failed</h3>
                        {result.errorMessage && <p className="mt-1 text-sm">{result.errorMessage}</p>}
                    </div>
                )}
                {result.proof && (
                    <div className="mt-6 w-full text-left">
                        <h4 className="font-semibold text-brand-accent">Shared Information:</h4>
                        <div className="mt-2 p-4 bg-brand-primary/50 rounded-lg space-y-2 border border-brand-dark">
                            {Object.entries(result.proof.claims).map(([key, value]) => (
                                <div key={key} className="grid grid-cols-3 gap-2 text-sm">
                                    <span className="font-medium text-brand-light/70 col-span-1">{key}:</span>
                                    <span className="text-white col-span-2">{String(value)}</span>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 text-xs text-brand-light/50 w-full text-left">
                            <p><span className="font-semibold">Issuer:</span> {result.proof.issuer}</p>
                            <p><span className="font-semibold">Credential Type:</span> {result.proof.type}</p>
                        </div>
                    </div>
                )}
            </>
        );
    };

    return (
        <div className="h-full bg-brand-dark/30 rounded-2xl p-6 flex flex-col items-center justify-start border-2 border-dashed border-brand-dark/80 space-y-4">
            <div className="w-full flex-shrink-0">
                <label htmlFor="proof-data" className="block text-sm font-medium text-brand-light/80 mb-1">
                    Paste Proof Data Here
                </label>
                <textarea
                    id="proof-data"
                    rows={4}
                    value={pastedData}
                    onChange={(e) => setPastedData(e.target.value)}
                    className="block w-full text-xs text-white placeholder-gray-500 bg-brand-primary/50 border border-brand-dark rounded-md shadow-sm focus:outline-none focus:ring-brand-accent focus:border-brand-accent"
                    placeholder='{"issuer":"did:pixel:issuer:gov",...}'
                />
                <button
                    onClick={handleVerify}
                    className="w-full mt-2 px-4 py-2 text-sm font-semibold text-white bg-brand-secondary/80 rounded-lg hover:bg-brand-secondary transition-colors"
                >
                    Verify Proof
                </button>
            </div>
            <div className="w-full flex-grow flex items-center justify-center">
                 {renderContent()}
            </div>
        </div>
    );
};

export default VerificationPanel;
