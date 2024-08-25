import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { ERC725, ERC725JSONSchema } from "@erc725/erc725.js";
import lsp3ProfileSchema from "@erc725/erc725.js/schemas/LSP3ProfileMetadata.json";
import { useAccount } from "wagmi";

export const luksoNetworks = [
  {
    name: "LUKSO Mainnet",
    chainId: 42,
    rpcUrl: "https://42.rpc.thirdweb.com",
    ipfsGateway: "https://api.universalprofile.cloud/ipfs",
    explorer: "https://explorer.execution.mainnet.lukso.network/",
    token: "LYX",
  },
  {
    name: "LUKSO Testnet",
    chainId: 4201,
    rpcUrl: "https://4201.rpc.thirdweb.com",
    ipfsGateway: "https://api.universalprofile.cloud/ipfs",
    explorer: "https://explorer.execution.testnet.lukso.network/",
    token: "LYXt",
  },
];

interface Profile {
  name: string;
  description: string;
  tags: string[];
  links: Link[];
  profileImage: Image[];
  backgroundImage: Image[];
}

interface Link {
  title: string;
  url: string;
}

interface Image {
  width: number;
  height: number;
  hashFunction: string;
  hash: string;
  url: string;
}

interface UniversalProfileContextType {
  profile: Profile | null;
  setProfile: React.Dispatch<React.SetStateAction<Profile | null>>;
  issuedAssets: string[];
}

const initialUniversalProfileContextValue: UniversalProfileContextType = {
  profile: null,
  setProfile: () => {},
  issuedAssets: [],
};

// Set up the empty React context
const UniversalProfileContext = createContext<UniversalProfileContextType>(initialUniversalProfileContextValue);

/**
 * Custom hook to use the Profile context across the application.
 *
 * @returns {UniversalProfileContextType} - The profile state containing all properties.
 */
export function useUniversalProfile() {
  return useContext(UniversalProfileContext);
}

/**
 * Provider component for the Profile context, handling property checks and
 * maintaining its state during account and chain changes.
 *
 * @param children - Child components using the Profile context.
 */
export function UniversalProfileProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  // State for the Profile provider
  const account = useAccount();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [issuedAssets, setIssuedAssets] = useState<string[]>([]);

  const isLuksoConnection = (): boolean => {
    return account.chainId == luksoNetworks[0].chainId || account.chainId == luksoNetworks[1].chainId;
  };

  // Fetch and update profile data from blockchain
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!account.isConnected || !isLuksoConnection()) {
        setProfile(null);
        return;
      }

      // Get the current network properties from the list of supported networks
      const currentNetwork = luksoNetworks.find(net => net.chainId === account.chainId);

      if (!currentNetwork) {
        setProfile(null);
        return;
      }

      // Instanciate the LSP3-based smart contract
      const erc725js = new ERC725(lsp3ProfileSchema as ERC725JSONSchema[], account.address, currentNetwork.rpcUrl, {
        ipfsGateway: currentNetwork.ipfsGateway,
      });

      try {
        // Download and verify the full profile metadata
        const profileMetaData = await erc725js.fetchData("LSP3Profile");
        const lsp12IssuedAssets = await erc725js.fetchData("LSP12IssuedAssets[]");

        if (
          profileMetaData.value &&
          typeof profileMetaData.value === "object" &&
          "LSP3Profile" in profileMetaData.value
        ) {
          // Update the profile state
          setProfile(profileMetaData.value.LSP3Profile);
        }

        if (lsp12IssuedAssets.value && Array.isArray(lsp12IssuedAssets.value)) {
          // Update the issued assets state
          setIssuedAssets(lsp12IssuedAssets.value);
        }
      } catch (error) {
        console.log("Can not fetch universal profile data: ", error);
      }
    };

    fetchProfileData();
  }, [account]);

  /*
   * Accessible context properties
   * that only update on changes
   */
  const contextProperties = useMemo(
    () => ({
      profile,
      setProfile,
      issuedAssets,
    }),
    [profile, setProfile, issuedAssets],
  );

  return <UniversalProfileContext.Provider value={contextProperties}>{children}</UniversalProfileContext.Provider>;
}
