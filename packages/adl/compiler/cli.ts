import { spawnSync, SpawnSyncOptionsWithStringEncoding } from "child_process";
import { mkdtemp, readdir, rmdir } from "fs/promises";
import mkdirp from "mkdirp";
import os from "os";
import { basename, join, resolve } from "path";
import url from "url";
import yargs from "yargs";
import { CompilerOptions } from "../compiler/options.js";
import { compile } from "../compiler/program.js";
import { loadADLConfigInDir } from "../config/index.js";
import { compilerAssert, dumpError, logDiagnostics } from "./diagnostics.js";
import { formatADLFiles } from "./formatter.js";
import { adlVersion, NodeHost } from "./util.js";

const args = yargs(process.argv.slice(2))
  .scriptName("adl")
  .help()
  .strict()
  .command("compile <path>", "Compile ADL source.", (cmd) => {
    return cmd
      .positional("path", {
        description: "The path to the main.adl file or directory containing main.adl.",
        type: "string",
      })
      .option("output-path", {
        type: "string",
        default: "./adl-output",
        describe:
          "The output path for generated artifacts.  If it does not exist, it will be created.",
      })
      .option("option", {
        type: "array",
        string: true,
        describe:
          "Key/value pairs that can be passed to ADL components.  The format is 'key=value'.  This parameter can be used multiple times to add more options.",
      })
      .option("nostdlib", {
        type: "boolean",
        default: false,
        describe: "Don't load the ADL standard library.",
      });
  })
  .command("generate <path>", "Generate client code from ADL source.", (cmd) => {
    return (
      cmd
        .positional("path", {
          description: "The path to folder containing .adl files",
          type: "string",
        })
        .option("client", {
          type: "boolean",
          describe: "Generate a client library for the ADL definition",
        })
        .option("language", {
          type: "string",
          choices: ["typescript", "csharp", "python"],
          describe: "The language to use for code generation",
        })
        .option("output-path", {
          type: "string",
          default: "./adl-output",
          describe:
            "The output path for generated artifacts.  If it does not exist, it will be created.",
        })
        .option("option", {
          type: "array",
          string: true,
          describe:
            "Key/value pairs that can be passed to ADL components.  The format is 'key=value'.  This parameter can be used multiple times to add more options.",
        })
        // we can't generate anything but a client yet
        .demandOption("client")
        // and language is required to do so
        .demandOption("language")
    );
  })
  .command("code", "Manage VS Code Extension.", (cmd) => {
    return cmd
      .demandCommand(1, "No command specified.")
      .command("install", "Install VS Code Extension")
      .command("uninstall", "Uninstall VS Code Extension")
      .option("insiders", { type: "boolean", description: "Use VS Code Insiders" });
  })
  .command("vs", "Manage Visual Studio Extension.", (cmd) => {
    return cmd
      .demandCommand(1, "No command specified")
      .command("install", "Install Visual Studio Extension.")
      .command("uninstall", "Uninstall VS Extension");
  })
  .command("format <include...>", "Format given list of adl files.", (cmd) => {
    return cmd.positional("include", {
      description: "Wildcard pattern of the list of files.",
      type: "string",
      array: true,
    });
  })
  .command("info", "Show information about current ADL compiler.")
  .option("debug", {
    type: "boolean",
    description: "Output debug log messages.",
  })
  .version(adlVersion)
  .demandCommand(1, "You must use one of the supported commands.").argv;

async function compileInput(compilerOptions: CompilerOptions, printSuccess = true) {
  const program = await compile(args.path!, NodeHost, compilerOptions);
  logDiagnostics(program.diagnostics, console.error);
  if (program.hasError()) {
    process.exit(1);
  }
  if (printSuccess) {
    console.log(
      `Compilation completed successfully, output files are in ${compilerOptions.outputPath}.`
    );
  }
}

async function getCompilerOptions(): Promise<CompilerOptions> {
  // Ensure output path
  const outputPath = resolve(args["output-path"]);
  await mkdirp(outputPath);

  const miscOptions: any = {};
  for (const option of args.option || []) {
    const optionParts = option.split("=");
    if (optionParts.length != 2) {
      throw new Error(
        `The --option parameter value "${option}" must be in the format: some-option=value`
      );
    }
    miscOptions[optionParts[0]] = optionParts[1];
  }

  return {
    miscOptions,
    outputPath,
    swaggerOutputFile: resolve(args["output-path"], "openapi.json"),
    nostdlib: args["nostdlib"],
  };
}

