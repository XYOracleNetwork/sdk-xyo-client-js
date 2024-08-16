import type { DnsReturnCode } from './DnsReturnCode.ts'
import type { GoogleDnsResultAnswer } from './GoogleDnsResultAnswer.ts'
import type { GoogleDnsResultQuestion } from './GoogleDnsResultQuestion.ts'

export interface GoogleDnsResult {
  AD?: boolean // Validated with DNSSEC
  Answer?: GoogleDnsResultAnswer[]
  Authority?: GoogleDnsResultAnswer[]
  CD?: boolean // DNSSEC disabled
  Comment?: string
  Question?: GoogleDnsResultQuestion[]
  RA?: boolean
  RD?: boolean
  Status?: DnsReturnCode
  TC?: boolean // Truncated
  edns_client_subnet?: string
}
