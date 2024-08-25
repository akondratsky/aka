import { join } from 'node:path';
import { mkdirSync, existsSync, writeFileSync, unlinkSync, readdirSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { parse, stringify } from 'smol-toml';
import { workspaceTemplate } from './workspaceTemplate.js';
import { SshConfig } from './SshConfig.js';
import { NpmrcConfig } from './NpmrcConfig.js';
import { MavenSettingsConfig } from './MavenSettingsConfig.js';

type CurrentWorkspaceConfig = {
  currentWorkspace: string;
};

type WorkspaceConfig = {
  sshConfig: string;
  npmrc: string;
  mavenSettings: string;
};

export class WorkspaceManager {
  /** Create workspace configuration */
  public createWorkspace(workspaceName: string): void {
    if (!this.checkIsValidWorkspaceName(workspaceName)) {
      return;
    }
    const workspacePath = this.getWorkspaceConfigFilePath(workspaceName);
    if (existsSync(workspacePath)) {
      console.log(`File ${workspacePath} already exists!`);
      return;
    }
    writeFileSync(workspacePath, workspaceTemplate);
    console.log(`Workspace "${workspaceName}" created! Edit the configuration file:`);
    console.log(workspacePath);
  }


  /** Load workspace configuration by name */
  public loadWorkspace(workspaceName: string): void {
    const workspaceConfigPath = this.getWorkspaceConfigFilePath(workspaceName);
    if (!existsSync(workspaceConfigPath)) {
      console.log(`Workspace does not exist: ${workspaceName}`);
      return;
    }
    const content = readFileSync(workspaceConfigPath, 'utf-8');
    const { mavenSettings, npmrc, sshConfig } = parse(content) as WorkspaceConfig;
    if (sshConfig) {
      new SshConfig().write(sshConfig);
    }
    if (npmrc) {
      new NpmrcConfig().write(npmrc);
    }
    if (mavenSettings) {
      new MavenSettingsConfig().write(mavenSettings);
    }

    this.setCurrentWorkspace(workspaceName);
    console.log(`Workspace loaded: ${workspaceName}`);
  }


  /** Delete workspace configuration by name */
  public deleteWorkspace(workspaceName: string): void {
    const currentWorkspace = this.getCurrentWorkspace();
    if (workspaceName === currentWorkspace) {
      console.log('Cannot delete current workspace!');
      return;
    }
    const workspacePath = this.getWorkspaceConfigFilePath(workspaceName);
    if (!existsSync(workspacePath)) {
      console.log(`File ${workspacePath} does not exist!`);
      return;
    }
    unlinkSync(workspacePath);
  }


  /**
   * Print list of existing workspaces
   */
  public printWorkspacesList(): void {
    const configDir = this.getConfigDirectory();
    const files = readdirSync(configDir)
      .filter(file => file.endsWith('.toml'))
      .map((file) => file.replace('.toml', ''));
    if (!files.length) {
      console.log('No workspaces found.');
      return;
    }
    console.log('Workspaces:');
    files.forEach((file) => {
      console.log(`- ${file}`);
    });
  }


  /**
   * Print path to the workspace configuration. Can be used in scripts
   */
  public printWorkspacePath(workspaceName: string): void {
    const workspaceConfigPath = this.getWorkspaceConfigFilePath(workspaceName);
    if (!existsSync(workspaceConfigPath)) {
      console.log(`Workspace ${workspaceName} does not exist!`);
      return;
    }
    console.log(workspaceConfigPath);
  }


  /**
   * Print current workspace
   */
  public printCurrentWorkspace(): void {
    const currentWorkspace = this.getCurrentWorkspace();
    if (!currentWorkspace) {
      console.log('No current workspace set');
      return;
    }
    console.log('Current workspace:', currentWorkspace);
  }


  private getConfigDirectory(): string {
    const configDir = join(homedir(), '.aka-workspaces');
    if (!existsSync(configDir)) {
      mkdirSync(configDir);
    }
    return configDir;
  }

  private getWorkspaceConfigFilePath(workspaceName: string): string {
    const configDir = this.getConfigDirectory();
    return join(configDir, `${workspaceName.toLowerCase()}.toml`);
  }

  private getCurrentWorkspaceConfigPath(): string {
    return join(this.getConfigDirectory(), 'current.toml');
  }

  private setCurrentWorkspace(workspaceName: string) {
    const currentWorkspacePath = this.getCurrentWorkspaceConfigPath();
    writeFileSync(currentWorkspacePath, stringify({
      currentWorkspace: workspaceName,
    } as CurrentWorkspaceConfig));
  }

  private getCurrentWorkspace(): string | null {
    const currentWorkspacePath = this.getCurrentWorkspaceConfigPath();
    if (!existsSync(currentWorkspacePath)) {
      return null;
    }
    const content = readFileSync(currentWorkspacePath, 'utf-8');
    const { currentWorkspace } = parse(content) as CurrentWorkspaceConfig;
    return currentWorkspace;
  }

  private checkIsValidWorkspaceName(workspaceName: string): boolean {
    if (workspaceName.toLowerCase() === 'current') {
      console.log('Workspace name "current" is reserved!');
      return false;
    }
    if (/^[a-zA-Z0-9_-]+$/.test(workspaceName)) {
      return true;
    }
    console.log('Workspace name can only contain letters, numbers, dashes and underscores');
    return false;
  }
}
