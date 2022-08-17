import { v4 } from 'uuid'

export const uuid = () => {
  try {
    return v4()
  } catch {
    //generally if no crypto library support
    const bytes: number[] = []
    for (let i = 0; i < 16; i++) {
      bytes.push(Math.floor(Math.random() * 256))
    }
    console.log(`bytes: ${JSON.stringify(bytes)}`)
    return `${bytes[0].toString(16)}${bytes[1].toString(16)}${bytes[2].toString(16)}${bytes[3].toString(16)}-${bytes[4].toString(
      16,
    )}${bytes[5].toString(16)}-${bytes[6].toString(16)}${bytes[7].toString(16)}-${bytes[8].toString(16)}${bytes[9].toString(16)}-${bytes[10].toString(
      16,
    )}${bytes[11].toString(16)}${bytes[12].toString(16)}${bytes[13].toString(16)}${bytes[14].toString(16)}${bytes[15].toString(16)}`
  }
}
