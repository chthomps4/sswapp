import assert from "node:assert/strict";
import test from "node:test";
import { getOwnerEmails, isOwnerEmail } from "../src/lib/owner-access";

test("owner access fails closed when OWNER_EMAILS is missing", () => {
  const original = process.env.OWNER_EMAILS;
  delete process.env.OWNER_EMAILS;

  try {
    assert.deepEqual(getOwnerEmails(), []);
    assert.equal(isOwnerEmail("chthomps84@gmail.com"), false);
  } finally {
    if (original === undefined) {
      delete process.env.OWNER_EMAILS;
    } else {
      process.env.OWNER_EMAILS = original;
    }
  }
});

test("owner access only allows configured owner emails", () => {
  const original = process.env.OWNER_EMAILS;
  process.env.OWNER_EMAILS = "chthomps84@gmail.com, chad@lswdesigns.studio, chad@lswdesigns.info";

  try {
    assert.equal(isOwnerEmail(" CHTHOMPS84@gmail.com "), true);
    assert.equal(isOwnerEmail("chad@lswdesigns.studio"), true);
    assert.equal(isOwnerEmail("chad@lswdesigns.info"), true);
    assert.equal(isOwnerEmail("not-owner@example.com"), false);
  } finally {
    if (original === undefined) {
      delete process.env.OWNER_EMAILS;
    } else {
      process.env.OWNER_EMAILS = original;
    }
  }
});