async function generateClient(options: CompilerOptions) {
  const clientPath = resolve(args["output-path"], "client");
  const autoRestBin = process.platform === "win32" ? "autorest.cmd" : "autorest";
  const autoRestPath = new url.URL(`../../node_modules/.bin/${autoRestBin}`, import.meta.url);

  // Execute AutoRest on the output file
  console.log(); //newline between compilation output and generation output
  const result = run(
    url.fileURLToPath(autoRestPath),
    [
      `--${args.language}`,
      `--clear-output-folder=true`,
      `--output-folder=${clientPath}`,
      `--title=AdlClient`,
      `--input-file=${options.swaggerOutputFile}`,
    ],
    {
      shell: true,
    }
  );

  if (result.status === 0) {
    console.log(`\nGeneration completed successfully, output files are in ${clientPath}.`);
  } else {
    console.error("\nClient generation failed.");
    process.exit(result.status || 1);
  }
}

async function installVsix(pkg: string, install: (vsixPaths: string[]) => void) {
  // download npm package to temporary directory
  const temp = await mkdtemp(join(os.tmpdir(), "adl"));
  const npmArgs = ["install"];

  // hide npm output unless --debug was passed to adl
  if (!args.debug) {
    npmArgs.push("--silent");
  }

  // NOTE: Using cwd=temp with `--prefix .` instead of `--prefix ${temp}` to
  // workaround https://github.com/npm/cli/issues/3256. It's still important
  // to pass --prefix even though we're using cwd as otherwise, npm might
  // find a package.json file in a parent directory and install to that
  // directory.
  npmArgs.push("--prefix", ".");

  // To debug with a locally built package rather than pulling from npm,
  // specify the full path to the packed .tgz using ADL_DEBUG_VSIX_TGZ
  // environment variable.
  npmArgs.push(process.env.ADL_DEBUG_VSIX_TGZ ?? pkg);

  run("npm", npmArgs, { cwd: temp });

  // locate .vsix
  const dir = join(temp, "node_modules", pkg);
  const files = await readdir(dir);
  let vsixPaths: string[] = [];
  for (const file of files) {
    if (file.endsWith(".vsix")) {
      vsixPaths.push(join(dir, file));
    }
  }

  compilerAssert(
    vsixPaths.length > 0,
    `Installed ${pkg} from npm, but didn't find any .vsix files in it.`
  );

  // install extension
  install(vsixPaths);

  // delete temporary directory
  await rmdir(temp, { recursive: true });
}

async function runCode(codeArgs: string[]) {
  await run(args.insiders ? "code-insiders" : "code", codeArgs, {
    // VS Code's CLI emits node warnings that we can't do anything about. Suppress them.
    extraEnv: { NODE_NO_WARNINGS: "1" },
  });
}

async function installVSCodeExtension() {
  await installVsix("adl-vscode", (vsixPaths) => {
    runCode(["--install-extension", vsixPaths[0]]);
  });
}

async function uninstallVSCodeExtension() {
  await runCode(["--uninstall-extension", "microsoft.adl-vscode"]);
}

function getVsixInstallerPath(): string {
  return getVSInstallerPath(
    "resources/app/ServiceHub/Services/Microsoft.VisualStudio.Setup.Service/VSIXInstaller.exe"
  );
}

function getVSWherePath(): string {
  return getVSInstallerPath("vswhere.exe");
}

function getVSInstallerPath(relativePath: string) {
  if (process.platform !== "win32") {
    console.error("error: Visual Studio extension is not supported on non-Windows.");
    process.exit(1);
  }

  return join(
    process.env["ProgramFiles(x86)"] ?? "",
    "Microsoft Visual Studio/Installer",
    relativePath
  );
}

function isVSInstalled(versionRange: string) {
  const vswhere = getVSWherePath();
  const proc = run(vswhere, ["-property", "instanceid", "-prerelease", "-version", versionRange], {
    stdio: [null, "pipe", "inherit"],
    allowNotFound: true,
  });
  return proc.status === 0 && proc.stdout;
}

const VSIX_ALREADY_INSTALLED = 1001;
const VSIX_NOT_INSTALLED = 1002;
const VSIX_USER_CANCELED = 2005;

async function installVSExtension() {
  const vsixInstaller = getVsixInstallerPath();
  const versionMap = new Map([
    [
      "Microsoft.Adl.VS2019.vsix",
      {
        friendlyVersion: "2019",
        versionRange: "[16.0, 17.0)",
        installed: false,
      },
    ],
    [
      "Microsoft.Adl.VS2022.vsix",
      {
        friendlyVersion: "2022",
        versionRange: "[17.0, 18.0)",
        installed: false,
      },
    ],
  ]);

  let vsFound = false;
  for (const entry of versionMap.values()) {
    if (isVSInstalled(entry.versionRange)) {
      vsFound = entry.installed = true;
    }
  }

  if (!vsFound) {
    console.error("error: No compatible version of Visual Studio found.");
    process.exit(1);
  }

  await installVsix("@azure-tools/adl-vs", (vsixPaths) => {
    for (const vsix of vsixPaths) {
      const vsixFilename = basename(vsix);
      const entry = versionMap.get(vsixFilename);
      compilerAssert(entry, "Unexpected vsix filename:" + vsix);
      if (entry.installed) {
        console.log(`Installing extension for Visual Studio ${entry?.friendlyVersion}...`);
        run(vsixInstaller, [vsix], {
          allowedExitCodes: [VSIX_ALREADY_INSTALLED, VSIX_USER_CANCELED],
        });
      }
    }
  });
}

