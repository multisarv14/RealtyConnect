import mongoose from 'mongoose';
import { STORE_KEYS } from '../../../shared/storeKeys';
import { notifyOrg } from './orgStore';

/**
 * Meeting reminders. Once a minute, meetings that start within their reminder window
 * (30 minutes before, 1 day before, ...) raise a notification for the owning company, once.
 * Meeting dates and times are entered without a time zone and are taken to be India Standard Time.
 */

const OFFSETS_MIN: Record<string, number> = {
  '15 Minutes Before': 15,
  '30 Minutes Before': 30,
  '1 Hour Before': 60,
  '1 Day Before': 24 * 60,
};

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

function startOf(date: string, time: string): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date || '');
  const t = /^(\d{1,2}):(\d{2})$/.exec(time || '');
  if (!m || !t) return null;
  return Date.UTC(+m[1], +m[2] - 1, +m[3], +t[1], +t[2]) - IST_OFFSET_MS;
}

export async function sendDueMeetingReminders(now = Date.now()): Promise<number> {
  const def = STORE_KEYS.realtyconnect_meetings;
  if (def.kind !== 'list') return 0;
  const coll = mongoose.connection.collection(def.collection);
  const candidates = await coll
    .find({ status: { $in: ['Scheduled', 'Confirmed', 'Rescheduled'] }, _remindedFor: { $exists: false }, meetingDate: { $gte: new Date(now - 86400000).toISOString().slice(0, 10) } })
    .limit(500)
    .toArray();
  let sent = 0;
  for (const meeting of candidates) {
    const offset = OFFSETS_MIN[meeting.reminderTime];
    const start = startOf(meeting.meetingDate, meeting.startTime);
    if (offset === undefined || start === null || !meeting._orgId) continue;
    if (start - offset * 60000 > now || start < now) continue; // too early, or already started
    // Claim it first so two server instances do not both send.
    const claimed = await coll.updateOne({ _id: meeting._id, _remindedFor: { $exists: false } }, { $set: { _remindedFor: `${meeting.meetingDate} ${meeting.startTime}` } });
    if (!claimed.modifiedCount) continue;
    await notifyOrg(String(meeting._orgId), `Reminder: "${meeting.title}" with ${meeting.relatedCompany} starts at ${meeting.startTime} on ${meeting.meetingDate}.`);
    sent++;
  }
  return sent;
}

export function startReminderWorker(): () => void {
  const timer = setInterval(() => {
    sendDueMeetingReminders().catch(err => console.error('[reminders]', err));
  }, 60_000);
  return () => clearInterval(timer);
}
