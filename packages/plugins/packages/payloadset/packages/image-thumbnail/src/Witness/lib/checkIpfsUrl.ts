import { assertEx } from '@xylabs/assert'

const allowIpfsIoRepair = true

/**
 * Returns the equivalent IPFS gateway URL for the supplied URL.
 * @param urlToCheck The URL to check
 * @returns If the supplied URL is an IPFS URL, it converts the URL to the
 * equivalent IPFS gateway URL. Otherwise, returns the original URL.
 */
export const checkIpfsUrl = (urlToCheck: string, ipfsGateway?: string): string => {
  try {
    const url = new URL(urlToCheck)
    let protocol = url.protocol
    let host = url.host
    let path = url.pathname
    const query = url.search
    if (protocol === 'ipfs:') {
      protocol = 'https:'
      host = assertEx(ipfsGateway, 'No ipfsGateway provided')
      path = url.host === 'ipfs' ? `ipfs${path}` : `ipfs/${url.host}${path}`
      const root = `${protocol}//${host}/${path}`
      return query?.length > 0 ? `${root}?${query}` : root
    } else if (allowIpfsIoRepair && protocol === 'https' && host === 'ipfs.io') {
      protocol = 'https:'
      host = assertEx(ipfsGateway, 'No ipfsGateway provided')
      const pathParts = path.split('/')
      if (pathParts[0] === 'ipfs') {
        pathParts.shift()
      }
      path = pathParts.join('/')
      const root = `${protocol}//${host}/${path}`
      return query?.length > 0 ? `${root}?${query}` : root
    } else {
      return urlToCheck
    }
  } catch (ex) {
    //const error = ex as Error
    //console.error(`${error.name}:${error.message} [${urlToCheck}]`)
    //console.log(error.stack)
    return urlToCheck
  }
}
