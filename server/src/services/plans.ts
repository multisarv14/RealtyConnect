import { getPlan } from '../../../shared/plans';
import { Organization } from '../models';

export const seatLimitFor = (planId: string | undefined) => getPlan(planId).limits.users;

export async function planOf(orgId: string) {
  const org = await Organization.findById(orgId).select('planId planExpiresAt').lean();
  // A paid plan that lapsed falls back to Free until it is renewed.
  const expired = org?.planExpiresAt && org.planExpiresAt.getTime() < Date.now();
  return getPlan(expired ? 'plan-free' : org?.planId);
}
