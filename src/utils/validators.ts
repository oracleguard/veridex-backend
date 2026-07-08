export function isValidStellarAddress(addr: string): boolean {
  return addr.startsWith("G") && addr.length === 56;
}

export function isValidAssetPair(pair: string): boolean {
  return /^[A-Z]{3,12}\/[A-Z]{3,12}$/.test(pair);
}
