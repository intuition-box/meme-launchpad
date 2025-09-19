import { pinataConfig } from "../config/pinata";

// Pinata configuration from environment variables
const PINATA_API_KEY = pinataConfig.apiKey;
const PINATA_SECRET_KEY = pinataConfig.secretKey;
const PINATA_JWT = pinataConfig.jwt;

export interface UploadResult {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
}

/**
 * Upload an image file to IPFS via Pinata
 * @param file - The image file to upload
 * @param name - Optional name for the file
 * @returns Promise with IPFS hash and metadata
 */
export async function uploadImageToIPFS(file: File, name?: string): Promise<UploadResult> {
  try {
    console.log("Starting IPFS upload for file:", file.name);
    
    const formData = new FormData();
    formData.append("file", file);
    
    const metadata = {
      name: name || file.name,
      keyvalues: {
        type: "meme-token-image",
        uploadedAt: new Date().toISOString(),
      },
    };
    
    formData.append("pinataMetadata", JSON.stringify(metadata));
    
    const options = {
      cidVersion: 0,
    };
    
    formData.append("pinataOptions", JSON.stringify(options));

    console.log("Making request to Pinata API...");
    
    const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${PINATA_JWT}`,
      },
      body: formData,
    });

    console.log("Pinata API response status:", response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Pinata API error:", errorText);
      throw new Error(`Pinata API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log("Pinata API success:", result);
    
    return {
      IpfsHash: result.IpfsHash,
      PinSize: result.PinSize,
      Timestamp: result.Timestamp,
    };
  } catch (error) {
    console.error("Error uploading to IPFS:", error);
    throw new Error(`Failed to upload image to IPFS: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get IPFS URL from hash
 * @param hash - IPFS hash
 * @returns Full IPFS URL
 */
export function getIPFSUrl(hash: string): string {
  return `https://gateway.pinata.cloud/ipfs/${hash}`;
}

/**
 * Validate image file
 * @param file - File to validate
 * @returns Validation result
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: "Please upload a valid image file (JPEG, PNG, GIF, or WebP)",
    };
  }

  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: "Image size must be less than 10MB",
    };
  }

  return { valid: true };
}
