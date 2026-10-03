export interface AuthenticatedUser {
  id: string;
  username: string;
  avatar: string | null;
  email?: string;
  roles: string[];
}

export interface OidcTokenResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
  refresh_token?: string;
  id_token?: string;
  scope?: string;
}

export interface OidcCallbackQuery {
  code?: string;
  error?: string;
  state?: string;
}
