export type XyoCryptoAssetPrices = Partial<Record<string, Partial<Record<string, number> | undefined>>>

/** @deprecated use XyoCryptoAssetPrices instead */
export type XyoCryptoAssets = XyoCryptoAssetPrices
