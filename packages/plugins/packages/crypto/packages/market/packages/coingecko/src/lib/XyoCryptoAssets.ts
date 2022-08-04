import { PartialRecord } from '@xylabs/sdk-js'

export type XyoCryptoAssetPrices = PartialRecord<string, PartialRecord<string, number> | undefined>

/** @deprecated use XyoCryptoAssetPrices instead */
export type XyoCryptoAssets = XyoCryptoAssetPrices
