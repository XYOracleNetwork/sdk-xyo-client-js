/** @deprecated use @xylabs/hex instead */
const hexRegex = /[0-9a-f]+/i

/** @deprecated use @xylabs/hex instead */
export type Hex = string

/** @deprecated use @xylabs/hex instead */
export type Hash = Hex

/** @deprecated use @xylabs/hex instead */
export const isHex = (value: string): value is Hex => hexRegex.test(value)
