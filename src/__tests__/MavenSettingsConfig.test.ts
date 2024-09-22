import { MavenSettingsConfig } from '../MavenSettingsConfig.js';
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

  it('deletes the settings.xml if apply empty content', () => {
    vol.fromJSON({
      '/home/user/.m2/settings.xml': 'TEST',
    });
    const config = new MavenSettingsConfig();
    config.apply('');
    expect(vol.existsSync('/home/user/.m2/settings.xml')).toBe(false);
  });

  it('does not change settings.xml if not defined in workspace', () => {
    vol.fromJSON({
      '/home/user/.m2/settings.xml': 'TEST',
    });
    const config = new MavenSettingsConfig();
    config.apply(undefined);
    expect(vol.readFileSync('/home/user/.m2/settings.xml', { encoding: 'utf-8' })).toBe('TEST');
  });

  it('writes value to the file', () => {
    vol.fromJSON({
      '/home/user/.m2/settings.xml': 'TEST',
    });
    const config = new MavenSettingsConfig();
    config.apply('NEW_CONTENT');
    expect(vol.readFileSync('/home/user/.m2/settings.xml', { encoding: 'utf-8' })).toBe('NEW_CONTENT');
  });
});