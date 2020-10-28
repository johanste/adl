/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

// using static-link'd dependencies:
let usingStaticLoader = false;

if (process.env['no-static-loader'] === undefined && require('fs').existsSync(`${__dirname}/../../dist/static-loader.js`)) {
  usingStaticLoader = true;
  require(`${__dirname}/../../dist/static-loader.js`).load(`${__dirname}/../../dist/static_modules.fs`);
}
import { ApiModel, getRelativePath, LinterDiagnostic, Range, RuleSeverity } from '@azure-tools/adl.core';
import { Activation } from '@azure-tools/adl.core/dist/eventing/activation';
import { Delay } from '@azure-tools/tasks';
import { CodeAction, CodeActionKind, Command, CompletionItem, CompletionItemKind, createConnection, Diagnostic, DiagnosticSeverity, DidChangeConfigurationNotification, InitializeParams, InitializeResult, ProposedFeatures, TextDocumentChangeEvent, TextDocumentEdit, TextDocumentPositionParams, TextDocuments, TextDocumentSyncKind, TextEdit } from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { ServerFileSystem } from './file-system';
import { OpenLinkRequest } from './requestTypes';


// Create a connection for the server. The connection uses Node's IPC as a transport.
// Also include all preview / proposed LSP features.
const connection = createConnection(ProposedFeatures.all);

connection.console.info(`ADL Language Server started. [static-loader: ${usingStaticLoader}]`);

// Create a simple text document manager. The text document manager
// supports full document sync only
export const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

let hasConfigurationCapability = false;
let hasWorkspaceFolderCapability = false;
let hasDiagnosticRelatedInformationCapability = false;
let apiModel: ApiModel| undefined;

// HANDLE INITIALIZE EVENT
connection.onInitialize((params: InitializeParams) => {
  const capabilities = params.capabilities;

  // Does the client support the `workspace/configuration` request?
  // If not, we will fall back using global settings
  hasConfigurationCapability = !!(
    capabilities.workspace && !!capabilities.workspace.configuration
  );
  hasWorkspaceFolderCapability = !!(
    capabilities.workspace && !!capabilities.workspace.workspaceFolders
  );
  hasDiagnosticRelatedInformationCapability = !!(
    capabilities.textDocument &&
    capabilities.textDocument.publishDiagnostics &&
    capabilities.textDocument.publishDiagnostics.relatedInformation
  );

  const result: InitializeResult = {
    capabilities: {
      codeActionProvider: true,
      textDocumentSync: TextDocumentSyncKind.Incremental,
      // Tell the client that the server supports code completion
      completionProvider: {
        resolveProvider: true
      },
      executeCommandProvider: {
        commands: [COMMAND.FIX, COMMAND.LEARN_MORE]
      }
    }
  };
  if (hasWorkspaceFolderCapability) {
    result.capabilities.workspace = {
      workspaceFolders: {
        supported: true
      }
    };
  }
  return result;
});

async function init() {
  const fs = new ServerFileSystem(connection);
  fs.cwd = (await connection.workspace.getWorkspaceFolders())?.first?.uri || '';
  apiModel = await new ApiModel(fs).load();
  apiModel.messages.on('log', (x) => connection.console.info(x));
  await Promise.all(documents.all().select(each => lintDocument(each)));
}

// HANDLE INITIALIZED EVENT
connection.onInitialized(async () => {
  await init();

  if (hasConfigurationCapability) {
    // Register for all configuration changes.
    await connection.client.register(DidChangeConfigurationNotification.type, undefined);
  }

  if (hasWorkspaceFolderCapability) {
    connection.workspace.onDidChangeWorkspaceFolders(_event => {
      connection.console.log('Workspace folder change event received.');
    });
  }
});

// The example settings
interface ExampleSettings {
  maxNumberOfProblems: number;
}

