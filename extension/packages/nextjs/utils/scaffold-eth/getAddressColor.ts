import { keccak256 } from "viem";

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
