import { test } from 'node:test';
import assert from 'node:assert/strict';
import { zonedTimeToUtc, eventInterval, zoneLabel } from '../src/lib/time.ts';

test('winter time in Warsaw is UTC+1', () => {
  assert.equal(zonedTimeToUtc('2026-11-25', '16:00', 'Europe/Warsaw').toISOString(), '2026-11-25T15:00:00.000Z');
});

test('summer time in Warsaw is UTC+2', () => {
  assert.equal(zonedTimeToUtc('2026-06-10', '16:00', 'Europe/Warsaw').toISOString(), '2026-06-10T14:00:00.000Z');
});

test('the day after the clocks change uses the new offset', () => {
  // Europe moves to summer time on 29 March 2026.
  assert.equal(zonedTimeToUtc('2026-03-29', '12:00', 'Europe/Warsaw').toISOString(), '2026-03-29T10:00:00.000Z');
  assert.equal(zonedTimeToUtc('2026-03-28', '12:00', 'Europe/Warsaw').toISOString(), '2026-03-28T11:00:00.000Z');
});

test('half-hour zones convert correctly', () => {
  assert.equal(zonedTimeToUtc('2026-11-25', '20:30', 'Asia/Kolkata').toISOString(), '2026-11-25T15:00:00.000Z');
});

test('an end time before the start runs past midnight', () => {
  const { start, end } = eventInterval('2026-11-25', '23:00', '00:30', 'Europe/Warsaw');
  assert.equal((end.getTime() - start.getTime()) / 60_000, 90);
});

test('zone labels are short', () => {
  assert.equal(zoneLabel(new Date('2026-11-25T15:00:00Z'), 'Europe/Warsaw'), 'CET');
});
