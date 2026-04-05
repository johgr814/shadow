import { describe, expect, it } from 'vitest';
import { getApplicationTitle } from '../../src/frontend/title';
import { createApplicationName } from '../../src/shared/domain/applicationName';

describe('getApplicationTitle', () => {
  it('returns expected application title', () => {
    expect(getApplicationTitle()).toBe('Shadow Configuration Server');
  });

  it('throws when application name is empty', () => {
    expect(() => createApplicationName('')).toThrow(
      'Application name must not be empty.',
    );
  });
});
