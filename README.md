# ADL

This project is a work in progress, more information will be provided at a later
date.

You can try a work-in-progress build of the compiler by following the steps in
the Installation section below.  Please feel free to [file
issues](https://github.com/Azure/adl/issues) for any issues you encounter while
using the preview.

## Getting Started

1. Install [Node.js 14 LTS](https://nodejs.org/en/download/) and ensure you are able to run the `npm` command in a command prompt:

   ```
   npm --version
   ```

2. Create a folder for your new ADL project

3. In a command prompt, run the following commands:

   ```
   cd path\to\adl\project
   npm init -y
   npm install -g @azure-tools/adl
   npm install @azure-tools/adl-rest @azure-tools/adl-openapi @azure-tools/adl-rpaas
   ```

   This will create a `package.json` file for your ADL project and add the necessary ADL dependencies to it.

4. Install the ADL extension for your editor of choice:

   - [Instructions for Visual Studio](#installing-visual-studio-extension)
   - [Instructions for Visual Studio Code](#installing-vs-code-extension)

5. Open the folder in your editor and create a new file with a `.adl` extension

6. [Follow our tutorial](docs/tutorial.md) to get started writing ADL!

7. Once you're ready to compile your ADL to Swagger, save the file and type this at the command prompt in your project folder:

   ```
   npx adl compile .
   ```

   This will compile the ADL files in the project folder into one output file: `.\adl-output\openapi.json`.

You can also check out a variety of samples in the [adl-samples](packages/adl-samples/) folder.

## Usage

See full usage documentation by typing:

```
adl --help
```

You can launch ADL in one of two ways:

### Compiling a folder of ADL files to an OpenAPI 2.0 (Swagger) specification

You can compile a folder containing `.adl` files into a single OpenAPI document by
using the following command:

```
adl compile samples/petstore/
```

You can now examine the emitted OpenAPI document in `./adl-output/openapi.json`.

### Generating a TypeScript client from a folder of ADL files

You can compile a folder containing `.adl` files into a single OpenAPI document by
using the following command:

```
adl generate --client samples/petstore/
```

Parameters for generating clients in other languages will be added soon.


### Installing VS Code Extension

```
adl code install
```

This will download and install the latest VS Code extension. Use `adl code
uninstall` to remove it. Pass `--insiders` if you use VS Code Insiders edition.

If `adl-server` cannot be found on PATH by VS Code in your setup, you can
configure its location in VS Code settings. Search for "ADL" in File ->
Preferences -> Settings, and adjust `adl.adl-server.path` accordingly. You may
need to restart VS Code after changing this.

You can also configure a project to use a local npm install of
`@azure-tools/adl`. See [local-adl sample](packages/adl/samples/local-adl).


### Installing Visual Studio Extension

```
adl vs install
```

This will download and install the latest Visual Studio extension. Use `adl vs
uninstall` to remove it.
