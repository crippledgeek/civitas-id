import { describe, expect, it } from "vitest";
import { InvalidIdNumberError } from "../../src/error/invalid-id-number-error.js";

describe("InvalidIdNumberError", () => {
  it("is an instance of Error", () => {
    const err = new InvalidIdNumberError("test message");
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(InvalidIdNumberError);
  });

  it("preserves the message argument", () => {
    const err = new InvalidIdNumberError("my custom message");
    expect(err.message).toBe("my custom message");
  });

  it("sets name to 'InvalidIdNumberError' (not 'Error')", () => {
    const err = new InvalidIdNumberError("test");
    expect(err.name).toBe("InvalidIdNumberError");
  });

  it("supports the cause option (ES2022 Error.cause)", () => {
    const root = new TypeError("the root cause");
    const err = new InvalidIdNumberError("wrapper", { cause: root });
    expect(err.cause).toBe(root);
  });

  it("captures a stack trace", () => {
    const err = new InvalidIdNumberError("test");
    expect(err.stack).toBeDefined();
    expect(err.stack).toContain("InvalidIdNumberError");
  });

  it("can be caught as Error", () => {
    expect(() => {
      throw new InvalidIdNumberError("thrown");
    }).toThrow(Error);
  });

  it("can be caught as InvalidIdNumberError specifically", () => {
    expect(() => {
      throw new InvalidIdNumberError("thrown");
    }).toThrow(InvalidIdNumberError);
  });

  it("toString includes the name and message", () => {
    const err = new InvalidIdNumberError("the message");
    expect(err.toString()).toBe("InvalidIdNumberError: the message");
  });

  it("error chaining via cause is preserved across re-throw", () => {
    const root = new RangeError("range");
    let thrown: unknown;
    try {
      try {
        throw root;
      } catch (e) {
        throw new InvalidIdNumberError("wrapped", { cause: e });
      }
    } catch (e) {
      thrown = e;
    }
    expect(thrown).toBeInstanceOf(InvalidIdNumberError);
    expect((thrown as InvalidIdNumberError).cause).toBe(root);
  });

  it("two distinct instances with same message are not equal by reference", () => {
    const a = new InvalidIdNumberError("same");
    const b = new InvalidIdNumberError("same");
    expect(a).not.toBe(b);
    // But message comparison agrees
    expect(a.message).toBe(b.message);
  });
});
