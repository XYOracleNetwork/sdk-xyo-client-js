export interface PasswordHasher<TUser> {
  hash(password: string): Promise<string>
  verify(user: TUser, providedPassword: string): Promise<boolean>
}
