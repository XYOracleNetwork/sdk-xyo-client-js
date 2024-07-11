import { DnsRecordType } from './DnsRecordType.js'

export interface GoogleDnsResultAnswer {
  TTL?: number
  data?: string
  name?: string
  type?: DnsRecordType
}
