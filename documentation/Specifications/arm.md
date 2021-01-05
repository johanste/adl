# Building ARM endpoints in ADL

ADL provides a number of useful building blocks to make defining your ARM API endpoints super easy and consistent. This document will get you started on understanding the basics of ADL and how to define a new ARM API for your service.

Summary of required primitives:

* ADL Built-ins
  * Page\<T\> and @pageable
  * Customizable visibility modifiers
* REST Bindings
  * Decorators for each REST verb (@​get, @​set, etc.)
  * Decorators for each request and response part: @body, @header, @status.
  * Response types for different status codes (Ok<T>, Created<T>, etc.)
* Azure Bindings
  * LRO patterns for RELO and Stepwise
* ARM bindings
  * Models for common ARM resource types and request and response shapes
  * Models for common data types within arm:
    - secret
    - certificate
  * Decorators for common ARM API shapes:
    - Resources, child resources, proxy resources, and extension resources
    - subscription and tenant resources
    - Custom actions
    - Private link
 
 
## ADL built-ins

These are provided by ADL itself and are used by many ARM endpoints.

### @pageable & Page\<T\>

This decorator indicates to code generators that the endpoint is server-side pageable.

```
model Page<T> {
  value: T[];
  nextLink: string;
}

interface Books {
  @pageable list(): Page<{ title: string }>;
}
```

Can customize with the @pageable decorator.

```
interface BookPage {
  text: Book[];
  nextPage: string;
}

interface CustomBooksByPage {
  @pageable({values: 'text', nextLink: 'nextPage'}) list(): BookPage;
}
```

Supporting client-side pageable in a similar way should be possible.


### Custom visibility modifiers

Visibility is meant to be a user-defined constraint on properties that are visible when the model is used in particular contexts (e.g. as a request body for a PUT method). Lack of a visibility constraint implies no constraint (that is, a property appear in all contexts). Visibility may have arbitrary string values - different packages of ADL tools may want to define particular values for visibility and their definitions. ADL provides the following decorators:

- @visibility, which takes a string, and flags a field as only being visible if that visibility flag is set
- @withVisibility, which takes a list of visibility flags.

Together, this might look like:

```
model Car {
  @visibility('read') id: string;
  name: string;
}

@WithVisibility('write')
model WriteCar {
  ... Car;
}
```

For Arm, the visibility flags are:

```
 read = property occurs in responses containing the model
 create = property can be set in PUT requests creating the undelrlying resource
 update = property can be set in PUT requests updating the underlying resource
 patch = property can be set in PATCH requests updating the underlying resource
```

## REST bindings

These bindings imbue ADL with the ability to describe REST API endpoints. When defining ARM APIs, you won't need to use these much, but they will be useful for custom actions as you'll see later.

* Decorators for each REST verb (@​get, @​set, etc.)
* Decorators for each request and response part: @body, @header, @status.
* Response types for different status codes (Ok<T>, Created<T>, etc.)
* Types for various headers.
 
## Azure bindings

### RELO (resource-based LROs):

The `@relo` decorator signifies that an operation implements a resource-based long-running operation. It needs no parameters.

```
model VirtualMachine {
  id: string;
  state: 'creating' | 'created' | 'errored';
}

@path('/virtualMachines')
interface VirtualMachines {
  // put semantics
  @relo @put createVM(@path id: string): {}; // no return info
  @relo @put createVMWithStatus(@path id: string): VirtualMachine; // partial resource
  
  // post semantics
  @relo @post CreateVM(): {};
  @relo @post CreateVMWithStatus(): VirtualMachine;
}
```

This expands to the following ADL:

```
// desugaring
model CreatedResponseWithLocation<T = {}> {
  @header location: string;
  ... CreatedResponse<T>;
}

model AcceptedResponseWithLocation<T = {}>
  @header location: string;
  ... AcceptedResponse<T>;
}

@rest('/virtualMachines')
interface VirtualMachines {
  @put createVM(@path id: string): AcceptedResponse;

  // instead we return the whole resource (probably with much of it missing)
  @put createVMWithStatus(@path id: string): CreatedResponse<VirtualMachine>;

  // the location header is set to this path + the id of the entity.
  @post createVM(): AcceptedResponseWithLocation;
  @post createVMWithStatus(): CreatedResponseWithLocation<VirtualMachine>;
}

```

### Stepwise LRO:

```
// sugar
model VirtualMachine {
  id: string;
}

model VirtualMachineCreateOperation {
  state: 'creating' | 'created' | 'errored';
  percentComplete: number;
}

@rest('/virtualMachines')
interface VirtualMachines {
  // put semantics
  @slro('/operations', VirtualMachineCreateOperation)
  putCreateVM(@path id: string): {}; // no return info

  @slro('/operations', VirtualMachineCreateOperation)
  putCreateVMWithStatus(@path id: string): VirtualMachine; // partial resource
  
  // post semantics
  @slro('/operations', VirtualMachineCreateOperation)
  postCreateVM(): {};

  @slro('/operations', VirtualMachineCreateOperation)
  postCreateVMWithStatus(): VirtualMachine;
}
```

