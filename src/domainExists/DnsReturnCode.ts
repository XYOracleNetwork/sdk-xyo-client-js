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

export { DnsReturnCode }
