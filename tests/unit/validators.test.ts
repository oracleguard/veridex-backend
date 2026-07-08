import { isValidStellarAddress, isValidAssetPair } from "../../src/utils/validators";

describe("Validators", () => {
  it("should validate Stellar addresses", () => {
    expect(isValidStellarAddress("GABC123")).toBe(false);
  });
  
  it("should validate asset pairs", () => {
    expect(isValidAssetPair("XLM/USDC")).toBe(true);
  });
});