This expands into the following ADL. Note that more than one interface is created.

```
model CreatedResponse<T> {
  @status code: 201;
  @header operationLocation: string;
  ... T;
}

model CreatedResponseWithLocation<T> {
  @status code: 201;
  @header location: string;
  @header operationLocation: string;
}

@rest('/operations')
interface VirtualMachineOperations {
  @get getOperation(): VirtualMachineCreateOperation;
  @delete cancelOperation(): {}; // TODO: 405 if not supported
}

@rest('/virtualMachines')
interface VirtualMachines {
  @put PutCreateVM(@path id: string): CreatedResponse<{}>;
  @put PutCreateVMWithStatus(@path id: string): CreatedResponse<VirtualMachine>;
  @post PostCreateVM(): CreatedResponseWithLocation<{}>;
  @post PostCreateVMWithStatus(): CreatedResponseWithLocation<VirtualMachine>;
}
```

## ARM bindings

### Models

#### Resources

```
model ArmResource {
  readonly id: string;
  readonly name: string;
  readonly type: string;
}

model ArmTrackedResource {
  ... ArmResource;
  tags?: Map<string, string>;
  location: string;
}

model ArmProxyResource {
  ... Resource;
}

model ArmSubResource {
  ... Resource;
}
```

#### Responses

ARM resources are fairly regular in the shape of their responses, so we can package up a few common patterns:

```
model ArmRequestMetadata {
   @query apiVersion: string;
   @header x-ms-request-id: string;
   @header x-ms-client-request-id: string;
}

model ArmResponse<T, Code = 200> {
   @status code: Code;
   ... ArmRequestMetadata;
   ...T
}

model ArmError<Code = "4xx"> {
   @status code: Code;
   code: string;
   message: string;
}
```

### API Shape Primitives

#### ArmResource

```
@ArmResource("Microsoft.Cache/Redis", PropertiesType)
interface Redis {}
```

Expands out to the following endpoints:

- `GET /providers/Microsoft.Cache`
  - List the operations available from this provider.
- `POST /subscriptions/{subscriptionId}/providers/Microsoft.Cache/CheckNameAvailability`
  - Returns status codes depending on whether the resource name is available or not.
- `GET /subscriptions/{subscriptionId}/providers/Microsoft.Cache/Redis`
  - List resources in the subscription.
- `GET /subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Cache/Redis/`
  - List resources in the resource group.
- `GET /subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Cache/Redis/{id}`
  - Get a resource properties
- `PUT /subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Cache/Redis/{id}`
  - Create a resource
- `PATCH /subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Cache/Redis/{id}`
  - Update a resource
- `DELETE /subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Cache/Redis/{id}`
  - Delete a resource

#### ArmChildResource

ARM has the notion of parent and child resources. The resources created are similar to ArmResource, except without the list endpoints.
```
@ArmChildResource(Redis, "linkedServers")
interface RedisLinkedServers {}
```

Expands to the following endpoints:

- `GET /subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Cache/Redis/linkedServers`
  - Lists the child resources
- `PUT /subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Cache/Redis/linkedServers/{name}`
  - Creates or updates the child resource
- `GET /subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Cache/Redis/linkedServers/{name}`
  - Lists the child resource
- `DELETE /subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Cache/Redis/linkedServers/{name}`
  - Deletes the child resource

#### Actions

Inside of ARMResource, I can add custom "actions".

```
@ARMResource("Microsoft.Cache/Redis", RedisCache)
interface ARMResource {
  @get listUpgradeNotifications(
    """How many minutes in the past to look for upgrade notifications"""
    @query history: double
  ): Page<RedisUpgradeNotification>;
  
  @post listKeys(): Page<RedisAccessKeys>
}
```

### Redis

```
@path("/subscriptions/{subscriptionId}/providers/Microsoft.Cache/CheckNameAvailability")
interface NameChecker(... SubscriptionIdParameter) {
  // doesn't say anything about how it responds when the name ISN'T available...
  @post Redis_CheckNameAvailability(@body checkName: {name: string, type: "Microsoft.Cache/redis"}): Ok<{}>;
}

// If this is some standard shape, it could be packaged up into something higher level.
@ARMResource("Microsoft.Cache/Redis", RedisResource)
interface Redis {
  @get listUpgradeNotifications(
    """How many minutes in the past to look for upgrade notifications"""
    @query history: double
  ): Ok<Page<UpgradeNotification>>;

  @post regenerateKey(@body key: RedisRegenerateKeyParameters): Ok<RedisKeys>;
  @post forceReboot(@body node: RedisRebootParemeters): Ok<{}>;
  @post @lro import(@body RDB: RedisImportRDBParameters): {};
  @post @lro export(@body location: RedisExportParametersx): {};
}

@ARMChildResource("firewallRules", Redis)
interface RedisLinkedServers(... RedisRGParameters) {}

@ARMChildResource("linkedServers", Redis)
interface RedisLinkedServers(... RedisRGParameters) {}
```


## Appendix

Open questions:

* Namespacing continues to be a major hurdle.
* How are frameworks distributed? E.g. do we want something like `npm install @adl/azure-arm`?