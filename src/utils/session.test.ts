import { afterEach, describe, expect, it } from 'vitest';

import { STORAGE_KEYS } from '@/constants/storageKeys';

import { getCookie } from './cookies';
import { session } from './session';

const firstPair = { accessToken: 'access-1', refreshToken: 'refresh-1' };
const rotatedPair = { accessToken: 'access-2', refreshToken: 'refresh-2' };

describe('session', () => {
  afterEach(() => {
    session.clear();
  });

  it('stores both tokens even when the session is not persisted', () => {
    session.start(firstPair, false);

    expect(session.getAccessToken()).toBe('access-1');
    expect(session.getRefreshToken()).toBe('refresh-1');
    expect(getCookie(STORAGE_KEYS.persistSession)).toBeUndefined();
  });

  it('keeps a persisted session persisted after the refresh token rotates', () => {
    session.start(firstPair, true);
    session.rotate(rotatedPair);

    expect(session.getRefreshToken()).toBe('refresh-2');
    expect(getCookie(STORAGE_KEYS.persistSession)).toBe('1');
  });

  it('keeps a browser-session login non-persisted after rotation', () => {
    session.start(firstPair, false);
    session.rotate(rotatedPair);

    expect(session.getAccessToken()).toBe('access-2');
    expect(getCookie(STORAGE_KEYS.persistSession)).toBeUndefined();
  });

  it('clears every session cookie', () => {
    session.start(firstPair, true);
    session.clear();

    expect(session.hasSession()).toBe(false);
    expect(getCookie(STORAGE_KEYS.persistSession)).toBeUndefined();
  });
});