// The global settings, used when the `workspace/configuration` request is not supported by the client.
// Please note that this is not the case when using this server with the client provided in this example
// but could happen with other clients.
const defaultSettings: ExampleSettings = { maxNumberOfProblems: 1000 };
let globalSettings: ExampleSettings = defaultSettings;

// Cache the settings of all open documents
const documentSettings: Map<string, Thenable<ExampleSettings>> = new Map();

// HANDLE CONFIG CHANGE EVENT
connection.onDidChangeConfiguration(change => {
  if (hasConfigurationCapability) {
    // Reset all cached document settings
    documentSettings.clear();
  } else {
    globalSettings = <ExampleSettings>(
      (change.settings.languageServerExample || defaultSettings)
    );
  }

  // Revalidate all open text documents
  // documents.all().forEach(validateTextDocument);
});

function getDocumentSettings(resource: string): Thenable<ExampleSettings> {
  if (!hasConfigurationCapability) {
    return Promise.resolve(globalSettings);
  }

  let result = documentSettings.get(resource);
  if (!result) {
    result = connection.workspace.getConfiguration({
      scopeUri: resource,
      section: 'adl'
    });
    documentSettings.set(resource, result);
  }
  return result;
}

// Only keep settings for open documents
documents.onDidClose(e => {
  documentSettings.delete(e.document.uri);
});

function convertSeverity(severity: RuleSeverity): DiagnosticSeverity {
  return <DiagnosticSeverity>['','error', 'warning', 'info', 'hint'].indexOf(severity);

}

async function documentChanged(change: TextDocumentChangeEvent<TextDocument>) {
  if (!apiModel) {
    await Delay(200);
  }

  if (apiModel) {
    // only process this if we're already done initializing the apiModel
    if (change.document.uri.endsWith('/api.yaml')) {
      return;
    }

    const changedPath = getRelativePath(apiModel.fileSystem, change.document.uri);
    const changedFile = apiModel.where(each => each.relativePath === changedPath);
    if (changedFile.files[0]) {
      changedFile.files[0].replaceWithText(change.document.getText());
    }

    await lintDocument(change.document);
  }
}

// The content of a text document has changed. This event is emitted
// when the text document first opened or when its content has changed.
documents.onDidChangeContent(documentChanged);

documents.onDidSave(async (change)=>{
  if (change.document.uri.endsWith('/api.yaml')) {
    // this is a configuration change, let's re init the workspace
    apiModel = undefined;
    await init();
  }
});

async function lintDocument(document: TextDocument) {
  if (!apiModel) {
    await Delay(200);
  }

  if (apiModel) {
    const path = getRelativePath(apiModel.fileSystem, document.uri);
    const file = apiModel.where(each => each.relativePath === path);

    const diagnostics = [...apiModel.linter.run(Activation.edit,file)];
    processLinterDiagnostics(diagnostics, document.uri);
  }
}

const codeActions = new Map<string,Map<string, LinterDiagnostic>>();
function processLinterDiagnostics(linterDiagnostics: Array<LinterDiagnostic>, uri: string){
  const diagnostics: Array<Diagnostic> = [];
  if (codeActions.get(uri) === undefined) {
    codeActions.set(uri, new Map<string, LinterDiagnostic>());
  }

  for (const linterDiagnostic of linterDiagnostics) {

    const diagnostic: Diagnostic = {
      ...linterDiagnostic,
      severity: convertSeverity(linterDiagnostic.severity),
    };

    diagnostics.push(diagnostic);
    codeActions.get(uri)?.set(computeKey(diagnostic), linterDiagnostic);
  }

  // Send the computed diagnostics to VSCode.
  connection.sendDiagnostics({ uri: uri , diagnostics });
}

function computeKey(diagnostic: Diagnostic): string {
  const range = diagnostic.range;
  return `[${range.start.line},${range.start.character},${range.end.line},${range.end.character}]-${diagnostic.code}`;
}

connection.onDidChangeWatchedFiles(_change => {
  // Monitored files have change in VSCode
  connection.console.log('We received an file change event');
});

