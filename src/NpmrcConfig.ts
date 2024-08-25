import { join } from 'node:path';
import { homedir } from 'node:os';
import { AbstractConfig } from './AbstractConfig.js';

export class NpmrcConfig extends AbstractConfig {
  constructor() {
    super(join(homedir(), '.npmrc'));
  }
}
