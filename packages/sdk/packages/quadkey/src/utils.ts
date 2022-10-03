import { Buffer } from 'buffer/'

export const padHex = (hex: string, byteCount?: number) => {
  let result = hex
  if (hex.length % 2 !== 0) {
    result = `0${hex}`
  }
  if (byteCount) {
    while (result.length / 2 < byteCount) {
      result = `00${result}`
    }
  }
  return result
}

export const bitShiftLeft = (buffer: Buffer) => {
  const shifted = Buffer.alloc(buffer.length)
  const last = buffer.length - 1
  for (let index = 0; index < last; index++) {
    shifted[index] = buffer[index] << 1
    if (buffer[index + 1] & 0x80) {
      shifted[index] += 0x01
    }
  }
  shifted[last] = buffer[last] << 1
  return shifted
}

export const bitShiftRight = (buffer: Buffer) => {
  const shifted = Buffer.alloc(buffer.length)
  const last = buffer.length - 1
  for (let index = last; index > 0; index--) {
    shifted[index] = buffer[index] >> 1
    if (buffer[index - 1] & 0x01) {
      shifted[index] += 0x80
    }
  }
  shifted[0] = buffer[0] >> 1
  return shifted
}
