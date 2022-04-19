import { DnsReturnCode } from './DnsReturnCode'
import { googleDnsOverHttps } from './googleDnsOverHttps'

/**
 * Checks if a domain exists (resolves using DNS)
 * @param domain - string
 * @returns boolean
 */
const domainExists = async (domain?: string) => {
  if (domain === undefined) return false
  const dnsResult = await googleDnsOverHttps(domain)
  return dnsResult.Status === DnsReturnCode.NoError
}

export { domainExists }
