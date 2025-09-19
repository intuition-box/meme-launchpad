import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

export interface TokenInfo {
  token: string;
  creator: string;
  name: string;
  symbol: string;
  supply: bigint;
  timestamp: bigint;
}

/**
 * Custom hook to fetch all tokens from the MemeLaunchpad contract
 * Handles both getAllTokens() and allTokens(uint256) approaches
 */
export function useAllTokens() {
  // First try to get the length
  const { data: allTokensLength, isLoading: lengthLoading, error: lengthError } = useScaffoldReadContract({
    contractName: "MemeLaunchpad",
    functionName: "allTokensLength",
    args: [],
  });

  // Try to use getAllTokens() if available (local network)
  const { data: allTokensData, isLoading: allTokensLoading, error: allTokensError } = useScaffoldReadContract({
    contractName: "MemeLaunchpad",
    functionName: "getAllTokens",
    args: [],
  });

  // If getAllTokens() works, use it
  if (allTokensData && !allTokensError) {
    return {
      data: allTokensData as TokenInfo[],
      isLoading: allTokensLoading,
      error: allTokensError,
      method: "getAllTokens"
    };
  }

  // Otherwise, we need to fetch individual tokens using allTokens(uint256)
  return {
    data: null, // Will be handled by individual token fetching
    isLoading: lengthLoading,
    error: lengthError,
    method: "allTokens",
    length: allTokensLength
  };
}

/**
 * Processes token data from contract response
 * Handles both array and object formats
 */
export function processTokenData(tokenInfo: any): TokenInfo {
  if (Array.isArray(tokenInfo)) {
    // If it's an array, map the values to the TokenInfo interface
    return {
      token: tokenInfo[0] || "",
      creator: tokenInfo[1] || "",
      name: tokenInfo[2] || "",
      symbol: tokenInfo[3] || "",
      supply: tokenInfo[4] || 0n,
      timestamp: tokenInfo[5] || 0n
    };
  } else {
    // If it's already an object, use it directly
    return tokenInfo as TokenInfo;
  }
}


