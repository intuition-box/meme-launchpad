"use client";

import Link from "next/link";
import type { NextPage } from "next";
import { useAccount, useChainId } from "wagmi";
import { RocketLaunchIcon, PlusIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";
import { useScaffoldReadContract, useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import { useAllTokens, processTokenData, type TokenInfo } from "~~/utils/tokenUtils";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const chainId = useChainId();

  // Debug: Check contract state
  const { data: allTokensLength, error: lengthError } = useScaffoldReadContract({
    contractName: "MemeLaunchpad",
    functionName: "allTokensLength",
    args: [],
  });

  // Get contract deployment info
  const deployedContractInfo = useDeployedContractInfo("MemeLaunchpad");

  console.log("Home Debug:", {
    connectedAddress,
    chainId,
    allTokensLength: allTokensLength?.toString(),
    contractName: "MemeLaunchpad",
    deployedContract: deployedContractInfo,
    lengthError
  });

  // Show error state if there's a critical error
  if (lengthError && deployedContractInfo) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="max-w-2xl mx-auto text-center p-8">
          <div className="bg-red-500/10 backdrop-blur-sm rounded-3xl p-12 border border-red-500/20">
            <h1 className="text-3xl font-bold text-red-400 mb-4">Contract Error</h1>
            <p className="text-red-300 mb-4">
              There was an error communicating with the MemeLaunchpad contract.
            </p>
            <details className="mt-4 text-left">
              <summary className="cursor-pointer text-red-200 font-semibold mb-2">
                Error Details
              </summary>
              <pre className="bg-black/50 p-4 rounded text-xs text-red-100 overflow-auto">
                {lengthError.message}
              </pre>
            </details>
            <div className="mt-6 space-y-2 text-sm text-gray-300">
              <p>Contract: {deployedContractInfo.address}</p>
              <p>Network: {chainId === 31337 ? "Hardhat Local" : chainId === 13579 ? "Intuition Testnet" : `Unknown (${chainId})`}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-black text-white">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-cyan-900/20"></div>
          
          {/* Glass morphism overlay */}
          <div className="absolute inset-0 backdrop-blur-sm bg-white/5"></div>
          
          <div className="relative z-10 flex flex-col items-center justify-center min-h-[60vh] px-4">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                MEME LAUNCHPAD
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Launch your meme coin to the moon. Create, trade, and lock liquidity with ease.
              </p>
              
              {/* Launch CTA Button */}
              <div className="mb-12">
                <Link href="/create-token">
                  <button className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl text-white font-bold text-lg hover:from-purple-500 hover:to-pink-500 transition-all duration-300 transform hover:scale-105 shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
                    <div className="relative flex items-center gap-2">
                      <RocketLaunchIcon className="h-6 w-6" />
                      Launch Your Meme Coin
                    </div>
                  </button>
                </Link>
              </div>

              {/* Connected Address */}
              {connectedAddress && (
                <div className="flex justify-center items-center space-x-2 mb-8">
                  <p className="text-gray-400">Connected:</p>
                  <Address address={connectedAddress} />
                </div>
              )}

              {/* Debug Info */}
              <div className="mt-8 p-4 bg-white/5 rounded-xl border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-2">System Status</h3>
                <div className="text-sm text-gray-300 space-y-1">
                  <p>Wallet: {connectedAddress ? "✅ Connected" : "❌ Not Connected"}</p>
                  <p>Network: {chainId === 31337 ? "🏠 Hardhat Local" : chainId === 13579 ? "🌐 Intuition Testnet" : `❓ Unknown (${chainId})`}</p>
                  <p>Contract: {deployedContractInfo ? "✅ Deployed" : "❌ Not Deployed"}</p>
                  <p>Contract Address: {deployedContractInfo?.address || "N/A"}</p>
                  <p>Total Tokens: {allTokensLength ? allTokensLength.toString() : "Loading..."}</p>
                </div>
                {chainId !== 31337 && chainId !== 13579 && (
                  <div className="mt-2 p-2 bg-yellow-500/20 rounded border border-yellow-500/30">
                    <p className="text-yellow-300 text-xs">
                      ⚠️ You're connected to an unsupported network. Please switch to Hardhat (localhost) or Intuition Testnet.
                    </p>
                  </div>
                )}
                {!deployedContractInfo && (
                  <div className="mt-2 p-2 bg-red-500/20 rounded border border-red-500/30">
                    <p className="text-red-300 text-xs">
                      ❌ MemeLaunchpad contract is not deployed on this network. Run `yarn deploy` to deploy it.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Token Cards Section */}
        <div className="relative px-4 py-16">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Live Token Sales
            </h2>
            
            {/* Token Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Use AllTokensList component to properly fetch all tokens */}
              <AllTokensList />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// Token Card Component
interface TokenCardProps {
  name: string;
  ticker: string;
  supply: string;
  saleState: string;
  address: string;
  creator?: string;
  timestamp?: bigint;
}

const TokenCard: React.FC<TokenCardProps> = ({ name, ticker, supply, saleState, address, creator, timestamp }) => {
  const getStateColor = (state: string) => {
    switch (state) {
      case "Live": return "text-green-400 bg-green-400/20";
      case "Ending Soon": return "text-yellow-400 bg-yellow-400/20";
      case "Sold Out": return "text-red-400 bg-red-400/20";
      default: return "text-gray-400 bg-gray-400/20";
    }
  };

  return (
    <div className="group relative">
      {/* Glass morphism card */}
      <div className="relative bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 hover:border-white/20 transition-all duration-300 hover:bg-white/10">
        {/* Glow effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        <div className="relative z-10">
          {/* Token Info */}
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-white mb-2">{name}</h3>
            <p className="text-gray-300 text-lg">${ticker}</p>
          </div>

          {/* Supply */}
          <div className="mb-4">
            <p className="text-gray-400 text-sm">Total Supply</p>
            <p className="text-white font-semibold">{Number(supply).toLocaleString()}</p>
          </div>

          {/* Creator */}
          {creator && (
            <div className="mb-4">
              <p className="text-gray-400 text-sm">Created by</p>
              <Address address={creator} />
            </div>
          )}

          {/* Timestamp */}
          {timestamp && (
            <div className="mb-4">
              <p className="text-gray-400 text-sm">Created</p>
              <p className="text-white font-semibold text-sm">
                {new Date(Number(timestamp) * 1000).toLocaleDateString()}
              </p>
            </div>
          )}

          {/* Sale State */}
          <div className="mb-6">
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStateColor(saleState)}`}>
              {saleState}
            </span>
          </div>

          {/* Buy Button */}
          <Link href={`/token/${address}`}>
            <button className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white font-semibold hover:from-purple-500 hover:to-pink-500 transition-all duration-300 transform hover:scale-105">
              View Details
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

// Component to display all tokens
function AllTokensList() {
  const { data: allTokens, isLoading, error, method, length } = useAllTokens();

  // Enhanced debug logging
  console.log("AllTokensList Debug:", {
    allTokens,
    isLoading,
    error,
    method,
    length,
    tokensCount: allTokens?.length || length?.toString(),
    errorDetails: error ? {
      message: error.message,
      cause: error.cause,
      stack: error.stack,
      name: error.name
    } : null
  });

  // Show loading state
  if (isLoading) {
    return (
      <div className="col-span-full text-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
        <p className="text-gray-400">Loading tokens...</p>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="col-span-full text-center py-16">
        <div className="bg-red-500/10 backdrop-blur-sm rounded-3xl p-12 border border-red-500/20">
          <h3 className="text-2xl font-bold text-red-400 mb-2">Error Loading Tokens</h3>
          <p className="text-red-300 mb-4">There was an error fetching tokens from the contract.</p>
          <p className="text-red-200 text-sm font-mono">{error.message}</p>
        </div>
      </div>
    );
  }

  // If we have all tokens data directly (getAllTokens method)
  if (allTokens && method === "getAllTokens") {
    if (allTokens.length === 0) {
      return (
        <div className="col-span-full text-center py-16">
          <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-12 border border-white/10">
            <PlusIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-2xl font-bold text-gray-300 mb-2">No Tokens Yet</h3>
            <p className="text-gray-400 mb-6">Be the first to launch a meme coin!</p>
            <Link href="/create-token">
              <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white font-semibold hover:from-purple-500 hover:to-pink-500 transition-all duration-300">
                Create First Token
              </button>
            </Link>
          </div>
        </div>
      );
    }

    return (
      <>
        {allTokens.map((tokenData, index) => (
          <TokenCard 
            key={index}
            name={tokenData.name || "Unknown"}
            ticker={tokenData.symbol || "UNK"}
            supply={tokenData.supply?.toString() || "0"}
            saleState="Live"
            address={tokenData.token || ""}
            creator={tokenData.creator}
            timestamp={tokenData.timestamp}
          />
        ))}
      </>
    );
  }

  // If we need to fetch individual tokens (allTokens method)
  if (method === "allTokens") {
    // Show empty state
    if (!length || length === 0n) {
      return (
        <div className="col-span-full text-center py-16">
          <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-12 border border-white/10">
            <PlusIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-2xl font-bold text-gray-300 mb-2">No Tokens Yet</h3>
            <p className="text-gray-400 mb-6">Be the first to launch a meme coin!</p>
            <Link href="/create-token">
              <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white font-semibold hover:from-purple-500 hover:to-pink-500 transition-all duration-300">
                Create First Token
              </button>
            </Link>
          </div>
        </div>
      );
    }

    // Generate array of indices to fetch individual tokens
    const tokenIndices = [];
    for (let i = 0; i < Number(length); i++) {
      tokenIndices.push(i);
    }

    return (
      <>
        {tokenIndices.map((index) => (
          <TokenInfoCard key={index} tokenIndex={index} />
        ))}
      </>
    );
  }

  return null;
}

// Component to display token information
function TokenInfoCard({ tokenIndex }: { tokenIndex: number }) {
  const { data: tokenInfo, isLoading, error } = useScaffoldReadContract({
    contractName: "MemeLaunchpad",
    functionName: "allTokens",
    args: [BigInt(tokenIndex)],
  });

  // Debug logging
  console.log(`TokenInfoCard[${tokenIndex}] Debug:`, {
    tokenInfo,
    isLoading,
    error,
    tokenIndex,
    tokenInfoType: typeof tokenInfo,
    tokenInfoArray: Array.isArray(tokenInfo),
    tokenInfoKeys: tokenInfo ? Object.keys(tokenInfo) : null
  });

  if (isLoading) {
    return (
      <div className="group relative">
        <div className="relative bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-600 rounded mb-2"></div>
            <div className="h-4 bg-gray-600 rounded mb-4"></div>
            <div className="h-4 bg-gray-600 rounded mb-2"></div>
            <div className="h-4 bg-gray-600 rounded mb-4"></div>
            <div className="h-10 bg-gray-600 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="group relative">
        <div className="relative bg-red-500/10 backdrop-blur-sm rounded-3xl p-8 border border-red-500/20">
          <div className="text-center">
            <h3 className="text-xl font-bold text-red-400 mb-2">Error Loading Token #{tokenIndex}</h3>
            <p className="text-red-300 text-sm">Failed to fetch token information</p>
            <details className="mt-2 text-xs text-red-200">
              <summary className="cursor-pointer">Error Details</summary>
              <pre className="mt-1 text-left overflow-auto">
                {error.message}
              </pre>
            </details>
          </div>
        </div>
      </div>
    );
  }

  if (!tokenInfo) {
    return null;
  }

  try {
    // Process token data using utility function
    const tokenData = processTokenData(tokenInfo);
    
    console.log(`Processed token data for index ${tokenIndex}:`, tokenData);
    
    return (
      <TokenCard 
        name={tokenData.name || "Unknown"}
        ticker={tokenData.symbol || "UNK"}
        supply={tokenData.supply?.toString() || "0"}
        saleState="Live"
        address={tokenData.token || ""}
        creator={tokenData.creator}
        timestamp={tokenData.timestamp}
      />
    );
  } catch (error) {
    console.error("Error processing token data:", error);
    return (
      <div className="group relative">
        <div className="relative bg-red-500/10 backdrop-blur-sm rounded-3xl p-8 border border-red-500/20">
          <div className="text-center">
            <h3 className="text-xl font-bold text-red-400 mb-2">Error Processing Token #{tokenIndex}</h3>
            <p className="text-red-300 text-sm">Failed to process token information</p>
            <details className="mt-2 text-xs text-red-200">
              <summary className="cursor-pointer">Error Details</summary>
              <pre className="mt-1 text-left overflow-auto">
                {error instanceof Error ? error.message : String(error)}
              </pre>
            </details>
          </div>
        </div>
      </div>
    );
  }
}

export default Home;
