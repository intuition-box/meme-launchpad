"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { Address, EtherInput } from "~~/components/scaffold-eth";
import { parseEther, formatEther } from "viem";

interface TokenInfo {
  token: string;
  creator: string;
  name: string;
  symbol: string;
  supply: bigint;
  timestamp: bigint;
}

export function MemeTokenManager() {
  const { address, isConnected } = useAccount();
  const [selectedToken, setSelectedToken] = useState<string | null>(null);
  const [liquidityAmount, setLiquidityAmount] = useState("");
  const [lockDuration, setLockDuration] = useState("30"); // days

  // Read all tokens
  const { data: allTokensLength } = useScaffoldReadContract({
    contractName: "MemeLaunchpad",
    functionName: "allTokensLength",
  });

  // Read tokens by creator
  const { data: userTokens } = useScaffoldReadContract({
    contractName: "MemeLaunchpad",
    functionName: "tokensByCreator",
    args: address ? [address] : undefined,
  });

  // Write contract hook for locking liquidity
  const { writeContractAsync: lockLiquidityAsync, isPending: isLockingLiquidity } = useScaffoldWriteContract({
    contractName: "MemeLaunchpad",
  });

  const handleLockLiquidity = async () => {
    if (!selectedToken || !liquidityAmount) {
      alert("Please select a token and enter liquidity amount");
      return;
    }

    try {
      const amountInWei = parseEther(liquidityAmount);
      const unlockTime = Math.floor(Date.now() / 1000) + (parseInt(lockDuration) * 24 * 60 * 60);
      
      await lockLiquidityAsync({
        functionName: "lockLiquidity",
        args: [selectedToken, amountInWei, BigInt(unlockTime), address],
      });

      setLiquidityAmount("");
      setSelectedToken(null);
    } catch (error) {
      console.error("Error locking liquidity:", error);
      alert("Failed to lock liquidity. Please try again.");
    }
  };

  if (!isConnected) {
    return (
      <div className="card w-full bg-base-100 shadow-xl">
        <div className="card-body text-center">
          <h2 className="card-title">Connect Your Wallet</h2>
          <p>Please connect your wallet to manage meme tokens.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Liquidity Locking Section */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl mb-4">Lock Liquidity</h2>
          <p className="text-sm text-base-content/70 mb-4">
            Lock liquidity for your tokens to increase trust and prevent rug pulls.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Select Token</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={selectedToken || ""}
                onChange={(e) => setSelectedToken(e.target.value)}
              >
                <option value="">Choose a token</option>
                {userTokens?.map((tokenAddress, index) => (
                  <option key={index} value={tokenAddress}>
                    {tokenAddress.slice(0, 6)}...{tokenAddress.slice(-4)}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Lock Duration (Days)</span>
              </label>
              <input
                type="number"
                placeholder="30"
                className="input input-bordered w-full"
                value={lockDuration}
                onChange={(e) => setLockDuration(e.target.value)}
                min="1"
              />
            </div>
          </div>

          <div className="form-control w-full mt-4">
            <label className="label">
              <span className="label-text">Liquidity Amount</span>
            </label>
            <EtherInput
              value={liquidityAmount}
              onChange={(value) => setLiquidityAmount(value)}
              placeholder="0.1"
            />
          </div>

          <button
            className="btn btn-primary w-full mt-4"
            onClick={handleLockLiquidity}
            disabled={isLockingLiquidity || !selectedToken || !liquidityAmount}
          >
            {isLockingLiquidity ? "Locking..." : "Lock Liquidity"}
          </button>
        </div>
      </div>

      {/* User's Tokens */}
      {userTokens && userTokens.length > 0 && (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-4">Your Tokens ({userTokens.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userTokens.map((tokenAddress, index) => (
                <TokenCard key={index} tokenAddress={tokenAddress} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* All Tokens */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl mb-4">All Tokens ({allTokensLength?.toString() || 0})</h2>
          <AllTokensList />
        </div>
      </div>
    </div>
  );
}

// Component to display individual token cards
function TokenCard({ tokenAddress }: { tokenAddress: string }) {
  return (
    <div className="card bg-base-200 shadow-md">
      <div className="card-body p-4">
        <h3 className="card-title text-sm">Token</h3>
        <Address address={tokenAddress} />
        <div className="card-actions justify-end mt-2">
          <button className="btn btn-xs btn-outline">View</button>
        </div>
      </div>
    </div>
  );
}

// Component to display all tokens
function AllTokensList() {
  const { data: allTokensLength } = useScaffoldReadContract({
    contractName: "MemeLaunchpad",
    functionName: "allTokensLength",
  });

  const tokens = [];
  if (allTokensLength) {
    for (let i = 0; i < Number(allTokensLength); i++) {
      tokens.push(i);
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {tokens.map((index) => (
        <TokenInfoCard key={index} tokenIndex={index} />
      ))}
    </div>
  );
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
      <div className="card bg-base-200 shadow-md">
        <div className="card-body p-4">
          <div className="skeleton h-4 w-full mb-2"></div>
          <div className="skeleton h-4 w-3/4 mb-2"></div>
          <div className="skeleton h-4 w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card bg-base-200 shadow-md">
        <div className="card-body p-4">
          <h3 className="card-title text-lg text-error">Error Loading Token #{tokenIndex}</h3>
          <p className="text-sm text-error">Failed to fetch token information</p>
          <details className="mt-2 text-xs">
            <summary className="cursor-pointer">Error Details</summary>
            <pre className="mt-1 text-left overflow-auto">
              {error.message}
            </pre>
          </details>
        </div>
      </div>
    );
  }

  if (!tokenInfo) {
    return null;
  }

  try {
    // Handle both array and object formats
    let tokenData: any;
    
    if (Array.isArray(tokenInfo)) {
      // If it's an array, map the values to the TokenInfo interface
      tokenData = {
        token: tokenInfo[0] || "",
        creator: tokenInfo[1] || "",
        name: tokenInfo[2] || "",
        symbol: tokenInfo[3] || "",
        supply: tokenInfo[4] || 0n,
        timestamp: tokenInfo[5] || 0n
      };
    } else {
      // If it's already an object, use it directly
      tokenData = tokenInfo;
    }
    
    console.log(`Processed token data for index ${tokenIndex}:`, tokenData);

    return (
      <div className="card bg-base-200 shadow-md">
        <div className="card-body p-4">
          <h3 className="card-title text-lg">{tokenData.name}</h3>
          <p className="text-sm text-base-content/70">Symbol: {tokenData.symbol}</p>
          <p className="text-sm text-base-content/70">
            Supply: {formatEther(tokenData.supply)} tokens
          </p>
          <div className="text-sm text-base-content/70">
            <p>Creator: <Address address={tokenData.creator} /></p>
          </div>
          <div className="text-sm text-base-content/70">
            <p>Token: <Address address={tokenData.token} /></p>
          </div>
          <div className="text-xs text-base-content/50">
            Created: {new Date(Number(tokenData.timestamp) * 1000).toLocaleDateString()}
          </div>
          <div className="card-actions justify-end mt-2">
            <button className="btn btn-xs btn-outline">View Token</button>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error processing token data:", error);
    return (
      <div className="card bg-base-200 shadow-md">
        <div className="card-body p-4">
          <h3 className="card-title text-lg text-error">Error Processing Token #{tokenIndex}</h3>
          <p className="text-sm text-error">Failed to process token information</p>
          <details className="mt-2 text-xs">
            <summary className="cursor-pointer">Error Details</summary>
            <pre className="mt-1 text-left overflow-auto">
              {error instanceof Error ? error.message : String(error)}
            </pre>
          </details>
        </div>
      </div>
    );
  }
}

