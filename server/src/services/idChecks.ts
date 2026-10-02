/** Format and check-digit validation for Indian business identifiers. */

const BASE36 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export function validatePan(pan: string): string | null {
  return /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan) ? null : 'PAN must be 10 characters like ABCDE1234F.';
}

/** GSTIN: 2-digit state, PAN, entity number, "Z", and a check character (mod-36 weighted sum). */
export function validateGstin(gstin: string): string | null {
  if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(gstin)) return 'GSTIN must be 15 characters like 27ABCDE1234F1Z5.';
  const state = parseInt(gstin.slice(0, 2), 10);
  if (state < 1 || state > 38) return 'The first two digits of the GSTIN are not a valid state code.';
  let sum = 0;
  for (let i = 0; i < 14; i++) {
    const code = BASE36.indexOf(gstin[i]);
    const product = code * (i % 2 === 0 ? 1 : 2);
    sum += Math.floor(product / 36) + (product % 36);
  }
  const check = BASE36[(36 - (sum % 36)) % 36];
  return check === gstin[14] ? null : 'This GSTIN fails its check-digit test. Please re-check each character.';
}

export function validateCin(cin: string): string | null {
  return /^[LU][0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}$/.test(cin) ? null : 'CIN must be 21 characters like U45200MH2012PTC184120.';
}
