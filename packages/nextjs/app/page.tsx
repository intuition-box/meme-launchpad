"use client";

import Link from "next/link";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { RocketLaunchIcon, PlusIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

interface TokenInfo {
  token: string;
  creator: string;
  name: string;
  symbol: string;
  supply: bigint;
  timestamp: bigint;
}

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();

  // Fetch all tokens from the MemeLaunchpad contract
  const { data: allTokens, isLoading: isLoadingTokens } = useScaffoldReadContract({
    contractName: "MemeLaunchpad",
    functionName: "getAllTokens",
    args: [],
  });

  // Debug logging
  console.log("Debug info:", {
    allTokens,
    isLoadingTokens,
    tokenCount: allTokens?.length || 0
  });

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
              {/* Loading State */}
              {isLoadingTokens && (
                <div className="col-span-full text-center py-16">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                  <p className="text-gray-400">Loading tokens...</p>
                </div>
              )}

              {/* Real Token Cards */}
              {!isLoadingTokens && allTokens && allTokens.length > 0 && (
                allTokens.map((tokenInfo: TokenInfo, index: number) => (
                  <TokenCard 
                    key={tokenInfo.token}
                    name={tokenInfo.name}
                    ticker={tokenInfo.symbol}
                    supply={tokenInfo.supply.toString()}
                    saleState="Live" // For now, all tokens are "Live" - you can add more logic later
                    address={tokenInfo.token}
                    creator={tokenInfo.creator}
                    timestamp={tokenInfo.timestamp}
                  />
                ))
              )}
            </div>

            {/* Empty State */}
            {!isLoadingTokens && (!allTokens || allTokens.length === 0) && (
              <div className="text-center py-16">
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
            )}
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

export default Home;
