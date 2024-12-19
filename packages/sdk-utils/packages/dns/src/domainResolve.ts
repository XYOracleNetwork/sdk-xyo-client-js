import { DnsRecordType } from './DnsRecordType.ts'
import { googleDnsOverHttps } from './googleDnsOverHttps.ts'

/**
 * Resolves DNS information (resolves using DNS)
 * @param domain - string
 * @returns GoogleDnsResult
 */
const domainResolve = async (domain?: string, type: DnsRecordType = DnsRecordType.A) => {
  if (domain) {
    return await googleDnsOverHttps(domain, type)
  }
}

export { domainResolve }
