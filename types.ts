
export interface Identity {
  did: string; // Decentralized Identifier, e.g., "did:pixel:1a2b3c..."
  publicKey: string;
  privateKey: string; // In a real app, this would be handled securely and not stored directly
}

export interface CredentialClaims {
  [key: string]: string | number;
}

export interface Credential {
  id: string;
  issuer: string;
  issuanceDate: string;
  type: string;
  typeName: string;
  claims: CredentialClaims;
  proof: {
    type: string;
    signature: string;
  };
  file: {
    name: string;
    type: string;
    ipfsHash: string;
  };
}

export interface SharedProof {
  claims: CredentialClaims;
  issuer: string;
  type: string;
  proof: {
    type: string;
    signature: string;
  };
}

export interface PredefinedDocument {
    type: string;
    typeName: string;
    claims: CredentialClaims;
}
