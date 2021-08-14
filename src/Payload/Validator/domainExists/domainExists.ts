import DnsReturnCode from './DnsReturnCode'
import googleDnsOverHttps from './googleDnsOverHttps'

/**
 * Checks if a domain exists (resolves using DNS)
 * @param domain - string
 * @returns boolean
 */
const domainExists = async (domain: string) => {
  const dnsResult = await googleDnsOverHttps(domain)
  return dnsResult.Status === DnsReturnCode.NoError
}

export default domainExists
