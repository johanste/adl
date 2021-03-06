# Change Log - @azure-tools/adl

This log was last generated on Fri, 09 Jul 2021 20:21:06 GMT and should not be manually modified.

## 0.13.0
Fri, 09 Jul 2021 20:21:06 GMT

### Minor changes

- Add OptionalProperties<T> and withOptionalProperties decorator for creating model variations with all properties set to optional
- Add semantic analysis to language server

### Patches

- **Update** Diagnostics code to be a string
- Formatter can recover from parsing error that don't affect the validity of the tree
- Use LSP to log messages from client to server

## 0.12.0
Thu, 24 Jun 2021 03:57:43 GMT

### Minor changes

- Require main.adl or adlMain in package.json
- Add mutator library which enables the programmatic addition of model properties, operation parameters, and operation return types
- Add semantic error recovery

### Patches

- **Added** ADL Configuration file loading
- Added typechecker type navigation
- Add isStringType helper function
- Fix some edge cases in config file loading
- Add support for Visual Studio 2022

## 0.11.0
Tue, 18 May 2021 23:43:31 GMT

### Minor changes

- **Added** format command to automatically format adl files

### Patches

- **Fix** Throw diagnostic when main ADL file doesn't exists
- Fix TypeError after `adl vs` command
- **Fix** formatter handling string and number literal should keep as it is.
- **Fix** Formatter not rendering template parameters of models.
- **Fix** Don't format a file with parsing errors
- Work around npm 7+ Mac OS bug in `adl code install`
- Prefer local install of adl package when running global `adl`

## 0.10.0
Thu, 06 May 2021 14:56:02 GMT

### Minor changes

- Implement alias and enum, remove model =
- Implement basic parser error recovery
- Add API to check if a node or any descendants have parse errors

### Patches

- Small parsing speed improvement when expecting one of N tokens.
- Fix blockless namespaces not accumulating decls
- Allow leading +/- in numeric literals and require fractional digits
- Fix bugs with non-ascii identifiers
- Improve CLI experience for generate command
- Replace several internal compiler errors with diagnostics
- Do not allow multi-line non-triple-quoted string literals
- Fix parsing edge cases and optimize parsing slightly

## 0.9.0
Tue, 20 Apr 2021 15:23:29 GMT

### Minor changes

- Fix parse errors from trailing commas; implement optional prefix | and &

### Patches

- Fix issue where dynamic namespaces were not evaluated
- Virtualize writting to filesytem to enable programtic usage of adl

## 0.8.0
Tue, 06 Apr 2021 01:23:07 GMT

### Minor changes

- Implement npm libraries
- Implement library import with npm, abstract out rest, openapi, rpaas

### Patches

- Add commands to install and uninstall Visual Studio extension
- Enable security and securityDefinitions metadata to be applied to emitted OpenAPI documents; add default ARM security details
- Add api-version parameter to all ARM operations
- Add operations endpoint for ARM services
- Enable creation of $refs to ARM common model and parameter definitions
- Add common ARM parameter definitions for resource operations
- remove parenless decorators

## 0.7.0
Wed, 31 Mar 2021 22:00:43 GMT

### Minor changes

- Implement usings statements
- Implement imports
- Improved OpenAPI output for ARM services, including pluralized operation groups and operation tags

### Patches

- Add service-level metadata decorators: @serviceTitle, @serviceVersion, @produces, @consumes, and @armNamespace
- Add support for OpenAPI operation overloads using x-ms-paths

## 0.6.0
Fri, 26 Mar 2021 17:06:33 GMT

### Minor changes

- Implement namespace merging, blockless namespaces, and dotted namespaces

### Patches

- Emit `readOnly: true` for model properties marked with `@visibility("read")`
- The `visibility` decorator now accepts multiple values; the Swagger emitter will write these out as an `x-ms-mutability` field.
- Adding sample generated controller for confluent service
- Add back post operation
- Add standard ARM operation and error model types
- Fix id lookup bug
- Initial check-in of adl spec and generated swagger for Fluid Relay
- Update fluid relay spec with user comments.
- Fixing formatting to match repo prettier config
- Add `@minValue` and `@maxValue` decorators for specifying the value range of numeric types
- Allow the use of recursive type references in model definitions
- Enable metadata and extensions to be applied to $ref'd schemas
- Add missing metadata for ARM library types

## 0.5.0
Tue, 23 Mar 2021 01:06:29 GMT

### Minor changes

- Add `time` intrinsic type
- Rename all date and time intrinsics: zonedDateTime, plainDate, and plainTime
- Add commands to install/uninstall VS Code extension

### Patches

- Automatically mark named enum types with `x-ms-enum` and `modelAsString: true`

## 0.4.0
Tue, 16 Mar 2021 23:13:42 GMT

### Minor changes

- Introduce language server and add live parse errors to VS Code

## 0.3.0
Thu, 11 Mar 2021 19:14:29 GMT

### Minor changes

- Add byte primitive type
- Add datetime primitive type
- Enable HTTP verb decorators to specify a subpath from the parent resource path
- Add float32 primitive type
- Replace `interface` syntax with `namespace` and `op` syntax
- Add new decorator @tags
- Add support for nested namespace definitions and scopes
- Add null intrinsic type, allow unions with it for x-nullable support in OpenAPI emitter
- Add response model types for many standard HTTP responses in rest.adl
- Renamed Ok<T> to OkResponse<T>
- Add syntax highlighting

### Patches

- Fix model Foo<T> extends T { }
- Fix resolution of declared parameters in resource sub-paths
- Always output a response description field to ensure valid swagger
- Added new gRPC to ADL examples
- Add back line and column tracking
- Support arrays of arrays and parenthesized expressions
- Remove hardcoded @autorest/core version
- Include source file path in parse error log
- Add body-boolean testserver sample
- Fix bug preventing empty string literals
- Refactor scanner to use less state
- Log source locations with all errors
- Support multiple content types for request bodies

## 0.2.1
Thu, 28 Jan 2021 21:30:01 GMT

### Patches

- Fixed standard library decorator module resolution

## 0.2.0
Wed, 27 Jan 2021 21:48:34 GMT

### Minor changes

- Initial ADL compiler preview release

