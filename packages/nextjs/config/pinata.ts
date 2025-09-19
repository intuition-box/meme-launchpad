// Pinata IPFS Configuration
// Copy this file to pinata.config.ts and add your actual keys

export const pinataConfig = {
  // Public API Key (can be exposed to frontend)
  apiKey: process.env.NEXT_PUBLIC_PINATA_API_KEY!,
  
  // Secret API Key (server-side only)
  secretKey: process.env.PINATA_SECRET_KEY!,
  
  // JWT Token (server-side only)
  jwt: process.env.PINATA_JWT!
};

// Instructions for setting up environment variables:
/*
1. Create a .env.local file in the packages/nextjs directory
2. Add the following variables:

NEXT_PUBLIC_PINATA_API_KEY=9f7c4b934e5f3aeaa630
PINATA_SECRET_KEY=1037bae3822f2df3b3334365e7463109aed2369ece7aaf4bd2dbd89151b74627
PINATA_JWT=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJlOTRkOWY5Ny01MTVlLTQ0YWMtYThiNC1kNjQ5ZGJhMzdkZmUiLCJlbWFpbCI6InNvY2lhbHMuamVyZW1pZS5vbGl2aWVyQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiI5ZjdjNGI5MzRlNWYzYWVhYTYzMCIsInNjb3BlZEtleVNlY3JldCI6IjEwMzdiYWUzODIyZjJkZjNiMzMzNDM2NWU3NDYzMTA5YWVkMjM2OWVjZTdhYWY0YmQyZGJkODkxNTFiNzQ2MjciLCJleHAiOjE3ODk3NzkzOTZ9.TfEEDm5TaIWZUQxAbm_Pw1c46YMCFfzZhve7UtfWqFs

3. Make sure .env.local is in your .gitignore file
*/
