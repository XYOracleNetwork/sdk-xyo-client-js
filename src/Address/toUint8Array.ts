export const toUint8Array = (value: string | Uint8Array) => {
  if (typeof value === 'string') {
    return Uint8Array.from(Buffer.from(value, 'hex'))
  } else {
    return value
  }
}
