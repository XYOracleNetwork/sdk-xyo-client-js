import axios from 'axios'

enum DnsReturnCode {
  NoError = 0,
  QueryFormatError = 1,
  ServerFailed = 2,
  DomainDoesNotExist = 3,
  NotImplemented = 4,
  Refused = 5,
  NameShouldNotExist = 6,
  RRSetShouldNotExist = 7,
  NotAuthoratative = 8,
  NotInZone = 9,
}

enum DnsRecordType {
  A = 1,
  AAAA = 28,
  CAA = 257,
  CNAME = 5,
  DNAME = 39,
  MX = 15,
  NS = 2,
  PTR = 12,
  SOA = 6,
  SPF = 99,
  SRV = 33,
  TXT = 16,
}

interface GoogleDnsResultQuestion {
  name?: string
  type?: DnsRecordType
  cd?: boolean
  ct?: string
  do?: boolean
  edns_client_subnet?: string
  random_padding?: string
}

interface GoogleDnsResultAnswer {
  name?: string
  type?: DnsRecordType
  TTL?: number
  data?: string
}

interface GoogleDnsResult {
  Status?: DnsReturnCode
  TC?: boolean //Truncated
  RD?: boolean
  RA?: boolean
  AD?: boolean //Validated with DNSSEC
  CD?: boolean //DNSSEC disabled
  Question?: GoogleDnsResultQuestion[]
  Answer?: GoogleDnsResultAnswer[]
  Authority?: GoogleDnsResultAnswer[]
  Comment?: string
  edns_client_subnet?: string
}

const googleDnsOverHttps = async (name: string) => {
  return (await axios.get<GoogleDnsResult>(`https://dns.google/resolve?name=${name}`)).data
}

export { googleDnsOverHttps }
