"use client";

import { useParams } from "next/navigation";
import { useAccount } from "wagmi";
import { useState } from "react";
import { ArrowLeftIcon, RocketLaunchIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { Address, EtherInput } from "~~/components/scaffold-eth";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { useReadContract, useWriteContract } from "wagmi";
import { parseEther, formatEther } from "viem";

const TokenDetailPage = () => {
  const params = useParams();
  const tokenAddress = params.address as string;
  const { address: connectedAddress } = useAccount();
  const [purchaseAmount, setPurchaseAmount] = useState("");
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [lockAmount, setLockAmount] = useState("");
  const [lockDays, setLockDays] = useState("30");
  const [isLocking, setIsLocking] = useState(false);

  // For now, we'll use mock data since we need the MemeToken ABI
  // In a real implementation, you'd need to include the MemeToken ABI
  const tokenName = "Sample Token";
  const tokenSymbol = "SAMPLE";
  const totalSupply = BigInt("1000000000000000000000000000"); // 1B tokens
  const userBalance = BigInt("0");
  const owner = "0x0000000000000000000000000000000000000000";
  const feeBasisPoints = BigInt("100"); // 1%
  const feeCollector = "0x0000000000000000000000000000000000000000";

  // Contract write hook for transfers (using mock for now)
  const { writeContractAsync: writeTokenAsync } = useScaffoldWriteContract({
    contractName: "MemeLaunchpad",
  });

  // Contract write hook for MemeLaunchpad (for locking liquidity)
  const { writeContractAsync: writeLaunchpadAsync } = useScaffoldWriteContract({
    contractName: "MemeLaunchpad",
  });

  // Mock data for sale information (you can replace this with real sale contract data)
  const saleData = {
    price: "0.0001", // ETH per token
    raised: "250000", // USD raised
    target: "500000", // USD target
    participants: 1250,
    timeLeft: "2 days 14 hours",
    description: "The ultimate meme token that will revolutionize the crypto space. Join the revolution and be part of the next big thing!",
  };

  const progressPercentage = (Number(saleData.raised) / Number(saleData.target)) * 100;

  // Calculate token amount based on ETH input
  const calculateTokenAmount = (ethAmount: string) => {
    if (!ethAmount || ethAmount === "0") return "0";
    const ethValue = parseFloat(ethAmount);
    const tokenPrice = parseFloat(saleData.price);
    return (ethValue / tokenPrice).toString();
  };

  // Handle token purchase
  const handlePurchase = async () => {
    if (!connectedAddress) {
      alert("Please connect your wallet first");
      return;
    }

    if (!purchaseAmount || purchaseAmount === "0") {
      alert("Please enter a valid amount");
      return;
    }

    setIsPurchasing(true);

    try {
      // For now, we'll simulate a purchase by transferring tokens from owner to user
      // In a real implementation, you'd have a sale contract that handles ETH -> Token swaps
      
      const tokenAmount = calculateTokenAmount(purchaseAmount);
      const tokenAmountWei = parseEther(tokenAmount);

      // This is a simplified purchase - in reality you'd need a sale contract
      // that accepts ETH and mints/transfers tokens
      alert(`Purchase simulation: ${tokenAmount} ${tokenSymbol} for ${purchaseAmount} ETH`);
      
      // Reset form
      setPurchaseAmount("");
      
    } catch (error) {
      console.error("Purchase failed:", error);
      alert("Purchase failed. Please try again.");
    } finally {
      setIsPurchasing(false);
    }
  };

  // Handle liquidity locking
  const handleLockLiquidity = async () => {
    if (!connectedAddress) {
      alert("Please connect your wallet first");
      return;
    }

    if (!lockAmount || lockAmount === "0") {
      alert("Please enter a valid amount to lock");
      return;
    }

    const days = parseInt(lockDays);
    if (days < 1 || days > 365) {
      alert("Please enter a valid number of days (1-365)");
      return;
    }

    setIsLocking(true);

    try {
      const unlockTime = Math.floor(Date.now() / 1000) + (days * 24 * 60 * 60);
      const lockAmountWei = parseEther(lockAmount);

      const result = await writeLaunchpadAsync({
        functionName: "lockLiquidity",
        args: [
          tokenAddress, // LP token address (using the token address for now)
          lockAmountWei, // Amount to lock
          BigInt(unlockTime), // Unlock time
          connectedAddress // Beneficiary
        ],
      });

      console.log("Liquidity locked successfully:", result);
      
      // Reset form
      setLockAmount("");
      setLockDays("30");
      
      alert(`Liquidity locked successfully! Unlocks on ${new Date(unlockTime * 1000).toLocaleDateString()}`);
      
    } catch (error) {
      console.error("Lock liquidity failed:", error);
      alert("Failed to lock liquidity. Please try again.");
    } finally {
      setIsLocking(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="relative px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8">
            <ArrowLeftIcon className="h-5 w-5" />
            Back to Launchpad
          </Link>
        </div>
      </div>

      {/* Token Hero Section */}
      <div className="relative px-4 pb-16">
        <div className="max-w-7xl mx-auto">
          <div className="relative">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-cyan-900/20 rounded-3xl"></div>
            
            {/* Glass morphism overlay */}
            <div className="absolute inset-0 backdrop-blur-sm bg-white/5 rounded-3xl"></div>
            
            <div className="relative z-10 p-12">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                {/* Token Info */}
                <div>
                  <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                    {tokenName}
                  </h1>
                  <p className="text-2xl text-gray-300 mb-6">${tokenSymbol}</p>
                  
                  <div className="space-y-4 mb-8">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Supply:</span>
                      <span className="text-white font-semibold">
                        {Number(formatEther(totalSupply)).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Price:</span>
                      <span className="text-white font-semibold">{saleData.price} ETH</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Your Balance:</span>
                      <span className="text-white font-semibold">
                        {Number(formatEther(userBalance)).toLocaleString()} {tokenSymbol}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Transfer Fee:</span>
                      <span className="text-white font-semibold">
                        {`${Number(feeBasisPoints) / 100}%`}
                      </span>
                    </div>
                  </div>

                  {/* Creator */}
                  <div className="mb-8">
                    <p className="text-gray-400 mb-2">Created by:</p>
                    <Address address={owner} />
                  </div>
                </div>

                {/* Buy Section */}
                <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10">
                  <h3 className="text-2xl font-bold mb-6">Purchase Tokens</h3>
                  
                  {/* Progress Bar */}
                  <div className="mb-6">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-400">Progress</span>
                      <span className="text-white font-semibold">{progressPercentage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-purple-600 to-pink-600 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between mt-2 text-sm text-gray-400">
                      <span>${Number(saleData.raised).toLocaleString()} raised</span>
                      <span>${Number(saleData.target).toLocaleString()} target</span>
                    </div>
                  </div>

                  {/* Sale State */}
                  <div className="mb-6">
                    <span className="inline-block px-4 py-2 bg-green-400/20 text-green-400 rounded-full text-sm font-medium">
                      Live Sale
                    </span>
                  </div>

                  {/* Purchase Form */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Amount to Invest (ETH)
                    </label>
                    <EtherInput
                      value={purchaseAmount}
                      onChange={setPurchaseAmount}
                      placeholder="0.0"
                    />
                    {purchaseAmount && purchaseAmount !== "0" && (
                      <div className="mt-2 text-sm text-gray-400">
                        You will receive: {calculateTokenAmount(purchaseAmount)} {tokenSymbol}
                      </div>
                    )}
                  </div>

                  {/* Buy Button */}
                  <button 
                    onClick={handlePurchase}
                    disabled={isPurchasing || !connectedAddress || !purchaseAmount || purchaseAmount === "0"}
                    className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white font-bold text-lg hover:from-purple-500 hover:to-pink-500 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mb-4"
                  >
                    {isPurchasing ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Processing...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <RocketLaunchIcon className="h-6 w-6" />
                        Buy {tokenSymbol}
                      </div>
                    )}
                  </button>

                  {/* Connected Address */}
                  {connectedAddress && (
                    <div className="text-center">
                      <p className="text-gray-400 text-sm">Connected:</p>
                      <Address address={connectedAddress} />
                    </div>
                  )}

                  {!connectedAddress && (
                    <p className="text-center text-red-400 text-sm mt-4">
                      Please connect your wallet to purchase tokens
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Liquidity Locking Section */}
      <div className="px-4 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 mb-8">
            <h2 className="text-3xl font-bold mb-6">Lock Liquidity</h2>
            <p className="text-gray-300 text-lg leading-relaxed mb-6">
              Lock your tokens to demonstrate commitment and build trust in the project. Locked tokens cannot be withdrawn until the specified unlock time.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Amount to Lock ({tokenSymbol})
                </label>
                <input
                  type="number"
                  value={lockAmount}
                  onChange={(e) => setLockAmount(e.target.value)}
                  placeholder="0.0"
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Lock Duration (Days)
                </label>
                <input
                  type="number"
                  value={lockDays}
                  onChange={(e) => setLockDays(e.target.value)}
                  placeholder="30"
                  min="1"
                  max="365"
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300"
                />
              </div>
            </div>
            
            {lockAmount && lockDays && (
              <div className="mt-4 p-4 bg-white/5 rounded-xl border border-white/10">
                <h3 className="text-lg font-semibold mb-2">Lock Summary</h3>
                <div className="space-y-2 text-gray-300">
                  <div className="flex justify-between">
                    <span>Amount:</span>
                    <span className="font-semibold">{lockAmount} {tokenSymbol}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span className="font-semibold">{lockDays} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Unlocks on:</span>
                    <span className="font-semibold">
                      {new Date(Date.now() + parseInt(lockDays) * 24 * 60 * 60 * 1000).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            <button 
              onClick={handleLockLiquidity}
              disabled={isLocking || !connectedAddress || !lockAmount || lockAmount === "0"}
              className="w-full mt-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white font-bold text-lg hover:from-blue-500 hover:to-purple-500 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLocking ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Locking Liquidity...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  🔒 Lock Liquidity
                </div>
              )}
            </button>
            
            {!connectedAddress && (
              <p className="text-center text-red-400 text-sm mt-4">
                Please connect your wallet to lock liquidity
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Token Description */}
      <div className="px-4 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10">
            <h2 className="text-3xl font-bold mb-6">About {tokenName}</h2>
            <p className="text-gray-300 text-lg leading-relaxed mb-6">
              {saleData.description}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xl font-semibold mb-3">Token Details</h3>
                <div className="space-y-2 text-gray-300">
                  <div className="flex justify-between">
                    <span>Symbol:</span>
                    <span className="font-semibold">${tokenSymbol}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Supply:</span>
                    <span className="font-semibold">
                      {Number(formatEther(totalSupply)).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Transfer Fee:</span>
                    <span className="font-semibold">
                        {`${Number(feeBasisPoints) / 100}%`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fee Collector:</span>
                    <span className="font-semibold">
                      <Address address={feeCollector} />
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-3">Sale Information</h3>
                <div className="space-y-2 text-gray-300">
                  <div className="flex justify-between">
                    <span>Price:</span>
                    <span className="font-semibold">{saleData.price} ETH</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Raised:</span>
                    <span className="font-semibold">${Number(saleData.raised).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Target:</span>
                    <span className="font-semibold">${Number(saleData.target).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Participants:</span>
                    <span className="font-semibold">{saleData.participants.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenDetailPage;
