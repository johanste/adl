import { rejects, strictEqual } from "assert";
import { ModelType } from "../../compiler/types";
import { createTestHost, TestHost } from "../test-host.js";

describe("adl: using statements", () => {
  let testHost: TestHost;

  beforeEach(async () => {
    testHost = await createTestHost();
  });

  it("works in global scope", async () => {
    testHost.addAdlFile(
      "main.adl",
      `
      import "./a.adl";
      import "./b.adl";
      `
    );
    testHost.addAdlFile(
      "a.adl",
      `
      namespace N;
      model X { x: int32 }
      `
    );
    testHost.addAdlFile(
      "b.adl",
      `
      using N;
      @test model Y { ... X }
      `
    );

    const { Y } = (await testHost.compile("./")) as {
      Y: ModelType;
    };

    strictEqual(Y.properties.size, 1);
  });

  it("works in namespaces", async () => {
    testHost.addAdlFile(
      "main.adl",
      `
      import "./a.adl";
      import "./b.adl";
      `
    );
    testHost.addAdlFile(
      "a.adl",
      `
      namespace N;
      model X { x: int32 }
      `
    );
    testHost.addAdlFile(
      "b.adl",
      `
      namespace Z;
      using N;
      @test model Y { ... X }
      `
    );

    const { Y } = (await testHost.compile("./")) as {
      Y: ModelType;
    };

    strictEqual(Y.properties.size, 1);
  });

  it("works with dotted namespaces", async () => {
    testHost.addAdlFile(
      "main.adl",
      `
      import "./a.adl";
      import "./b.adl";
      `
    );
    testHost.addAdlFile(
      "a.adl",
      `
      namespace N.M;
      model X { x: int32 }
      `
    );
    testHost.addAdlFile(
      "b.adl",
      `
      using N.M;
      @test model Y { ... X }
      `
    );

    const { Y } = (await testHost.compile("./")) as {
      Y: ModelType;
    };

    strictEqual(Y.properties.size, 1);
  });

  it("throws errors for duplicate imported usings", async () => {
    testHost.addAdlFile(
      "main.adl",
      `
      import "./a.adl";
      import "./b.adl";
      `
    );
    testHost.addAdlFile(
      "a.adl",
      `
      namespace N.M;
      model X { x: int32 }
      `
    );

    testHost.addAdlFile(
      "b.adl",
      `
      using N.M;
      using N.M;
      @test model Y { ... X }
      `
    );

    await rejects(testHost.compile("./"));
  });

  it("throws errors for different usings with the same bindings", async () => {
    testHost.addAdlFile(
      "main.adl",
      `
      import "./a.adl";
      import "./b.adl";
      `
    );
    testHost.addAdlFile(
      "a.adl",
      `
      namespace N {
        model A { }
      }

      namespace M {
        model A { }
      }
      `
    );

    testHost.addAdlFile(
      "b.adl",
      `
      using N;
      using M;
      `
    );

    await rejects(testHost.compile("./"));
  });

  it("resolves 'local' decls over usings", async () => {
    testHost.addAdlFile(
      "main.adl",
      `
      import "./a.adl";
      import "./b.adl";
      `
    );
    testHost.addAdlFile(
      "a.adl",
      `
      namespace N;
      model A { a: string }
      `
    );

    testHost.addAdlFile(
      "b.adl",
      `
      using N;
      model A { a: int32 | string }
      @test model B { ... A }
      `
    );

    const { B } = (await testHost.compile("./")) as {
      B: ModelType;
    };
    strictEqual(B.properties.size, 1);
    strictEqual(B.properties.get("a")!.type.kind, "Union");
  });

  it("usings are local to a file", async () => {
    testHost.addAdlFile(
      "main.adl",
      `
      import "./a.adl";
      import "./b.adl";
      `
    );
    testHost.addAdlFile(
      "a.adl",
      `
      namespace N;
      model A { a: string }
      `
    );

    testHost.addAdlFile(
      "b.adl",
      `
      namespace M {
        using N;
      }
      
      namespace M {
        model X { a: A };
      }
      `
    );

    await rejects(testHost.compile("./"));
  });
});
