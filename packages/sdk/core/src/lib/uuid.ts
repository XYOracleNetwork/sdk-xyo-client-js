import { stringify, v4 } from 'uuid'

export const uuid = () => {
  try {
    return v4()
  } catch {
    //generally if no crypto library support
    const bytes: number[] = []
    for (let i = 0; i < 16; i++) {
      bytes.push(Math.floor(Math.random() * 256))
    }
    return stringify(bytes)
  }
}
