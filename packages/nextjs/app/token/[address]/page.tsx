"use client";

import { useParams } from "next/navigation";
import { useAccount } from "wagmi";
import { ArrowLeftIcon, RocketLaunchIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { Address } from "~~/components/scaffold-eth";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

const TokenDetailPage = () => {
  const params = useParams();
  const tokenAddress = params.address as string;
  const { address: connectedAddress } = useAccount();

  // In a real implementation, you would fetch token details from the contract
  // For now, we'll use mock data
  const tokenData = {
    name: "Doge Killer",
    ticker: "DOGEK",
    supply: "1000000000",
    saleState: "Live",
    price: "0.0001",
    raised: "250000",
    target: "500000",
    participants: 1250,
    timeLeft: "2 days 14 hours",
    description: "The ultimate Doge killer token that will revolutionize the meme coin space. Join the revolution and be part of the next big thing in crypto!",
    creator: "0x1234567890123456789012345678901234567890",
    createdAt: "2024-01-15",
  };

  const progressPercentage = (Number(tokenData.raised) / Number(tokenData.target)) * 100;

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
                    {tokenData.name}
                  </h1>
                  <p className="text-2xl text-gray-300 mb-6">${tokenData.ticker}</p>
                  
                  <div className="space-y-4 mb-8">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Supply:</span>
                      <span className="text-white font-semibold">{Number(tokenData.supply).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Price:</span>
                      <span className="text-white font-semibold">${tokenData.price} ETH</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Participants:</span>
                      <span className="text-white font-semibold">{tokenData.participants.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Time Left:</span>
                      <span className="text-yellow-400 font-semibold">{tokenData.timeLeft}</span>
                    </div>
                  </div>

                  {/* Creator */}
                  <div className="mb-8">
                    <p className="text-gray-400 mb-2">Created by:</p>
                    <Address address={tokenData.creator} />
                  </div>
                </div>

                {/* Buy Section */}
                <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10">
                  <h3 className="text-2xl font-bold mb-6">Join the Sale</h3>
                  
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
                      <span>${Number(tokenData.raised).toLocaleString()} raised</span>
                      <span>${Number(tokenData.target).toLocaleString()} target</span>
                    </div>
                  </div>

                  {/* Sale State */}
                  <div className="mb-6">
                    <span className="inline-block px-4 py-2 bg-green-400/20 text-green-400 rounded-full text-sm font-medium">
                      {tokenData.saleState}
                    </span>
                  </div>

                  {/* Buy Button */}
                  <button className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white font-bold text-lg hover:from-purple-500 hover:to-pink-500 transition-all duration-300 transform hover:scale-105 mb-4">
                    <div className="flex items-center justify-center gap-2">
                      <RocketLaunchIcon className="h-6 w-6" />
                      Buy {tokenData.ticker}
                    </div>
                  </button>

                  {/* Connected Address */}
                  {connectedAddress && (
                    <div className="text-center">
                      <p className="text-gray-400 text-sm">Connected:</p>
                      <Address address={connectedAddress} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Token Description */}
      <div className="px-4 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10">
            <h2 className="text-3xl font-bold mb-6">About {tokenData.name}</h2>
            <p className="text-gray-300 text-lg leading-relaxed mb-6">
              {tokenData.description}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xl font-semibold mb-3">Token Details</h3>
                <div className="space-y-2 text-gray-300">
                  <div className="flex justify-between">
                    <span>Symbol:</span>
                    <span className="font-semibold">${tokenData.ticker}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Supply:</span>
                    <span className="font-semibold">{Number(tokenData.supply).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Created:</span>
                    <span className="font-semibold">{tokenData.createdAt}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-3">Sale Information</h3>
                <div className="space-y-2 text-gray-300">
                  <div className="flex justify-between">
                    <span>Price:</span>
                    <span className="font-semibold">${tokenData.price} ETH</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Raised:</span>
                    <span className="font-semibold">${Number(tokenData.raised).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Target:</span>
                    <span className="font-semibold">${Number(tokenData.target).toLocaleString()}</span>
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
