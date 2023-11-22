const hexRegex = /[0-9a-f]+/i

export type Hex = string

export type Hash = Hex

export const isHex = (value: string): value is Hex => hexRegex.test(value)
