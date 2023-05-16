import { hashFileUrl } from './hashFileUrl'
import { hashHttpUrl } from './hashHttpUrl'

export const hashUrl = (url: string): Promise<string> => {
  const scheme = url.split('://')[0]?.toLowerCase()
  switch (scheme) {
    case 'file':
      return hashFileUrl(url)
    case 'http':
    case 'https':
      return hashHttpUrl(url)
    default:
      throw new Error(`Unsupported scheme: ${scheme}`)
  }
}
