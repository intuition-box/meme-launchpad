import { type Chain } from 'viem';

// Extend Chain type to include contracts and optional network
interface CustomChain extends Chain {
  contracts: {
    memeLaunchpad: {
      address: `0x${string}`;
    };
  };
  network?: string; // optional custom field
}

export const customChain: CustomChain = {
  id: 13579,
  name: "Intuition Testnet",
  nativeCurrency: { name: "Trust", symbol: "TTRUST", decimals: 18 },
  rpcUrls: { default: { http: ["https://testnet.rpc.intuition.systems/"] } },
  blockExplorers: { default: { name: "Explorer", url: "https://intuition-testnet.explorer.caldera.xyz/" } },
  testnet: true,
  contracts: {
    memeLaunchpad: {
      address: "0x5AD8aa8C13D7F4aC7D2Fe3a82F4fAfe894B5e031",
    },
  },
  network: "trustchain", // now allowed because of the optional field in CustomChain
};
