# aka-workspace AKA aka

aka-workspace is a minimalistic utility tool that provides switching between different "workspaces" with re-configuration:

- NPM in `~/.npmrc`
- Maven in `~/.m2/settings.xml`
- SSH settings in `~/.ssh/config`

## How to use

Install:

```sh
npm i -g aka-workspace
```

aka-workspace is created with [commander](https://www.npmjs.com/package/commander), use `--help` option to read about commands.

```sh
aka workspace create <workspace-name> # create TOML file
aka workspace delete <workspace-name> # delete TOML file
aka workspace path <workspace-name> # useful to run with your editor, for example: nano $(aka workspace path some-name)
aka workspace list # returns list of available workspaces
aka current # prints name of the current workspace name
aka <workspace-name> # switches to workspace with current name
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

Aka rewrites the configuration files with the content from workspace configuration.

All the fields are optional. If the field is not presented, the correspondent file (ssh config, npmrc or maven settings) will stay untouched when switching to the workspace.

If field is an empty string, the file will be rewritten (NPM, SSH) or deleted (Maven's `settings.xml`).


## Anything else?

Create an [issue](https://github.com/akondratsky/aka/issues) or message me in [LinkedIn](https://www.linkedin.com/in/aleksandr-kondratskii/)
