import { Crypto } from '@xylabs/crypto'
import http from 'http'
import https from 'https'

export const hashHttpUrl = (url: string): Promise<string> => {
  const ret = new Promise<string>((resolve, reject) => {
    const hash = Crypto.createHash('sha256')
    const lib = url.startsWith('https') ? https : http
    lib
      .get(url, (res) => {
        res.on('data', (data) => {
          hash.update(data)
        })
        res.on('end', () => {
          resolve(hash.digest('hex'))
        })
      })
      .on('error', (err) => {
        reject(err)
      })
  })
  return ret
}
