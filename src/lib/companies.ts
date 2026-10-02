/** Companies registered on the platform: the directory and their public profiles. */

import type { Company } from '../components/BusinessDirectory';
import type { BusinessProfile } from '../components/ProfileMockData';
import { api } from './api';

/** Registered companies have database ids; the bundled sample companies use ids like "ent-3". */
export const isRegisteredCompanyId = (id: string): boolean => /^[0-9a-f]{24}$/.test(id);

export type CompanyProfile = BusinessProfile & { registered: true; isOwner: boolean; city: string; state: string; rating: number };

export const fetchCompanies = () => api<Company[]>('GET', '/companies');
export const fetchCompanyProfile = (id: string) => api<CompanyProfile>('GET', `/companies/${encodeURIComponent(id)}`);
export const saveMyCompanyProfile = (changes: Partial<CompanyProfile>) => api<CompanyProfile>('PUT', '/companies/me', changes);
export const postCompanyReview = (id: string, rating: number, comment: string) =>
  api<CompanyProfile>('POST', `/companies/${encodeURIComponent(id)}/reviews`, { rating, comment });

/** Placeholder shown while a registered company's profile is loading. Contains no invented details. */
export function emptyCompanyProfile(id: string, name: string, category: string): CompanyProfile {
  return {
    id,
    name,
    category,
    registered: true,
    isOwner: false,
    city: '',
    state: '',
    rating: 0,
    tagline: '',
    logoBg: 'bg-slate-700',
    coverBanner: '',
    verified: false,
    membership: 'Basic',
    description: '',
    yearEstablished: '',
    companyType: '',
    registrationNumber: '',
    gstin: '',
    pan: '',
    website: '',
    email: '',
    phone: '',
    whatsapp: '',
    addressCorporate: '',
    addressBranches: [],
    workingStates: [],
    workingCities: [],
    businessHours: '',
    languages: [],
    googleMapQuery: '',
    socials: {},
    introduction: '',
    vision: '',
    mission: '',
    coreStrengths: [],
    industriesServed: [],
    businessObjectives: '',
    products: [],
    services: [],
    brands: [],
    dealerships: [],
    specializations: [],
    team: [],
    portfolio: [],
    reviews: [],
    gallery: [],
    profileVisibility: 'Public',
    contactVisibility: 'Public',
    leadPreferences: { autoReply: false, notifyEmail: false, notifyWhatsApp: false, preferredLeadValue: '' },
  };
}
