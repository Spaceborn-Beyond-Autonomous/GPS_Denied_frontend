import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  organization: string;
}

interface StoredUser extends AuthUser {
  passwordHash: string;
  passwordSalt: string;
}

interface AuthResult {
  user: AuthUser;
  token: string;
}

const users = new Map<string, StoredUser>();
const sessions = new Map<string, string>();

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function hashPassword(password: string, salt: string) {
  return scryptSync(password, salt, 64).toString('hex');
}

function toPublicUser(user: StoredUser): AuthUser {
  const { passwordHash: _passwordHash, passwordSalt: _passwordSalt, ...publicUser } = user;
  return publicUser;
}

function createToken() {
  return randomBytes(32).toString('hex');
}

export function registerUser(input: {
  name: string;
  email: string;
  password: string;
  organization: string;
}): AuthResult {
  const email = normalizeEmail(input.email);
  if (users.has(email)) {
    throw new Error('An account with this email already exists.');
  }

  const passwordSalt = randomBytes(16).toString('hex');
  const user: StoredUser = {
    id: `usr-${randomBytes(8).toString('hex')}`,
    name: input.name.trim(),
    email,
    organization: input.organization.trim(),
    passwordSalt,
    passwordHash: hashPassword(input.password, passwordSalt),
  };

  users.set(email, user);
  const token = createToken();
  sessions.set(token, email);
  return { user: toPublicUser(user), token };
}

export function authenticateUser(emailInput: string, password: string): AuthResult {
  const email = normalizeEmail(emailInput);
  const user = users.get(email);
  if (!user) {
    throw new Error('Invalid email or password.');
  }

  const expected = Buffer.from(user.passwordHash, 'hex');
  const actual = Buffer.from(hashPassword(password, user.passwordSalt), 'hex');
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    throw new Error('Invalid email or password.');
  }

  const token = createToken();
  sessions.set(token, email);
  return { user: toPublicUser(user), token };
}

export function getUserForToken(token: string | undefined) {
  const email = token ? sessions.get(token) : undefined;
  const user = email ? users.get(email) : undefined;
  return user ? toPublicUser(user) : null;
}

export function revokeToken(token: string | undefined) {
  if (token) sessions.delete(token);
}

export function createRequestFingerprint(value: string) {
  return createHash('sha256').update(value).digest('hex');
}