import { SshConfig } from '../SshConfig.js';
import { vol } from 'memfs';

vitest.mock('node:fs', async () => {
  const { fs } = await vitest.importActual('memfs');
  return fs;
});
vitest.mock('node:os', () => ({
  homedir: () => '/home/user',
}));

describe('SshConfig', () => {
  afterEach(() => {
    vitest.resetAllMocks();
    vol.reset();
  });

  it('clears the ssh config if apply empty content', () => {
    vol.fromJSON({
      '/home/user/.ssh/config': 'TEST',
    });
    const config = new SshConfig();
    config.apply('');
    expect(vol.readFileSync('/home/user/.ssh/config', { encoding: 'utf-8' })).toBe('');
  });

  it('does not change ssh config if not defined in workspace', () => {
    vol.fromJSON({
      '/home/user/.ssh/config': 'TEST',
    });
    const config = new SshConfig();
    config.apply(undefined);
    expect(vol.readFileSync('/home/user/.ssh/config', { encoding: 'utf-8' })).toBe('TEST');
  });

  it('writes content to .npmrc', () => {
    vol.fromJSON({
      '/home/user/.ssh/config': 'TEST',
    });
    const config = new SshConfig();
    config.apply('NEW_CONTENT');
    expect(vol.readFileSync('/home/user/.ssh/config', { encoding: 'utf-8' })).toBe('NEW_CONTENT');
  });
});