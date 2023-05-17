import { createHash } from 'crypto'
import { createReadStream } from 'fs'
import { fileURLToPath } from 'url'

export const hashFile = (url: string): Promise<string> => {
  const path = url.startsWith('file://') ? fileURLToPath(url) : url
  const ret = new Promise<string>((resolve, reject) => {
    const hash = createHash('sha256')
    const stream = createReadStream(path)
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
