/**
 * Who is signed in, for code that stamps new records with a person or company
 * name (organizer, assigned manager, publisher). App keeps this in step with the session.
 */

import type { Session } from './api';

let current: Session | null = null;

export function setCurrentIdentity(session: Session | null): void {
  current = session;
}

export const currentUserName = (): string => current?.name || current?.email || 'Guest';
export const currentUserEmail = (): string => current?.email || '';
export const currentOrgName = (): string => current?.organizationName || 'Guest';
export const currentOrgId = (): string | null => current?.orgId ?? null;
