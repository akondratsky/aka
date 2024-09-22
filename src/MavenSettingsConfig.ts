import { join } from 'node:path';
import { homedir } from 'node:os';
import { AbstractConfig } from './AbstractConfig.js';

export class MavenSettingsConfig extends AbstractConfig {
  constructor() {
    super(join(homedir(), '.m2', 'settings.xml'));
  }

  public apply(content?: string): void {
    if (content === '') {
      this.delete();
      return;
    }
    if (typeof content === 'string') {
      this.write(content);
    }
  }
}