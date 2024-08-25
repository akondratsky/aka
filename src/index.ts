import { program, Command } from 'commander';
import { WorkspaceManager } from './WorkspaceManager.js';

const workspaceManager = new WorkspaceManager();

program
  .name('aka')
  .usage('<workspace>')
  .description('Switch between different configurations of your workspace');

const workspaceCommand = new Command('workspace');

workspaceCommand.command('create <workspaceName>')
  .description('Create new workspace configuration')
  .usage('<workspaceName>')
  .action((workspaceName) => {
    workspaceManager.createWorkspace(workspaceName);
  });

workspaceCommand.command('delete <workspaceName>')
  .description('Delete workspace configuration')
  .usage('<workspaceName>')
  .action((workspaceName) => {
    workspaceManager.deleteWorkspace(workspaceName);
  });

workspaceCommand.command('path <workspaceName>')
  .description('Print path to the workspace configuration. Can be used in scripts')
  .usage('<workspaceName>')
  .action((workspaceName) => {
    workspaceManager.printWorkspacePath(workspaceName);
  });

workspaceCommand.command('list')
  .description('Print list of existing workspaces')
  .usage('')
  .action(() => {
    workspaceManager.printWorkspacesList();
  });

program.addCommand(workspaceCommand);

program
  .command('current')
  .usage('')
  .action(() => {
    workspaceManager.printCurrentWorkspace();
  });

program
  .arguments('<workspace>')
  .usage('<workspace>')
  .action((workspaceName) => {
    workspaceManager.loadWorkspace(workspaceName);
  });

program.parse(process.argv);
