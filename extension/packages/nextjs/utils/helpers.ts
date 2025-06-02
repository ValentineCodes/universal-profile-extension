import { ERC725 } from "@erc725/erc725.js";
// This contains the schemas of the data keys:
// - AddressPermissions[] -> list of controllers
// - `AddressPermission:Permissions:<controller-address> -> permission of a specific controller
import LSP6Schema from "@erc725/erc725.js/schemas/LSP6KeyManager.json";
import { keccak256 } from "viem";

/**
 * Helper function to get the first 4 hex characters of an Lukso wallet address,
 * excluding the '0x' prefix.
 *
 * @param {string} address - The Lukso wallet address.
 * @returns {string} - The first 4 hex characters of the wallet address (without '0x').
 * @throws Will throw an error if the address is invalid or too short.
 */
export function getFirst4Hex(address: string): string {
  // Ensure the address is valid and has the expected length
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    throw new Error("Invalid Lukso address");
  }

  // Remove '0x' prefix and return the first 4 characters
  return address.slice(2, 6);
}

/**
 * Truncates an Lukso address for better readability.
 *
 * Example:
 * ```
 * truncateAddress("0x1234567890abcdef1234567890abcdef12345678");
 * // Output: "0x1234...5678"
 * ```
 *
 * @param {string} address - The full Lukso address.
 * @returns {string} The truncated address in the format "0x1234...5678".
 */
export const truncateAddress = (address: string): string => {
  if (!address || address.length < 10) return address; // Return as is if too short
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

/**
 * Generates a deterministic hex color code from an Ethereum address.
 *
 * This function ensures that every Ethereum address corresponds to a unique color.
 * It does so by:
 * 1. Validating the Ethereum address format.
 * 2. Hashing the address using `keccak256` to introduce randomness.
 * 3. Extracting the first 6 hex characters from the hash to form a valid hex color code.
 *
 * @param address - The Ethereum address (42-character hex string starting with `0x`).
 * @returns A 6-character hex color code prefixed with `#` (e.g., `#a3b4c5`).
 * @throws If the input is not a valid Ethereum address.
 *
 * @example
 * ```ts
 * const color = getAddressColor("0x5AEDA56215b167893e80B4fE645BA6d5Bab767DE");
 * console.log(color); // Example output: #a3b4c5
 * ```
 */
export function getAddressColor(address: `0x${string}`): string {
  // Regular expression to validate an Ethereum address
  const addressRegex = /^0x[a-fA-F0-9]{40}$/;

  // Ensure the input is a valid Ethereum address
  if (!addressRegex.test(address)) {
    throw new Error("Invalid Ethereum address");
  }

  // Compute the keccak256 hash of the address
  const hash: string = keccak256(address);

  // Extract the first 6 hex characters from the hash (ignore the '0x' prefix)
  const color: string = `#${hash.slice(2, 8)}`;

  return color;
}

/**
 * Truncates a string to a specified maximum length, appending '...' if truncated.
 *
 * @param {string} str - The string to truncate
 * @param {number} maxLength - The maximum length of the string before truncation
 * @returns {string} The truncated string with '...' if it exceeds maxLength
 *
 * @example
 * ```ts
 * truncateString("This is a very long string", 10);
 * // Output: "This is a..."
 * ```
 */
export const truncateString = (str: string, maxLength: number): string => {
  if (!str || str.length <= maxLength) return str;
  return `${str.slice(0, maxLength)}...`;
};

interface AddressPermission {
  key: string;
  name: string;
  value: `0x${string}`[];
}

export async function getController(address: `0x${string}`): Promise<`0x${string}`> {
  try {
    const erc725 = new ERC725(LSP6Schema, address, "https://rpc.testnet.lukso.network");

    // Get the list of addresses that have permissions on the Universal Profile
    const controllerAddresses = (await erc725.getData("AddressPermissions[]")) as AddressPermission;

    if (!controllerAddresses) {
      return address;
    } else {
      return controllerAddresses.value[1] as `0x${string}`;
    }
  } catch (error) {
    return address;
  }
}
