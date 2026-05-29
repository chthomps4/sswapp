import assert from "node:assert/strict";
import test from "node:test";
import {
  businessHubEvents,
  businessHubRouteAudit,
  getBusinessHubRouteAuditSummary,
  getOwnerActionItems,
  getUpcomingBusinessHubEvents,
} from "../src/lib/business-hub-operating-plan";

test("business hub events are private or internal by default", () => {
  assert.ok(businessHubEvents.length > 0);
  assert.equal(businessHubEvents.every((event) => event.privacy !== "public_safe"), true);
  assert.equal(businessHubEvents.some((event) => event.source === "google_calendar"), true);
});

test("upcoming business hub events are sorted by date and time", () => {
  const events = getUpcomingBusinessHubEvents(10, "2026-05-29");
  const keys = events.map((event) => `${event.date}T${event.startTime}`);
  assert.deepEqual(keys, [...keys].sort());
});

test("route audit identifies calendar and dashboard rescue work", () => {
  const calendar = businessHubRouteAudit.find((item) => item.route === "/calendar");
  const dashboard = businessHubRouteAudit.find((item) => item.route === "/");
  assert.equal(calendar?.status, "needs_integration");
  assert.equal(calendar?.priority, "P1");
  assert.equal(dashboard?.status, "sample_fallback");
});

test("route audit summary includes sample and integration gaps", () => {
  const summary = getBusinessHubRouteAuditSummary();
  assert.ok(summary.sample_fallback >= 1);
  assert.ok(summary.needs_integration >= 1);
  assert.equal(
    Object.values(summary).reduce((total, count) => total + count, 0),
    businessHubRouteAudit.length,
  );
});

test("owner action items include access and calendar boundary decisions", () => {
  const actionItems = getOwnerActionItems().join(" ");
  assert.match(actionItems, /Google calendars/i);
  assert.match(actionItems, /Slack #command/i);
  assert.match(actionItems, /private project folders/i);
});
