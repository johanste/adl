# Installing ADL to project local path

This sample shows how to install ADL locally to a project and have the VS Code
extension use its locally installed language server.

See `adl.adl-server.path` in [.vscode/settings.json](.vscode/settings.json) and
`@azure-tools/adl` dev dependency in [package.json](package.json).

## Steps

### 1. Install ADL to project:
```
npm install --save-dev @azure-tools/adl
```

### 2. Configure path in VS Code
* File -> Preferences
* Search for ADL
* Click on Workspace tab
* Set `adl.adl-server.path` to `${workspaceRoot}/node_modules/.bin/adl-server`

  (NOTE: If the ADL project is not at the root of the workspace, adjust the path accordingly. 
  For example, `${workspaceRoot}/path/from/workspace/to/project/node_modulues/.bin/adl-server`)

### 3. Commit settings.json and package.json changes
