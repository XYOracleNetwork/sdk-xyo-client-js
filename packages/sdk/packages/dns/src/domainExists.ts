import { DnsReturnCode } from './DnsReturnCode'
import { domainResolve } from './domainResolve'

/**
 * Checks if a domain exists (resolves using DNS)
 * @param domain - string
 * @returns boolean
 */
const domainExists = async (domain?: string) => {
  if (domain === undefined) return false
  const dnsResult = await domainResolve(domain)
  return dnsResult?.Status === DnsReturnCode.NoError
}

export { domainExists }
