import React, { createContext, useState, useContext, useEffect, useCallback, ReactNode } from 'react';
import type { Identity, Credential, SharedProof, PredefinedDocument } from '../types';
import * as identityService from '../services/identityService';

interface IdentityContextType {
  identity: Identity | null;
  credentials: Credential[];
  createIdentity: (username: string) => void;
  logout: () => void;
  issueCredential: (file: File) => Promise<void>;
  generateProof: (credentialId: string, selectedClaims: string[]) => SharedProof | null;
  verifyProof: (proof: SharedProof) => boolean;
}

const IdentityContext = createContext<IdentityContextType | undefined>(undefined);

export const IdentityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [credentials, setCredentials] = useState<Credential[]>([]);

  useEffect(() => {
    const savedIdentity = localStorage.getItem('mysafepocket-identity');
    const savedCredentials = localStorage.getItem('mysafepocket-credentials');
    if (savedIdentity) {
      const parsedIdentity: Identity = JSON.parse(savedIdentity);
      setIdentity(parsedIdentity);
      if (savedCredentials) {
        setCredentials(JSON.parse(savedCredentials));
      }
    }
  }, []);

  const createIdentity = (username: string) => {
    const newIdentity = identityService.createIdentity(username);
    localStorage.setItem('mysafepocket-identity', JSON.stringify(newIdentity));
    localStorage.removeItem('mysafepocket-credentials');
    setIdentity(newIdentity);
    setCredentials([]);
  };

  const logout = () => {
    localStorage.removeItem('mysafepocket-identity');
    localStorage.removeItem('mysafepocket-credentials');
    setIdentity(null);
    setCredentials([]);
  };

  const issueCredential = useCallback(async (file: File): Promise<void> => {
    if (!identity) throw new Error("No identity found");
    const newCredential = await identityService.issueCredential(identity, file);
    const updatedCredentials = [...credentials, newCredential];
    setCredentials(updatedCredentials);
    localStorage.setItem('mysafepocket-credentials', JSON.stringify(updatedCredentials));
  }, [identity, credentials]);
  
  const generateProof = useCallback((credentialId: string, selectedClaimsKeys: string[]): SharedProof | null => {
    if (!identity) return null;
    const credential = credentials.find(c => c.id === credentialId);
    if (!credential) return null;

    const selectedClaims: { [key: string]: any } = {};
    selectedClaimsKeys.forEach(key => {
        if(credential.claims[key]) {
            selectedClaims[key] = credential.claims[key];
        }
    });

    return identityService.generateProof(identity, credential, selectedClaims);
  }, [identity, credentials]);
  
  const verifyProof = (proof: SharedProof): boolean => {
    return identityService.verifyProof(proof);
  };

  return (
    <IdentityContext.Provider value={{ identity, credentials, createIdentity, logout, issueCredential, generateProof, verifyProof }}>
      {children}
    </IdentityContext.Provider>
  );
};

export const useIdentity = (): IdentityContextType => {
  const context = useContext(IdentityContext);
  if (!context) {
    throw new Error('useIdentity must be used within an IdentityProvider');
  }
  return context;
};