// This handler provides the initial list of the completion items.
connection.onCompletion(

  // THIS IS EXAMPLE CODE -------------------------------------------------------------------
  (_textDocumentPosition: TextDocumentPositionParams): Array<CompletionItem> => {
    // The pass parameter contains the position of the text document in
    // which code complete got requested. For the example we ignore this
    // info and always provide the same completion items.
    return [
      {
        label: 'TypeScript',
        kind: CompletionItemKind.Text,
        data: 1
      },
      {
        label: 'JavaScript',
        kind: CompletionItemKind.Text,
        data: 2
      }
    ];
  }
);

// This handler resolves additional information for the item selected in
// the completion list.
connection.onCompletionResolve(
  (item: CompletionItem): CompletionItem => {
    if (item.data === 1) {
      item.detail = 'TypeScript details';
      item.documentation = 'TypeScript documentation';
    } else if (item.data === 2) {
      item.detail = 'JavaScript details';
      item.documentation = 'JavaScript documentation';
    }
    return item;
  }
);

// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);

// Listen on the connection
connection.listen();


connection.onCodeAction((params) => {
  const textDocument = documents.get(params.textDocument.uri);
  if (textDocument === undefined) {
    return undefined;
  }

  const actions = new Array<CodeAction>();
  for (const diagnostic of params.context.diagnostics) {
    const linterDiagnostic = codeActions.get(textDocument.uri)?.get(computeKey(diagnostic));
    if (linterDiagnostic) {
      // get codeactions for suggestions
      if (linterDiagnostic.suggestions) {
        const suggest = linterDiagnostic.suggestions;
        for (let i = 0; i < suggest.length; i++) {
          const title = suggest[i].description || 'Fix this problem.';
          const action = CodeAction.create(
            title,
            Command.create(title, COMMAND.FIX, textDocument.uri, computeKey(diagnostic), i),
            CodeActionKind.QuickFix
          );

          //linterDiagnostic.
          actions.push(action);
        }
      }


      // get codeaction for documentation
      if (linterDiagnostic.documentationUrl) {
        const urlDocAction = CodeAction.create(
          'Learn more...',
          Command.create('Learn more about this rule', COMMAND.LEARN_MORE, linterDiagnostic.documentationUrl),
          CodeActionKind.Empty
        );

        actions.push(urlDocAction);
      }
    }
  }


  return actions;
});


namespace COMMAND {
  export const FIX = 'adlLinter.fix';
  export const LEARN_MORE = 'adlLinter.getDocumentation';
}

connection.onExecuteCommand(async (params) => {
  if (apiModel && params.arguments !== undefined) {
    if (params.command === COMMAND.FIX) {
      if (params.command !== COMMAND.FIX) {
        return;
      }

      const textDocument = documents.get(params.arguments[0]);
      if (textDocument === undefined) {
        return;
      }

      const linterDiagnostic = codeActions.get(textDocument.uri)?.get(params.arguments[1]);
      if (linterDiagnostic === undefined) {
        return;
      }

      const suggestions = linterDiagnostic.suggestions;
      if (suggestions === undefined) {
        return;
      }

      const suggestion = suggestions[params.arguments[2]];
      if (suggestion === undefined) {
        return;
      }

      // get file info
      const changedPath = getRelativePath(apiModel.fileSystem, textDocument.uri);
      const changedFile = apiModel.where(each => each.relativePath === changedPath);
      const file = changedFile.files[0];

      // previous state
      const originalFileRange = Range.fromFile(file);

      // apply fix
      suggestion.fix();

      await connection.workspace.applyEdit({
        documentChanges: [
          TextDocumentEdit.create(
            { uri: textDocument.uri, version: textDocument.version },
            [TextEdit.replace(originalFileRange, file.getFullText())]
          )]
      });
    }

    if (params.command === COMMAND.LEARN_MORE) {
      const url = params.arguments[0];
      if (url === undefined) {
        return;
      }

      await connection.sendRequest(OpenLinkRequest.type, {url});
    }
  }
});