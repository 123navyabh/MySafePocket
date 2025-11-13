import type { Identity, Credential, CredentialClaims, SharedProof, PredefinedDocument } from '../types';

// In a real app, this would use cryptographic libraries. Here we use simple string manipulation for simulation.
const MOCK_ISSUER_DID = "did:pixel:issuer:gov";

const PREDEFINED_DOCUMENTS: PredefinedDocument[] = [
    {
        type: 'AADHAAR_CARD',
        typeName: 'Aadhaar Card',
        claims: {
            "Name": "Aarav Sharma",
            "Date of Birth": "15-08-1990",
            "Gender": "Male",
            "Aadhaar Number": "1234 5678 9012",
            "Address": "123, Main Street, Bengaluru, 560001",
            "Is 18+": "Yes"
        },
    },
    {
        type: 'DEGREE_CERTIFICATE',
        typeName: 'Degree Certificate',
        claims: {
            "Student Name": "Priya Patel",
            "University": "Tech University of India",
            "Degree": "Bachelor of Technology",
            "Field of Study": "Computer Science",
            "Graduation Date": "May 2022",
            "Degree Completed": "Yes"
        },
    },
    {
        type: 'DRIVING_LICENSE',
        typeName: 'Driving License',
        claims: {
            "Name": "Rohan Singh",
            "Date of Birth": "25-12-1995",
            "License Number": "DL123456789",
            "Vehicle Class": "Motorcycle, Car",
            "Valid Till": "24-12-2035"
        },
    },
    {
        type: 'PASSPORT',
        typeName: 'Passport',
        claims: {
            "Full Name": "Ananya Gupta",
            "Passport No.": "Z1234567",
            "Nationality": "Indian",
            "Date of Issue": "01-01-2020",
            "Date of Expiry": "31-12-2029",
            "Place of Birth": "Mumbai"
        }
    },
    {
        type: 'STUDENT_ID',
        typeName: 'Student ID Card',
        claims: {
            "Student Name": "Vikram Kumar",
            "Student ID": "S98765",
            "Institution": "National Science College",
            "Program": "B.Sc. Physics",
            "Valid Upto": "June 2025"
        }
    }
];

// Simple hash function for simulation
const simpleHash = (data: string): string => {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return `sig_${Math.abs(hash).toString(16)}`;
};

export const createIdentity = (username: string): Identity => {
  const privateKey = `priv_key_${username}_${Date.now()}`;
  const publicKey = `pub_key_${username}_${Date.now()}`;
  const did = `did:pixel:${simpleHash(publicKey)}`;
  return { did, publicKey, privateKey };
};

export const issueCredential = async (identity: Identity, file: File): Promise<Credential> => {
  // Simulate IPFS upload
  const ipfsHash = `Qm${simpleHash(file.name + Date.now())}`;

  // Simulate document parsing by picking a predefined doc based on file name
  const docIndex = file.size % PREDEFINED_DOCUMENTS.length;
  const docTemplate = PREDEFINED_DOCUMENTS[docIndex];
  
  const claims = docTemplate.claims;
  const claimsString = JSON.stringify(claims);
  const signature = simpleHash(claimsString + identity.privateKey);

  return {
    id: `cred_${Date.now()}`,
    issuer: MOCK_ISSUER_DID,
    issuanceDate: new Date().toISOString(),
    type: docTemplate.type,
    typeName: docTemplate.typeName,
    claims,
    proof: {
      type: 'MockSignature2024',
      signature,
    },
    file: {
      name: file.name,
      type: file.type,
      ipfsHash,
    },
  };
};

export const generateProof = (identity: Identity, credential: Credential, selectedClaims: CredentialClaims): SharedProof | null => {
    const proofPayload = JSON.stringify({
        issuer: credential.issuer,
        type: credential.type,
        claims: selectedClaims
    });

    const signature = simpleHash(proofPayload + identity.privateKey);

    return {
        issuer: credential.issuer,
        type: credential.typeName,
        claims: selectedClaims,
        proof: {
            type: 'MockSelectiveDisclosureProof2024',
            signature
        }
    };
};

export const verifyProof = (proof: SharedProof): boolean => {
    // This is a simplified verification. A real implementation would involve public keys.
    // Here we just check if the claims are not empty.
    return Object.keys(proof.claims).length > 0;
};