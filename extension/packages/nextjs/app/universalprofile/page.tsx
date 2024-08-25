"use client";

import Link from "next/link";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { BugAntIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { UniversalProfileAddress } from "~~/components/UniversalProfileAddress";
import { UPRainbowKitCustomConnectButton } from "~~/components/scaffold-eth/UPRainbowKitCustomConnectButton";
import UniversalProfile from "~~/components/UniversalProfile";
import { luksoNetworks } from "~~/contexts/UniversalProfileContext";

const Home: NextPage = () => {
  const { address: connectedAddress, chainId } = useAccount();

  const isLuksoConnection = (): boolean => {
    return chainId == luksoNetworks[0].chainId || chainId == luksoNetworks[1].chainId;
  };

  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="flex flex-col px-5 items-center">
          <h1 className="text-center">
            <span className="block text-2xl mb-2">Welcome to</span>
            <span className="block text-4xl font-bold">Scaffold-ETH 2 with Universal Profiles</span>
          </h1>

          <div className="flex-grow mr-4 w-[300px]">
            <UPRainbowKitCustomConnectButton />
          </div>
          <p className="text-center text-lg">
            Replace the RainbowKit connect button in{" "}
            <code className="italic bg-base-300 text-base font-bold max-w-full break-words break-all inline-block">
              packages/nextjs/components/Header.tsx
            </code>{" "}
            with{" "}
            <code className="italic bg-base-300 text-base font-bold max-w-full break-words break-all inline-block">
              packages/nextjs/components/scaffold-eth/UPRainbowKitCustomConnectButton
            </code>
          </p>

          <div className="flex justify-center items-center space-x-2 flex-col sm:flex-row">
            <p className="my-4 font-medium">Connected Address:</p>
            <UniversalProfileAddress address={connectedAddress} />
          </div>

          {isLuksoConnection() && <UniversalProfile />}
        </div>

        <div className="flex-grow bg-base-300 w-full mt-16 px-8 py-12">
          <div className="flex justify-center items-center gap-12 flex-col sm:flex-row">
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
              <BugAntIcon className="h-8 w-8 fill-secondary" />
              <p>
                Tinker with your smart contract using the{" "}
                <Link href="/debug" passHref className="link">
                  Debug Contracts
                </Link>{" "}
                tab.
              </p>
            </div>
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
              <MagnifyingGlassIcon className="h-8 w-8 fill-secondary" />
              <p>
                Explore your local transactions with the{" "}
                <Link href="/blockexplorer" passHref className="link">
                  Block Explorer
                </Link>{" "}
                tab.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
