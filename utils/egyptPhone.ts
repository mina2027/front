// ============================================================
// Egyptian mobile number validation + E.164 normalization.
//
// Valid local format: 01[0|1|2|5]XXXXXXXX  (11 digits; operators 010/011/012/015)
//   01012345678  →  +201012345678
// Accepts inputs already in +20 / 0020 / 20 form too. Rejects anything else.
// ============================================================

export interface EgyptPhoneResult {
  ok: boolean;
  e164: string;   // e.g. +201012345678
  local: string;  // e.g. 01012345678
  error?: string;
}

export function normalizeEgyptPhone(raw: string): EgyptPhoneResult {
  const cleaned = String(raw || '').replace(/[\s\-().]/g, '');
  if (!cleaned) {
    return { ok: false, e164: '', local: '', error: 'Phone number is required.' };
  }

  let local = '';
  if (/^0(1[0125]\d{8})$/.test(cleaned)) {
    local = cleaned;                                  // 01012345678
  } else if (/^\+?20(1[0125]\d{8})$/.test(cleaned)) {
    local = '0' + cleaned.replace(/^\+?20/, '');      // +201012345678 / 201012345678
  } else if (/^0020(1[0125]\d{8})$/.test(cleaned)) {
    local = '0' + cleaned.replace(/^0020/, '');       // 00201012345678
  } else {
    return {
      ok: false,
      e164: '',
      local: '',
      error: 'Enter a valid Egyptian mobile number (e.g. 01012345678).',
    };
  }

  return { ok: true, e164: '+20' + local.slice(1), local };
}

export function isValidEgyptPhone(raw: string): boolean {
  return normalizeEgyptPhone(raw).ok;
}
