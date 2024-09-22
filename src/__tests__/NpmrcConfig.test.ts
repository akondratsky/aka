import { NpmrcConfig } from '../NpmrcConfig.js';
import { vol } from 'memfs';

vitest.mock('node:fs', async () => {
  const { fs } = await vitest.importActual('memfs');
  return fs;
});
vitest.mock('node:os', () => ({
  homedir: () => '/home/user',
}));

describe('MavenSettingsConfig', () => {
  afterEach(() => {
    vitest.resetAllMocks();
    vol.reset();
  });

  it('clears the .npmrc if apply empty content', () => {
    vol.fromJSON({
      '/home/user/.npmrc': 'TEST',
    });
    const config = new NpmrcConfig();
    config.apply('');
    expect(vol.readFileSync('/home/user/.npmrc', { encoding: 'utf-8' })).toBe('');
  });

  it('does not change settings.xml if not defined in workspace', () => {
    vol.fromJSON({
      '/home/user/.npmrc': 'TEST',
    });
    const config = new NpmrcConfig();
    config.apply(undefined);
    expect(vol.readFileSync('/home/user/.npmrc', { encoding: 'utf-8' })).toBe('TEST');
  });

  it('writes content to settings.xml', () => {
    vol.fromJSON({
      '/home/user/.npmrc': 'TEST',
    });
    const config = new NpmrcConfig();
    config.apply('NEW_CONTENT');
    expect(vol.readFileSync('/home/user/.npmrc', { encoding: 'utf-8' })).toBe('NEW_CONTENT');
  });
});