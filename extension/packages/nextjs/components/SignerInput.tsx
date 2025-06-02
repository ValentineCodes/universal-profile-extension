"use client";

import { useEffect, useRef, useState } from "react";
import LoadingIndicator from "./LoadingIndicator";
import SearchProfile from "./SearchProfile";
import { Address } from "./scaffold-eth";
import { InputGroup } from "./ui/input-group";
import { Input } from "@chakra-ui/react";
import { gql, request } from "graphql-request";
import { FaCheck } from "react-icons/fa";
import { useDebounceValue } from "usehooks-ts";
import { isAddress } from "viem";
import { useAccount } from "wagmi";
import { getController } from "~~/utils/helpers";
import { notification } from "~~/utils/scaffold-eth/notification";

const ENVIO_TESTNET_URL = "https://envio.lukso-testnet.universal.tech/v1/graphql";
const ENVIO_MAINNET_URL = "https://envio.lukso-mainnet.universal.tech/v1/graphql";

interface UniversalProfileOwner {
  address: string;
  controller: string;
}

/**
 * SignerInput Component
 *
 * A searchable interface for LUKSO Universal Profiles that allows users to search and select
 * blockchain addresses associated with profiles.
 *
 * Features:
 * - Auto-search triggers when exactly 3 characters are entered
 * - Manual search available via Enter key
 * - Displays profile images with blockies fallback
 * - Shows profile name, full name, and address in results
 *
 * @component
 * @param {Object} props
 * @param {(address: `0x${string}`) => void} props.onSelectAddress - Callback function triggered when a profile is selected
 */

const gqlQuery = gql`
  query MyQuery($id: String!) {
    search_profiles(args: { search: $id }) {
      name
      fullName
      id
      profileImages(where: { error: { _is_null: true } }, order_by: { width: asc }) {
        width
        src
        url
        verified
      }
    }
  }
`;

type Profile = {
  name?: string;
  id: string;
  fullName?: string;
  profileImages?: {
    width: number;
    src: string;
    url: string;
    verified: boolean;
  }[];
};

type SearchProps = {
  placeholder?: string;
  value: string;
  onSelectAddress: (profile: UniversalProfileOwner) => void;
  showController?: boolean;
};

type ControllerReadStatus = "pending" | "resolved" | "null";

export function SignerInput({
  value,
  onSelectAddress,
  placeholder = "Enter profile name or address",
  showController = true,
}: SearchProps) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useDebounceValue("", 500);
  const [results, setResults] = useState<Profile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [controllerReadStatus, setControllerReadStatus] = useState<ControllerReadStatus>("null");
  const abortControllerRef = useRef<AbortController | null>(null);
  const [controller, setController] = useState<`0x${string}` | null>(null);
  const account = useAccount();
  const handleSearch = async () => {
    if (isAddress(query) || isAddress(debouncedQuery)) {
      return;
    }

    if (debouncedQuery === "" || query === "") {
      setResults([]);
      return;
    }

    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new AbortController for this request
    abortControllerRef.current = new AbortController();

    setIsSearching(true);
    try {
      const envioUrl = account.chainId === 4201 ? ENVIO_TESTNET_URL : ENVIO_MAINNET_URL;
      const { search_profiles: data } = (await request({
        url: envioUrl,
        document: gqlQuery,
        variables: { id: debouncedQuery },
        signal: abortControllerRef.current.signal,
      })) as {
        search_profiles: Profile[];
      };
      setResults(data);
    } catch (error: any) {
      // Only set results to empty if it's not an abort error
      if (error.name !== "AbortError") {
        console.error("Search error:", error);
        setResults([]);
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectProfile = async (address: `0x${string}`) => {
    if (!isAddress(address)) {
      notification.error("Invalid address");
      return;
    }

    setQuery(address);
    setControllerReadStatus("pending");

    const controller = await getController(address as `0x${string}`);

    setControllerReadStatus("resolved");

    onSelectAddress({ address, controller });
    setController(controller);

    setShowDropdown(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (results.length === 1) {
        handleSelectProfile(results[0].id as `0x${string}`);
      } else {
        handleSelectProfile(query as `0x${string}`);
      }
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (isAddress(value)) {
      handleSelectProfile(value as `0x${string}`);
      return;
    }

    if (controllerReadStatus !== "null") {
      setControllerReadStatus("null");
    }

    if (!value) {
      setController(null);
      setShowDropdown(false);
    } else {
      if (!isSearching) {
        setIsSearching(true);
      }

      if (!showDropdown) {
        setShowDropdown(true);
      }
    }
    setQuery(value);
    setDebouncedQuery(value);
  };

  useEffect(() => {
    if (value == controller) return;

    setQuery(value);
  }, [value]);

  useEffect(() => {
    handleSearch();
  }, [debouncedQuery, query]);

  return (
    <div className="w-full flex flex-col justify-center relative">
      {showController && controller && (
        <div className="flex items-center mb-[-0.9rem]">
          Signer: <Address address={controller} disableBlockie={true} onlyEnsOrAddress={true} />
        </div>
      )}
      <InputGroup
        endElement={
          query ? (
            controllerReadStatus === "pending" ? (
              <LoadingIndicator size="sm" />
            ) : controllerReadStatus === "resolved" ? (
              <FaCheck className="pl-2 text-2xl text-green-500" />
            ) : null
          ) : null
        }
        className="border border-gray bg-base-200 rounded text-accent w-full mt-4"
      >
        <Input
          type="text"
          placeholder={placeholder}
          className="input input-ghost focus-within:border-transparent focus:outline-none focus:bg-transparent h-[3rem] min-h-[2.2rem] px-4 border w-full font-medium placeholder:text-accent/70 text-base-content/70 focus:text-base-content/70"
          value={query}
          onChange={handleInput}
          onKeyPress={handleKeyPress}
        />
      </InputGroup>

      {showDropdown && (
        <div className="absolute top-[4.7rem] z-10 flex flex-col overflow-y-auto space-y-1 px-2 py-1 h-[3.5rem] w-full border border-gray bg-base-200 rounded text-accent shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)]">
          {isSearching ? (
            <div className="flex justify-center items-center py-4">
              <LoadingIndicator />
            </div>
          ) : results.length > 0 ? (
            results.map(result => (
              <SearchProfile key={result.id} address={result.id as `0x${string}`} onSelect={handleSelectProfile} />
            ))
          ) : (
            <div className="text-gray-400 text-center py-2">No results found</div>
          )}
        </div>
      )}
    </div>
  );
}
