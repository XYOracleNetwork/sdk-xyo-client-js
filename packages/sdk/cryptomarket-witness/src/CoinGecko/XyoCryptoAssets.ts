import { PartialRecord } from '../PartialRecord'

export type XyoCryptoAssetPrices = PartialRecord<string, PartialRecord<string, number> | undefined>

/** @deprecated use XyoCryptoAssetPrices instead */
export type XyoCryptoAssets = XyoCryptoAssetPrices
