# aka-workspace AKA aka

## What it is

aka-workspace is a minimalistic utility tool that provides switching between different "workspaces" with re-configuration:

- NPM repositories
- Maven repositories
- GitHub accounts

## Commands

aka-workspace is created with [commander](https://www.npmjs.com/package/commander), use `--help` option to read about commands.

```sh
aka workspace create [workspace-name] # create TOML file
aka workspace delete [workspace-name] # delete TOML file
aka workspace path [workspace-name] # useful to run with your editor, for example: nano $(aka workspace path some-name)
aka workspace list # returns list of available workspaces
aka current # prints name of the current workspace name
aka [workspace-name] # switches to workspace with current name
```

## How configuration looks like and how it is applied

Configuration looks like this:

```toml
sshConfig = """
# your ~/.ssh/config file content for the workspace is here:
"""

npmrc = """
# your .npmrc content is here
"""

mavenSettings = """
<!-- your ~/.m2/settings.xml is here -->
"""
```

All the fields are optional. If the field is not presented, the correspondent file will stay untouched when switching to the workspace.

## Anything else?

Create an [issue](https://github.com/akondratsky/aka/issues) or message me in [LinkedIn](https://www.linkedin.com/in/aleksandr-kondratskii/)