async function uninstallVSExtension() {
  const vsixInstaller = getVsixInstallerPath();
  run(vsixInstaller, ["/uninstall:88b9492f-c019-492c-8aeb-f325a7e4cf23"], {
    allowedExitCodes: [VSIX_NOT_INSTALLED, VSIX_USER_CANCELED],
  });
}

/**
 * Print the resolved adl configuration.
 */
async function printInfo() {
  const cwd = process.cwd();
  console.log(`Module: ${url.fileURLToPath(import.meta.url)}`);

  const config = await loadADLConfigInDir(NodeHost, cwd);
  const jsyaml = await import("js-yaml");
  const excluded = ["diagnostics", "filename"];
  const replacer = (key: string, value: any) => (excluded.includes(key) ? undefined : value);

  console.log(`User Config: ${config.filename ?? "No config file found"}`);
  console.log("-----------");
  console.log(jsyaml.dump(config, { replacer }));
  console.log("-----------");
  logDiagnostics(config.diagnostics, console.error);
  if (config.diagnostics.some((d) => d.severity === "error")) {
    process.exit(1);
  }
}

// NOTE: We could also use { shell: true } to let windows find the .cmd, but that breaks
// ENOENT checking and handles spaces poorly in some cases.
const isCmdOnWindows = ["code", "code-insiders", "npm"];

interface RunOptions extends Partial<SpawnSyncOptionsWithStringEncoding> {
  extraEnv?: NodeJS.ProcessEnv;
  allowNotFound?: boolean;
  allowedExitCodes?: number[];
}

function run(command: string, commandArgs: string[], options?: RunOptions) {
  if (args.debug) {
    if (options) {
      console.log(options);
    }
    console.log(`> ${command} ${commandArgs.join(" ")}\n`);
  }

  if (options?.extraEnv) {
    options.env = {
      ...(options?.env ?? process.env),
      ...options.extraEnv,
    };
  }

  const baseCommandName = basename(command);
  if (process.platform === "win32" && isCmdOnWindows.includes(command)) {
    command += ".cmd";
  }

  const finalOptions: SpawnSyncOptionsWithStringEncoding = {
    encoding: "utf-8",
    stdio: "inherit",
    ...(options ?? {}),
  };

  const proc = spawnSync(command, commandArgs, finalOptions);
  if (args.debug) {
    console.log(proc);
  }

  if (proc.error) {
    if ((proc.error as any).code === "ENOENT" && !options?.allowNotFound) {
      console.error(`error: Command '${baseCommandName}' not found.`);
      if (args.debug) {
        console.log(proc.error.stack);
      }
      process.exit(1);
    } else {
      throw proc.error;
    }
  }

  if (proc.status !== 0 && !options?.allowedExitCodes?.includes(proc.status ?? 0)) {
    console.error(
      `error: Command '${baseCommandName} ${commandArgs.join(" ")}' failed with exit code ${
        proc.status
      }.`
    );
    process.exit(proc.status || 1);
  }

  return proc;
}

async function main() {
  console.log(`ADL compiler v${adlVersion}\n`);
  const command = args._[0];
  let options: CompilerOptions;
  let action: string | number;

  switch (command) {
    case "info":
      printInfo();
      break;
    case "compile":
      options = await getCompilerOptions();
      await compileInput(options);
      break;
    case "generate":
      options = await getCompilerOptions();
      await compileInput(options, false);
      if (args.client) {
        await generateClient(options);
      }
      break;
    case "code":
      action = args._[1];
      switch (action) {
        case "install":
          await installVSCodeExtension();
          break;
        case "uninstall":
          await uninstallVSCodeExtension();
          break;
      }
      break;
    case "vs":
      action = args._[1];
      switch (action) {
        case "install":
          await installVSExtension();
          break;
        case "uninstall":
          await uninstallVSExtension();
          break;
      }
      break;
    case "format":
      await formatADLFiles(args["include"]!, { debug: args.debug });
      break;
  }
}

function internalCompilerError(error: Error) {
  // NOTE: An expected error, like one thrown for bad input, shouldn't reach
  // here, but be handled somewhere else. If we reach here, it should be
  // considered a bug and therefore we should not suppress the stack trace as
  // that risks losing it in the case of a bug that does not repro easily.
  console.error("Internal compiler error!");
  console.error("File issue at https://github.com/azure/adl");
  dumpError(error, console.error);
  process.exit(1);
}

process.on("unhandledRejection", (error: Error) => {
  console.error("Unhandled promise rejection!");
  internalCompilerError(error);
});

main().catch(internalCompilerError);
