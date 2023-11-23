export abstract class AbstractData {
  get length() {
    return this.bytes.byteLength
  }

  abstract get bytes(): ArrayBuffer

  abstract get hex(): string

  abstract get keccak256(): Buffer

  static is(value: unknown): value is AbstractData {
    return value instanceof AbstractData
  }
}
