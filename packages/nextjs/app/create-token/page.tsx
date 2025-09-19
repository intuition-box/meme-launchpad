"use client";

import { useState } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { ArrowLeftIcon, RocketLaunchIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { Address, AddressInput } from "~~/components/scaffold-eth";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { parseEther } from "viem";
import { uploadImageToIPFS, getIPFSUrl, validateImageFile } from "~~/services/pinata";

const CreateTokenPage = () => {
  const { address: connectedAddress } = useAccount();
  const { writeContractAsync: writeMemeLaunchpadAsync, isPending } = useScaffoldWriteContract({
    contractName: "MemeLaunchpad",
  });

  const [formData, setFormData] = useState({
    name: "",
    symbol: "",
    initialSupply: "",
    feeBasisPoints: "100", // Default 1%
    feeCollector: "",
    imageURI: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isCreating, setIsCreating] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Token name is required";
    } else if (formData.name.length < 2) {
      newErrors.name = "Token name must be at least 2 characters";
    }

    if (!formData.symbol.trim()) {
      newErrors.symbol = "Token symbol is required";
    } else if (formData.symbol.length < 2 || formData.symbol.length > 10) {
      newErrors.symbol = "Token symbol must be 2-10 characters";
    }

    if (!formData.initialSupply.trim()) {
      newErrors.initialSupply = "Initial supply is required";
    } else {
      const supply = Number(formData.initialSupply);
      if (isNaN(supply) || supply <= 0) {
        newErrors.initialSupply = "Initial supply must be a positive number";
      } else if (supply > 1000000000) {
        newErrors.initialSupply = "Initial supply cannot exceed 1 billion";
      }
    }

    const feeBasisPoints = Number(formData.feeBasisPoints);
    if (isNaN(feeBasisPoints) || feeBasisPoints < 0 || feeBasisPoints > 2000) {
      newErrors.feeBasisPoints = "Fee must be between 0 and 2000 basis points (0-20%)";
    }

    // AddressInput component handles its own validation, so we only check if it's provided and not empty
    if (formData.feeCollector && formData.feeCollector.trim() === "") {
      newErrors.feeCollector = "Please enter a valid address or ENS name";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setErrors(prev => ({ ...prev, image: validation.error! }));
      return;
    }

    setSelectedImage(file);
    setErrors(prev => ({ ...prev, image: "" }));

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to IPFS
    setIsUploadingImage(true);
    try {
      const result = await uploadImageToIPFS(file, `${formData.name || "token"}-image`);
      const ipfsUrl = getIPFSUrl(result.IpfsHash);
      setFormData(prev => ({ ...prev, imageURI: ipfsUrl }));
    } catch (error) {
      console.error("Failed to upload image:", error);
      setErrors(prev => ({ ...prev, image: "Failed to upload image to IPFS" }));
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!connectedAddress) {
      alert("Please connect your wallet first");
      return;
    }

    setIsCreating(true);

    try {
      const result = await writeMemeLaunchpadAsync({
        functionName: "createMemeToken",
        args: [
          formData.name,
          formData.symbol,
          BigInt(formData.initialSupply),
          BigInt(formData.feeBasisPoints),
          formData.feeCollector || connectedAddress,
          formData.imageURI || ""
        ],
      });

      console.log("Token created successfully:", result);
      
      // Reset form
      setFormData({
        name: "",
        symbol: "",
        initialSupply: "",
        feeBasisPoints: "100",
        feeCollector: "",
        imageURI: "",
      });
      setSelectedImage(null);
      setImagePreview("");

      alert("Token created successfully! Check the homepage to see your new token.");
      
    } catch (error) {
      console.error("Error creating token:", error);
      alert("Failed to create token. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="relative px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8">
            <ArrowLeftIcon className="h-5 w-5" />
            Back to Launchpad
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative px-4 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-cyan-900/20 rounded-3xl"></div>
            
            {/* Glass morphism overlay */}
            <div className="absolute inset-0 backdrop-blur-sm bg-white/5 rounded-3xl"></div>
            
            <div className="relative z-10 p-12">
              {/* Header */}
              <div className="text-center mb-12">
                <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                  Launch Your Meme Coin
                </h1>
                <p className="text-xl text-gray-300">
                  Create your own meme token and launch it to the moon! 🚀
                </p>
              </div>

              {/* Connected Address */}
              {connectedAddress && (
                <div className="text-center mb-8">
                  <p className="text-gray-400 mb-2">Creating token as:</p>
                  <Address address={connectedAddress} />
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Token Name */}
                <div>
                  <label htmlFor="name" className="block text-lg font-semibold mb-3 text-white">
                    Token Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Doge Killer, Pepe Coin"
                    className={`w-full px-4 py-3 bg-white/10 backdrop-blur-sm border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 ${
                      errors.name ? 'border-red-500' : 'border-white/20 hover:border-white/30'
                    }`}
                  />
                  {errors.name && (
                    <p className="text-red-400 text-sm mt-2 flex items-center gap-1">
                      <ExclamationTriangleIcon className="h-4 w-4" />
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Token Symbol */}
                <div>
                  <label htmlFor="symbol" className="block text-lg font-semibold mb-3 text-white">
                    Token Symbol *
                  </label>
                  <input
                    type="text"
                    id="symbol"
                    name="symbol"
                    value={formData.symbol}
                    onChange={handleInputChange}
                    placeholder="e.g., DOGEK, PEPE"
                    className={`w-full px-4 py-3 bg-white/10 backdrop-blur-sm border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 ${
                      errors.symbol ? 'border-red-500' : 'border-white/20 hover:border-white/30'
                    }`}
                  />
                  {errors.symbol && (
                    <p className="text-red-400 text-sm mt-2 flex items-center gap-1">
                      <ExclamationTriangleIcon className="h-4 w-4" />
                      {errors.symbol}
                    </p>
                  )}
                </div>

                {/* Initial Supply */}
                <div>
                  <label htmlFor="initialSupply" className="block text-lg font-semibold mb-3 text-white">
                    Initial Supply *
                  </label>
                  <input
                    type="number"
                    id="initialSupply"
                    name="initialSupply"
                    value={formData.initialSupply}
                    onChange={handleInputChange}
                    placeholder="e.g., 1000000000"
                    className={`w-full px-4 py-3 bg-white/10 backdrop-blur-sm border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 ${
                      errors.initialSupply ? 'border-red-500' : 'border-white/20 hover:border-white/30'
                    }`}
                  />
                  <p className="text-gray-400 text-sm mt-2">
                    Total number of tokens to mint (in whole tokens, not wei)
                  </p>
                  {errors.initialSupply && (
                    <p className="text-red-400 text-sm mt-2 flex items-center gap-1">
                      <ExclamationTriangleIcon className="h-4 w-4" />
                      {errors.initialSupply}
                    </p>
                  )}
                </div>

                {/* Fee Basis Points */}
                <div>
                  <label htmlFor="feeBasisPoints" className="block text-lg font-semibold mb-3 text-white">
                    Transfer Fee (Basis Points)
                  </label>
                  <input
                    type="number"
                    id="feeBasisPoints"
                    name="feeBasisPoints"
                    value={formData.feeBasisPoints}
                    onChange={handleInputChange}
                    placeholder="100"
                    min="0"
                    max="2000"
                    className={`w-full px-4 py-3 bg-white/10 backdrop-blur-sm border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 ${
                      errors.feeBasisPoints ? 'border-red-500' : 'border-white/20 hover:border-white/30'
                    }`}
                  />
                  <p className="text-gray-400 text-sm mt-2">
                    Fee charged on transfers (100 = 1%, 0 = no fee, max 2000 = 20%)
                  </p>
                  {errors.feeBasisPoints && (
                    <p className="text-red-400 text-sm mt-2 flex items-center gap-1">
                      <ExclamationTriangleIcon className="h-4 w-4" />
                      {errors.feeBasisPoints}
                    </p>
                  )}
                </div>

                {/* Token Image */}
                <div>
                  <label className="block text-lg font-semibold mb-3 text-white">
                    Token Image (Optional)
                  </label>
                  
                  {/* Image Preview */}
                  {imagePreview && (
                    <div className="mb-4">
                      <img 
                        src={imagePreview} 
                        alt="Token preview" 
                        className="w-32 h-32 object-cover rounded-xl border border-white/20"
                      />
                    </div>
                  )}
                  
                  {/* Upload Button */}
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className={`w-full px-4 py-3 bg-white/10 backdrop-blur-sm border rounded-xl text-white cursor-pointer transition-all duration-300 flex items-center justify-center gap-2 ${
                        errors.image ? 'border-red-500' : 'border-white/20 hover:border-white/30'
                      } ${isUploadingImage ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {isUploadingImage ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          Uploading to IPFS...
                        </>
                      ) : (
                        <>
                          📷 {selectedImage ? 'Change Image' : 'Upload Image'}
                        </>
                      )}
                    </label>
                  </div>
                  
                  <p className="text-gray-400 text-sm mt-2">
                    Upload a token image (JPEG, PNG, GIF, WebP - max 10MB)
                  </p>
                  {errors.image && (
                    <p className="text-red-400 text-sm mt-2 flex items-center gap-1">
                      <ExclamationTriangleIcon className="h-4 w-4" />
                      {errors.image}
                    </p>
                  )}
                </div>

                {/* Fee Collector */}
                <div>
                  <label className="block text-lg font-semibold mb-3 text-white">
                    Fee Collector Address (Optional)
                  </label>
                  <AddressInput
                    value={formData.feeCollector}
                    onChange={(value) => {
                      setFormData(prev => ({
                        ...prev,
                        feeCollector: value
                      }));
                      // Clear error when user starts typing
                      if (errors.feeCollector) {
                        setErrors(prev => ({
                          ...prev,
                          feeCollector: ""
                        }));
                      }
                    }}
                    placeholder="Enter ENS name (e.g., vitalik.eth) or address (leave empty to use your address)"
                    className={`w-full ${errors.feeCollector ? 'border-red-500' : ''}`}
                  />
                  <p className="text-gray-400 text-sm mt-2">
                    Address that will receive transfer fees (defaults to your address)
                  </p>
                  {errors.feeCollector && (
                    <p className="text-red-400 text-sm mt-2 flex items-center gap-1">
                      <ExclamationTriangleIcon className="h-4 w-4" />
                      {errors.feeCollector}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <div className="pt-8">
                  <button
                    type="submit"
                    disabled={isCreating || isPending || !connectedAddress}
                    className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white font-bold text-lg hover:from-purple-500 hover:to-pink-500 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isCreating || isPending ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Creating Token...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <RocketLaunchIcon className="h-6 w-6" />
                        Launch Token
                      </div>
                    )}
                  </button>
                  
                  {!connectedAddress && (
                    <p className="text-center text-red-400 text-sm mt-4">
                      Please connect your wallet to create a token
                    </p>
                  )}
                </div>
              </form>

              {/* Info Section */}
              <div className="mt-12 bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <h3 className="text-xl font-semibold mb-4 text-white">Important Information</h3>
                <ul className="space-y-2 text-gray-300 text-sm">
                  <li>• You will become the owner of the created token</li>
                  <li>• The initial supply will be minted to your address</li>
                  <li>• Transfer fees are optional but recommended for sustainability</li>
                  <li>• Token creation is irreversible - double-check all details</li>
                  <li>• Gas fees will be charged for the deployment transaction</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateTokenPage;
