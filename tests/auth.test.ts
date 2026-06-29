import { describe, it, expect } from "vitest";
import { validateEmail, validatePassword, hashPassword } from "@/lib/auth";

describe("validateEmail", () => {
  it("rejects empty", () => expect(validateEmail("")).toMatch(/required/i));
  it("rejects bad format", () => {
    expect(validateEmail("nope")).toMatch(/valid/i);
    expect(validateEmail("a@b")).toMatch(/valid/i);
    expect(validateEmail("a@b.c")).toMatch(/valid/i);
  });
  it("accepts good email", () => {
    expect(validateEmail("hi@example.com")).toBeNull();
    expect(validateEmail("john.doe+test@sub.example.co")).toBeNull();
  });
});

describe("validatePassword", () => {
  it("rejects weak", () => {
    expect(validatePassword("")).toMatch(/required/i);
    expect(validatePassword("abcdefgh")).not.toBeNull();
    expect(validatePassword("Abcdefg1")).not.toBeNull(); // no special
    expect(validatePassword("Abcdef!a")).not.toBeNull(); // no digit
    expect(validatePassword("Aa1!aaa")).not.toBeNull(); // <8
  });
  it("accepts strong", () => {
    expect(validatePassword("Abcdef1!")).toBeNull();
    expect(validatePassword("StrongP@ss9")).toBeNull();
  });
});

describe("hashPassword", () => {
  it("is deterministic and differs by input", () => {
    expect(hashPassword("Abcdef1!")).toBe(hashPassword("Abcdef1!"));
    expect(hashPassword("Abcdef1!")).not.toBe(hashPassword("Abcdef1@"));
  });
});