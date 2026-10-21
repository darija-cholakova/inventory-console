/** Body of POST /auth/login. */
export interface LoginRequest {
  username: string;
  password: string;
  /** Access token lifetime; DummyJSON defaults to 60. */
  expiresInMins?: number;
}

/** Profile fields returned by POST /auth/login. */
export interface AuthUser {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  gender: string;
  image: string;
}

/** Body of POST /auth/refresh. */
export interface RefreshRequest {
  refreshToken: string;
  expiresInMins?: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

/** POST /auth/login returns the profile and both tokens in one object. */
export type LoginResponse = AuthUser & AuthTokens;

/** What the app keeps in sessionStorage. */
export interface AuthSession {
  user: AuthUser;
  tokens: AuthTokens;
}

/** Why a sign-in attempt failed; the login page maps it to a message. */
export type LoginErrorKind = 'invalid-credentials' | 'network' | 'unknown';
