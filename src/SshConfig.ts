import { join } from 'node:path';
import { homedir } from 'node:os';
import { AbstractConfig } from './AbstractConfig.js';
import { execSync } from 'node:child_process';

export class SshConfig extends AbstractConfig {
  constructor() {
    super(join(homedir(), '.ssh', 'config'));
  }

  public apply(content?: string): void {
    if (typeof content === 'string') {
      execSync('ssh-add -D');
      this.write(content);
    }
  }
}
