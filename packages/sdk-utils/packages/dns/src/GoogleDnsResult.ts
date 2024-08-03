import { DnsReturnCode } from './DnsReturnCode.ts'
import { GoogleDnsResultAnswer } from './GoogleDnsResultAnswer.ts'
import { GoogleDnsResultQuestion } from './GoogleDnsResultQuestion.ts'

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
