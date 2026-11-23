import { LOGIN_ROUTE } from '@/constants/routes';
import { STORAGE_KEYS } from '@/constants/storageKeys';
import { TTokenPair } from '@/types/auth';

import { getCookie, removeCookie, setCookie } from './cookies';

// Matches the API's default REFRESH_TOKEN_TTL_DAYS.
const PERSISTENT_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

type TSessionTokens = Pick<TTokenPair, 'accessToken' | 'refreshToken'>;

const isPersistent = () => getCookie(STORAGE_KEYS.persistSession) === '1';

const save = (
  { accessToken, refreshToken }: TSessionTokens,
  persist: boolean,
) => {
  const options = persist ? { maxAge: PERSISTENT_MAX_AGE_SECONDS } : {};

  setCookie(STORAGE_KEYS.accessToken, accessToken, options);
  setCookie(STORAGE_KEYS.refreshToken, refreshToken, options);

  if (persist) {
    setCookie(STORAGE_KEYS.persistSession, '1', options);
  } else {
    removeCookie(STORAGE_KEYS.persistSession);
  }
};

const clear = () => {
  removeCookie(STORAGE_KEYS.accessToken);
  removeCookie(STORAGE_KEYS.refreshToken);
  removeCookie(STORAGE_KEYS.persistSession);
};

export const session = {
  getAccessToken: () => getCookie(STORAGE_KEYS.accessToken),

  getRefreshToken: () => getCookie(STORAGE_KEYS.refreshToken),

  hasSession: () =>
    Boolean(
      getCookie(STORAGE_KEYS.accessToken) ||
      getCookie(STORAGE_KEYS.refreshToken),
    ),

  start: (tokens: TSessionTokens, persist: boolean) => save(tokens, persist),

  rotate: (tokens: TSessionTokens) => save(tokens, isPersistent()),

  clear,

  end: () => {
    clear();
    window.location.replace(LOGIN_ROUTE);
  },
};
