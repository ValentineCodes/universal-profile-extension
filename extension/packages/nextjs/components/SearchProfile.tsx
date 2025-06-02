import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { BlockieAvatar } from "./scaffold-eth";
import { ERC725, ERC725JSONSchema } from "@erc725/erc725.js";
import lsp3ProfileSchema from "@erc725/erc725.js/schemas/LSP3ProfileMetadata.json";
import { useAccount } from "wagmi";
import { Profile as ProfileType, luksoNetworks } from "~~/contexts/UniversalProfileContext";
import { getFirst4Hex, truncateAddress, truncateString } from "~~/utils/helpers";
import { getAddressColor } from "~~/utils/scaffold-eth/getAddressColor";

type Props = {
  address: `0x${string}`;
  onSelect: (address: `0x${string}`) => void;
};

export default function SearchProfile({ address, onSelect }: Props) {
  const [profile, setProfile] = useState<ProfileType | null>(null);

  const account = useAccount();

  useEffect(() => {
    (async () => {
      try {
        const network = account.chainId === luksoNetworks[0].chainId ? luksoNetworks[0] : luksoNetworks[1];

        // Instanciate the LSP3-based smart contract
        const erc725js = new ERC725(lsp3ProfileSchema as ERC725JSONSchema[], address, network.rpcUrl, {
          ipfsGateway: network.ipfsGateway,
        });

        const profileMetadata = await erc725js.fetchData("LSP3Profile");

        if (
          profileMetadata.value &&
          typeof profileMetadata.value === "object" &&
          "LSP3Profile" in profileMetadata.value
        ) {
          setProfile(profileMetadata.value.LSP3Profile);
        }
      } catch (error) {
        console.error("Cannot fetch Hero data", error);
      }
    })();
  }, [address]);

  return (
    <button
      className="flex items-center hover:bg-gray-100 px-4 py-2 rounded-lg duration-200"
      onClick={() => onSelect(address)}
    >
      <div className="flex items-center space-x-2 h-8">
        <div className="w-5 aspect-square rounded-full" style={{ backgroundColor: getAddressColor(address) }}>
          <Link href={`https://universaleverything.io/${address}`} target="_blank">
            {!profile?.profileImage || profile.profileImage.length === 0 ? (
              <BlockieAvatar
                address={address}
                // @ts-ignore
                size={"100%"}
              />
            ) : (
              <div className="relative w-5 aspect-square rounded-full object-cover">
                <Image
                  src={profile.profileImage[0].url.replace("ipfs://", "https://api.universalprofile.cloud/ipfs/")}
                  alt="Profile"
                  fill
                  className="rounded-full"
                />
              </div>
            )}
          </Link>
        </div>

        <strong className="text-xs text-accent font-bold">
          {profile ? `@${truncateString(profile.name, 50)}` : truncateAddress(address)}
          {profile && <span className="text-purple-400 whitespace-nowrap">#{getFirst4Hex(address)}</span>}
        </strong>
      </div>
    </button>
  );
}
