interface XyoAddressesJson {
  addresses: string[]
}

type WithXyoAddresses<T> = T & XyoAddressesJson

export type { WithXyoAddresses, XyoAddressesJson }
