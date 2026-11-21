// Unit tests for the payment redirect guard. Run with: npm test (Node's built-in test runner;
// Node >= 22.18 strips the TypeScript types of payments.ts natively).
import { test } from "node:test";
import assert from "node:assert/strict";
import { GATEWAY_HOSTS, PAYMENT_GATEWAY_MODE, isSslcommerzUrl, readGatewayId } from "./payments.ts";

test("default mode is sandbox when NEXT_PUBLIC_SSLCOMMERZ_MODE is not 'live'", () => {
  if (process.env.NEXT_PUBLIC_SSLCOMMERZ_MODE !== "live") assert.equal(PAYMENT_GATEWAY_MODE, "sandbox");
  assert.equal(GATEWAY_HOSTS.sandbox, "sandbox.sslcommerz.com");
});

test("sandbox mode: only https://sandbox.sslcommerz.com is accepted", () => {
  assert.equal(isSslcommerzUrl("https://sandbox.sslcommerz.com/EasyCheckOut/testcde123", "sandbox"), true);
  assert.equal(isSslcommerzUrl("https://securepay.sslcommerz.com/EasyCheckOut/abc", "sandbox"), false, "live gateway blocked in sandbox");
  assert.equal(isSslcommerzUrl("http://sandbox.sslcommerz.com/x", "sandbox"), false, "plain http blocked");
});

test("live mode: only https://securepay.sslcommerz.com is accepted", () => {
  assert.equal(isSslcommerzUrl("https://securepay.sslcommerz.com/EasyCheckOut/abc", "live"), true);
  assert.equal(isSslcommerzUrl("https://sandbox.sslcommerz.com/EasyCheckOut/abc", "live"), false);
});

test("look-alike and invalid URLs are rejected in both modes", () => {
  for (const mode of ["sandbox", "live"]) {
    for (const bad of [
      "https://sandbox.sslcommerz.com.evil.example/x",
      "https://evil.example/?u=https://sandbox.sslcommerz.com",
      "https://sslcommerz.com.evil.example",
      "https://evilsslcommerz.com/x",
      "javascript:alert(1)",
      "not a url",
      "",
      null,
      42,
    ]) {
      assert.equal(isSslcommerzUrl(bad, mode), false, `${mode}: ${String(bad)}`);
    }
  }
});

test("readGatewayId accepts well-formed ids only", () => {
  assert.equal(readGatewayId("RENT-1731234567890-42"), "RENT-1731234567890-42");
  assert.equal(readGatewayId(["VAL_1", "x"]), "VAL_1");
  for (const bad of [undefined, "", "<script>", "a&b=c", "../x", "x".repeat(101)]) assert.equal(readGatewayId(bad), null);
});
