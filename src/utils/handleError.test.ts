import { AxiosError, AxiosHeaders } from 'axios';
import { describe, expect, it } from 'vitest';

import { getFieldErrors, handleError } from './handleError';

const DEFAULT_MESSAGE = 'Houve um imprevisto, tente novamente mais tarde';

const buildAxiosError = (data: unknown, status = 400) =>
  new AxiosError(
    `Request failed with status code ${status}`,
    'ERR_BAD_REQUEST',
    undefined,
    undefined,
    {
      data,
      status,
      statusText: 'Bad Request',
      headers: {},
      config: { headers: new AxiosHeaders() },
    },
  );

const validationProblem = {
  type: 'about:blank',
  title: 'Unprocessable Entity',
  status: 422,
  detail: 'Dados inválidos',
  instance: '/v1/auth/register',
  errors: [
    { pointer: '#/email', detail: 'E-mail inválido' },
    { pointer: '#/address/zipCode', detail: 'CEP inválido' },
  ],
};

describe('handleError', () => {
  it('returns plain strings directly', () => {
    expect(handleError('Sessão expirada')).toBe('Sessão expirada');
  });

  it('extracts detail from RFC 9457 Problem Details responses', () => {
    expect(
      handleError(
        buildAxiosError(
          {
            type: 'about:blank',
            title: 'Unauthorized',
            status: 401,
            detail: 'E-mail ou senha incorretos',
            instance: '/v1/auth/login',
          },
          401,
        ),
      ),
    ).toBe('E-mail ou senha incorretos');
  });

  it('accepts response data as a plain string', () => {
    expect(handleError(buildAxiosError('Falha no servidor'))).toBe(
      'Falha no servidor',
    );
  });

  it('falls back to the default message when the response has no detail', () => {
    expect(handleError(buildAxiosError({}))).toBe(DEFAULT_MESSAGE);
    expect(handleError(buildAxiosError(null))).toBe(DEFAULT_MESSAGE);
  });

  it('never shows the generic Axios message', () => {
    expect(
      handleError(buildAxiosError({ title: 'Bad Request' })),
    ).not.toContain('Request failed with status code');
  });

  it('returns Error.message for standard Error instances', () => {
    expect(handleError(new Error('Sem conexão com a internet!'))).toBe(
      'Sem conexão com a internet!',
    );
  });
});

describe('getFieldErrors', () => {
  it('maps JSON pointers to form field paths', () => {
    expect(getFieldErrors(buildAxiosError(validationProblem, 422))).toEqual({
      email: 'E-mail inválido',
      'address.zipCode': 'CEP inválido',
    });
  });

  it('returns an empty object when the error has no field errors', () => {
    expect(
      getFieldErrors(buildAxiosError({ detail: 'Não encontrado' })),
    ).toEqual({});
    expect(getFieldErrors(new Error('boom'))).toEqual({});
  });
});
