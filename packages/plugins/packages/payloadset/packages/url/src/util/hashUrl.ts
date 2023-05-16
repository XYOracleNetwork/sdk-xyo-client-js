import { hashFile } from './hashFile'
import { hashHttpUrl } from './hashHttpUrl'

export const hashUrl = (url: string): Promise<string> => {
  const scheme = url.split('://')[0]?.toLowerCase()
  switch (scheme) {
    case 'file':
      return hashFile(url)
    case 'http':
    case 'https':
      return hashHttpUrl(url)
    default:
      throw new Error(`Unsupported URL scheme: ${scheme}`)
  }
}
