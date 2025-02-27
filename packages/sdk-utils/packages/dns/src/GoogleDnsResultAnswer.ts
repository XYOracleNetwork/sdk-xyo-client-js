import type { DnsRecordType } from './DnsRecordType.ts'

export interface GoogleDnsResultAnswer {
  TTL?: number
  data?: string
  name?: string
  type?: DnsRecordType
}
