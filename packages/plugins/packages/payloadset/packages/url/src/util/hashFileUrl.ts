import { createHash } from 'crypto'
import { createReadStream } from 'fs'

export const hashFileUrl = (url: string): Promise<string> => {
  const ret = new Promise<string>((resolve, reject) => {
    const hash = createHash('sha256')
    const stream = createReadStream(url)
    stream.on('data', (data) => {
      hash.update(data)
    })
    stream.on('end', () => {
      resolve(hash.digest('hex'))
    })
    stream.on('error', (err) => {
      reject(err)
    })
  })
  return ret
}
