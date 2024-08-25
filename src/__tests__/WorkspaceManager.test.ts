import { WorkspaceManager } from '../WorkspaceManager.js';
import { vol } from 'memfs';
import { workspaceTemplate } from '../workspaceTemplate.js';

vitest.mock('node:fs', async () => {
  const { fs } = await vitest.importActual('memfs');
  return fs;
});
vitest.mock('node:os', () => ({
  homedir: () => '/home/user',
}));

describe('WorkspaceManager', () => {
  afterEach(() => {
    vitest.resetAllMocks();
    vol.reset();
  });

  describe('createWorkspace', () => {
    describe('validates workspace name', () => {
      it.each([
        'test',
        '123',
        'ABBA-1a2-r__',
      ])('"%s" is valid', (workspaceName) => {
        vol.fromJSON({
          '/home/user/': null,
        });
        const workspaceManager = new WorkspaceManager();
        workspaceManager.createWorkspace(workspaceName);
        expect(vol.existsSync(`/home/user/.aka-workspaces/${workspaceName.toLowerCase()}.toml`)).toBeTruthy();
      });

      it.each([
        'current',
        '!a',
        '//',
        'end\n',
      ])('"%s" is not valid', (workspaceName) => {
        vol.fromJSON({
          '/home/user/.aka-workspaces': null,
        });
        const workspaceManager = new WorkspaceManager();
        workspaceManager.createWorkspace(workspaceName);
        const configs = vol.readdirSync('/home/user/.aka-workspaces');
        expect(configs).toHaveLength(0);
      });
    });

    it('does not create config if it already exists', () => {
      vol.fromJSON({
        '/home/user/.aka-workspaces/test.toml': 'content',
      });
      const workspaceManager = new WorkspaceManager();
      workspaceManager.createWorkspace('test');
      const configContent = vol.readFileSync('/home/user/.aka-workspaces/test.toml', 'utf-8');
      expect(configContent).toBe('content');
    });

    it('creates workspace config file', () => {
      vol.fromJSON({
        '/home/user/.aka-workspaces': null,
      });
      const workspaceManager = new WorkspaceManager();
      workspaceManager.createWorkspace('test');
      expect(vol.readFileSync('/home/user/.aka-workspaces/test.toml', 'utf-8')).toBe(workspaceTemplate);
    });
  });

  describe('loadWorkspace', () => {
    const testWorkspaceToml = `
      sshConfig = "ssh-config-content"
      npmrc = "npmrc-content"
      mavenSettings = "maven-settings-content"
    `;

    it('loads workspace config', () => {
      vol.fromJSON({
        '/home/user/.aka-workspaces/test.toml': testWorkspaceToml,
        '/home/user/.ssh/config': '',
        '/home/user/.npmrc': '',
        '/home/user/.m2/settings.xml': '',
      });
      const workspaceManager = new WorkspaceManager();
      workspaceManager.loadWorkspace('test');
      expect(vol.readFileSync('/home/user/.ssh/config', 'utf-8')).toBe('ssh-config-content');
      expect(vol.readFileSync('/home/user/.npmrc', 'utf-8')).toBe('npmrc-content');
      expect(vol.readFileSync('/home/user/.m2/settings.xml', 'utf-8')).toBe('maven-settings-content');
    });

    it('does not load non-existing workspace', () => {
      vol.fromJSON({
        '/home/user/.aka-workspaces': null,
      });
      vol.fromJSON({
        '/home/user/.ssh/config': '',
        '/home/user/.npmrc': '',
        '/home/user/.m2/settings.xml': '',
      });
      const workspaceManager = new WorkspaceManager();
      workspaceManager.loadWorkspace('test');
      expect(vol.readFileSync('/home/user/.ssh/config', 'utf-8')).toBe('');
      expect(vol.readFileSync('/home/user/.npmrc', 'utf-8')).toBe('');
      expect(vol.readFileSync('/home/user/.m2/settings.xml', 'utf-8')).toBe('');
    });

    it('sets current workspace', () => {
      vol.fromJSON({
        '/home/user/.aka-workspaces/test.toml': testWorkspaceToml,
        '/home/user/.ssh/config': '',
        '/home/user/.npmrc': '',
        '/home/user/.m2/settings.xml': '',
      });
      const workspaceManager = new WorkspaceManager();
      workspaceManager.loadWorkspace('test');
      expect(vol.readFileSync('/home/user/.aka-workspaces/current.toml', 'utf-8')).toBe('currentWorkspace = "test"');
    });

    it('does nothing with ssh config if no sshConfig in workspace config', () => {
      const testWorkspaceToml = `
        npmrc = "npmrc-content"
        mavenSettings = "maven-settings-content"
      `;
      vol.fromJSON({
        '/home/user/.aka-workspaces/test.toml': testWorkspaceToml,
        '/home/user/.ssh/config': 'unchanged-ssh-config-content',
        '/home/user/.npmrc': '',
        '/home/user/.m2/settings.xml': '',
      });
      const workspaceManager = new WorkspaceManager();
      workspaceManager.loadWorkspace('test');
      expect(vol.readFileSync('/home/user/.ssh/config', 'utf-8')).toBe('unchanged-ssh-config-content');
      expect(vol.readFileSync('/home/user/.npmrc', 'utf-8')).toBe('npmrc-content');
      expect(vol.readFileSync('/home/user/.m2/settings.xml', 'utf-8')).toBe('maven-settings-content');
    });

    it('does nothing with npmrc if no npmrc in workspace config', () => {
      const testWorkspaceToml = `
        sshConfig = "ssh-config-content"
        mavenSettings = "maven-settings-content"
      `;
      vol.fromJSON({
        '/home/user/.aka-workspaces/test.toml': testWorkspaceToml,
        '/home/user/.ssh/config': '',
        '/home/user/.npmrc': 'unchanged-npmrc-content',
        '/home/user/.m2/settings.xml': '',
      });
      const workspaceManager = new WorkspaceManager();
      workspaceManager.loadWorkspace('test');
      expect(vol.readFileSync('/home/user/.ssh/config', 'utf-8')).toBe('ssh-config-content');
      expect(vol.readFileSync('/home/user/.npmrc', 'utf-8')).toBe('unchanged-npmrc-content');
      expect(vol.readFileSync('/home/user/.m2/settings.xml', 'utf-8')).toBe('maven-settings-content');
    });

    it('does nothing with maven settings if no mavenSettings in workspace config', () => {
      const testWorkspaceToml = `
        sshConfig = "ssh-config-content"
        npmrc = "npmrc-content"
      `;
      vol.fromJSON({
        '/home/user/.aka-workspaces/test.toml': testWorkspaceToml,
        '/home/user/.ssh/config': '',
        '/home/user/.npmrc': '',
        '/home/user/.m2/settings.xml': 'unchanged-maven-settings-content',
      });
      const workspaceManager = new WorkspaceManager();
      workspaceManager.loadWorkspace('test');
      expect(vol.readFileSync('/home/user/.ssh/config', 'utf-8')).toBe('ssh-config-content');
      expect(vol.readFileSync('/home/user/.npmrc', 'utf-8')).toBe('npmrc-content');
      expect(vol.readFileSync('/home/user/.m2/settings.xml', 'utf-8')).toBe('unchanged-maven-settings-content');
    });
  });

  describe('deleteWorkspace', () => {
    it('does not delete current workspace', () => {
      vol.fromJSON({
        '/home/user/.aka-workspaces/test.toml': '',
        '/home/user/.aka-workspaces/current.toml': 'currentWorkspace = "test"',
      });
      const workspaceManager = new WorkspaceManager();
      workspaceManager.deleteWorkspace('test');
      expect(vol.existsSync('/home/user/.aka-workspaces/test.toml')).toBeTruthy();
    });

    it('deletes workspace config', () => {
      vol.fromJSON({
        '/home/user/.aka-workspaces/test.toml': '',
        '/home/user/.aka-workspaces/current.toml': 'currentWorkspace = "another"',
      });
      const workspaceManager = new WorkspaceManager();
      workspaceManager.deleteWorkspace('test');
      expect(vol.existsSync('/home/user/.aka-workspaces/test.toml')).toBeFalsy();
    });
  });
});
