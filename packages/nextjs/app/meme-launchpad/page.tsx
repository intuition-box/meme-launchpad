"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { Address, EtherInput } from "~~/components/scaffold-eth";
import { parseEther, formatEther } from "viem";

export default function MemeLaunchpadPage() {
  const { address, isConnected } = useAccount();
  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [initialSupply, setInitialSupply] = useState("");
  const [feeBasisPoints, setFeeBasisPoints] = useState("100"); // 1% default
  const [feeCollector, setFeeCollector] = useState("");

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

  // Write contract hook for creating meme tokens
  const { writeContractAsync: createMemeTokenAsync, isPending: isCreatingToken } = useScaffoldWriteContract({
    contractName: "MemeLaunchpad",
  });

  // Write contract hook for locking liquidity
  const { writeContractAsync: lockLiquidityAsync, isPending: isLockingLiquidity } = useScaffoldWriteContract({
    contractName: "MemeLaunchpad",
  });

  const handleCreateToken = async () => {
    if (!tokenName || !tokenSymbol || !initialSupply) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const supplyInWei = parseEther(initialSupply);
      const feeBps = parseInt(feeBasisPoints);
      const collector = feeCollector || address;

      await createMemeTokenAsync({
        functionName: "createMemeToken",
        args: [tokenName, tokenSymbol, supplyInWei, feeBps, collector],
      });

      // Reset form
      setTokenName("");
      setTokenSymbol("");
      setInitialSupply("");
      setFeeBasisPoints("100");
      setFeeCollector("");
    } catch (error) {
      console.error("Error creating token:", error);
      alert("Failed to create token. Please try again.");
    }
  };

  const handleLockLiquidity = async (lpToken: string, amount: string, unlockTime: number) => {
    try {
      const amountInWei = parseEther(amount);
      await lockLiquidityAsync({
        functionName: "lockLiquidity",
        args: [lpToken, amountInWei, unlockTime, address],
      });
    } catch (error) {
      console.error("Error locking liquidity:", error);
      alert("Failed to lock liquidity. Please try again.");
    }
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="card w-96 bg-base-100 shadow-xl">
          <div className="card-body text-center">
            <h2 className="card-title">Connect Your Wallet</h2>
            <p>Please connect your wallet to create and manage meme tokens.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">🚀 Meme Token Launchpad</h1>
        <p className="text-lg text-base-content/70">
          Create your own meme tokens and launch them on the blockchain!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Create Token Form */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-4">Create New Meme Token</h2>
            
            <div className="form-control w-full mb-4">
              <label className="label">
                <span className="label-text">Token Name *</span>
              </label>
              <input
                type="text"
                placeholder="e.g., DogeCoin Killer"
                className="input input-bordered w-full"
                value={tokenName}
                onChange={(e) => setTokenName(e.target.value)}
              />
            </div>

            <div className="form-control w-full mb-4">
              <label className="label">
                <span className="label-text">Token Symbol *</span>
              </label>
              <input
                type="text"
                placeholder="e.g., DOGEK"
                className="input input-bordered w-full"
                value={tokenSymbol}
                onChange={(e) => setTokenSymbol(e.target.value.toUpperCase())}
              />
            </div>

            <div className="form-control w-full mb-4">
              <label className="label">
                <span className="label-text">Initial Supply *</span>
              </label>
              <EtherInput
                value={initialSupply}
                onChange={(value) => setInitialSupply(value)}
                placeholder="1000000"
              />
            </div>

            <div className="form-control w-full mb-4">
              <label className="label">
                <span className="label-text">Fee (Basis Points)</span>
                <span className="label-text-alt">1% = 100 basis points</span>
              </label>
              <input
                type="number"
                placeholder="100"
                className="input input-bordered w-full"
                value={feeBasisPoints}
                onChange={(e) => setFeeBasisPoints(e.target.value)}
                min="0"
                max="2000"
              />
            </div>

            <div className="form-control w-full mb-4">
              <label className="label">
                <span className="label-text">Fee Collector (Optional)</span>
                <span className="label-text-alt">Leave empty to use your address</span>
              </label>
              <input
                type="text"
                placeholder="0x..."
                className="input input-bordered w-full"
                value={feeCollector}
                onChange={(e) => setFeeCollector(e.target.value)}
              />
            </div>

            <button
              className="btn btn-primary w-full"
              onClick={handleCreateToken}
              disabled={isCreatingToken || !tokenName || !tokenSymbol || !initialSupply}
            >
              {isCreatingToken ? "Creating Token..." : "Create Meme Token"}
            </button>
          </div>
        </div>

        {/* Stats and Info */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-4">Launchpad Stats</h2>
            
            <div className="stats stats-vertical w-full">
              <div className="stat">
                <div className="stat-title">Total Tokens Created</div>
                <div className="stat-value text-primary">{allTokensLength?.toString() || "0"}</div>
              </div>
              
              <div className="stat">
                <div className="stat-title">Your Tokens</div>
                <div className="stat-value text-secondary">{userTokens?.length || 0}</div>
              </div>
            </div>

            <div className="divider"></div>
            
            <div className="text-sm text-base-content/70">
              <h3 className="font-semibold mb-2">How it works:</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Create a new ERC20 token with custom name and symbol</li>
                <li>Set initial supply and transaction fees</li>
                <li>Token is immediately deployed and ready to use</li>
                <li>You can lock liquidity for added trust</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* User's Tokens */}
      {userTokens && userTokens.length > 0 && (
        <div className="mt-12">
          <h2 className="text-3xl font-bold mb-6">Your Created Tokens</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userTokens.map((tokenAddress, index) => (
              <TokenCard key={index} tokenAddress={tokenAddress} />
            ))}
          </div>
        </div>
      )}

      {/* All Tokens */}
      <div className="mt-12">
        <h2 className="text-3xl font-bold mb-6">All Created Tokens</h2>
        <AllTokensList />
      </div>
    </div>
  );
}

// Component to display individual token cards
function TokenCard({ tokenAddress }: { tokenAddress: string }) {
  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h3 className="card-title">Token</h3>
        <Address address={tokenAddress} />
        <div className="card-actions justify-end">
          <button className="btn btn-sm btn-outline">View Details</button>
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="skeleton h-4 w-full mb-2"></div>
          <div className="skeleton h-4 w-3/4 mb-2"></div>
          <div className="skeleton h-4 w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
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
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
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
          <div className="card-actions justify-end mt-4">
            <button className="btn btn-sm btn-outline">View Token</button>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error processing token data:", error);
    return (
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
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

