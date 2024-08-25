"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { Address as AddressType, getAddress, isAddress } from "viem";
import { hardhat } from "viem/chains";
import { normalize } from "viem/ens";
import { useAccount, useEnsAvatar, useEnsName } from "wagmi";
import { CheckCircleIcon, DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import { BlockieAvatar } from "~~/components/scaffold-eth";
import { luksoNetworks, useUniversalProfile } from "~~/contexts/UniversalProfileContext";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { getBlockExplorerAddressLink } from "~~/utils/scaffold-eth";

type AddressProps = {
  address?: AddressType;
  disableAddressLink?: boolean;
  format?: "short" | "long";
  size?: "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl";
};

const blockieSizeMap = {
  xs: 6,
  sm: 7,
  base: 8,
  lg: 9,
  xl: 10,
  "2xl": 12,
  "3xl": 15,
};

/**
 * Displays an address (or ENS) with a Blockie image and option to copy address.
 */
export const UniversalProfileAddress = ({ address, disableAddressLink, format, size = "base" }: AddressProps) => {
  const [ens, setEns] = useState<string | null>();
  const [ensAvatar, setEnsAvatar] = useState<string | null>();
  const [addressCopied, setAddressCopied] = useState(false);
  const account = useAccount();
  const { profile } = useUniversalProfile();

  const checkSumAddress = address ? getAddress(address) : undefined;

  const { targetNetwork } = useTargetNetwork();

  const { data: fetchedEns } = useEnsName({
    address: checkSumAddress,
    chainId: 1,
    query: {
      enabled: isAddress(checkSumAddress ?? ""),
    },
  });
  const { data: fetchedEnsAvatar } = useEnsAvatar({
    name: fetchedEns ? normalize(fetchedEns) : undefined,
    chainId: 1,
    query: {
      enabled: Boolean(fetchedEns),
      gcTime: 30_000,
    },
  });

  // We need to apply this pattern to avoid Hydration errors.
  useEffect(() => {
    setEns(fetchedEns);
  }, [fetchedEns]);

  useEffect(() => {
    setEnsAvatar(fetchedEnsAvatar);
  }, [fetchedEnsAvatar]);

  const isLuksoConnection = (): boolean => {
    return account.chainId == luksoNetworks[0].chainId || account.chainId == luksoNetworks[1].chainId;
  };

  // Skeleton UI
  if (!checkSumAddress) {
    return (
      <div className="animate-pulse flex space-x-4">
        <div className="rounded-md bg-slate-300 h-6 w-6"></div>
        <div className="flex items-center space-y-6">
          <div className="h-2 w-28 bg-slate-300 rounded"></div>
        </div>
      </div>
    );
  }

  if (!isAddress(checkSumAddress)) {
    return <span className="text-error">Wrong address</span>;
  }

  const blockExplorerAddressLink = getBlockExplorerAddressLink(targetNetwork, checkSumAddress);

  const renderDisplayName = () => {
    if (isLuksoConnection() && profile?.name) return profile.name;

    if (ens) return ens;

    if (format === "long") return checkSumAddress;

    return checkSumAddress?.slice(0, 6) + "..." + checkSumAddress?.slice(-4);
  };

  return (
    <div className="flex items-center flex-shrink-0">
      <div className="flex-shrink-0">
        {!profile?.profileImage || profile.profileImage.length === 0 ? (
          // show blockie if there's no profile image from Universal Profile
          <BlockieAvatar
            address={checkSumAddress}
            ensImage={ensAvatar}
            size={(blockieSizeMap[size] * 24) / blockieSizeMap["base"]}
          />
        ) : (
          <div className={`w-8 h-8 bg-gray-200 rounded-full overflow-hidden relative`}>
            {/* Profile Image */}
            <Image
              src={profile.profileImage[0].url.replace("ipfs://", "https://api.universalprofile.cloud/ipfs/")}
              alt="Profile"
              className="rounded-full"
              fill
              sizes="(max-width: 768px) 100vw"
              priority={true}
              style={{
                objectFit: "cover",
              }}
            />
          </div>
        )}
      </div>
      {disableAddressLink ? (
        <span className={`ml-1.5 text-${size} font-normal`}>{renderDisplayName()}</span>
      ) : targetNetwork.id === hardhat.id ? (
        <span className={`ml-1.5 text-${size} font-normal`}>
          <Link href={blockExplorerAddressLink}>{renderDisplayName()}</Link>
        </span>
      ) : (
        <a
          className={`ml-1.5 text-${size} font-normal`}
          target="_blank"
          href={blockExplorerAddressLink}
          rel="noopener noreferrer"
        >
          {renderDisplayName()}
        </a>
      )}
      {addressCopied ? (
        <CheckCircleIcon
          className="ml-1.5 text-xl font-normal text-sky-600 h-5 w-5 cursor-pointer flex-shrink-0"
          aria-hidden="true"
        />
      ) : (
        <CopyToClipboard
          text={checkSumAddress}
          onCopy={() => {
            setAddressCopied(true);
            setTimeout(() => {
              setAddressCopied(false);
            }, 800);
          }}
        >
          <DocumentDuplicateIcon
            className="ml-1.5 text-xl font-normal text-sky-600 h-5 w-5 cursor-pointer flex-shrink-0"
            aria-hidden="true"
          />
        </CopyToClipboard>
      )}
    </div>
  );
};
