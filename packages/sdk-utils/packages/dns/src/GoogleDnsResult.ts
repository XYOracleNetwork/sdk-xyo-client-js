import { DnsReturnCode } from './DnsReturnCode.js'
import { GoogleDnsResultAnswer } from './GoogleDnsResultAnswer.js'
import { GoogleDnsResultQuestion } from './GoogleDnsResultQuestion.js'

export interface GoogleDnsResult {
  AD?: boolean //Validated with DNSSEC
  Answer?: GoogleDnsResultAnswer[]
  Authority?: GoogleDnsResultAnswer[]
  CD?: boolean //DNSSEC disabled
  Comment?: string
  Question?: GoogleDnsResultQuestion[]
  RA?: boolean
  RD?: boolean
  Status?: DnsReturnCode
  TC?: boolean //Truncated
  edns_client_subnet?: string
}
