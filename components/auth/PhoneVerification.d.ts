import * as React from 'react';

export interface PhoneVerifiedInfo {
  phone: string;
  phoneVerified: boolean;
  verifiedAt: string;
}

export interface PhoneVerificationProps {
  /** Initial phone value. */
  defaultPhone?: string;
  /** Fires as the user types — value is E.164 when valid. */
  onPhoneChange?: (value: string, valid: boolean) => void;
  /** Fires once the SMS OTP is confirmed. */
  onVerified?: (info: PhoneVerifiedInfo) => void;
  /** Tighter layout (used on the Profile page). */
  compact?: boolean;
}

export declare function PhoneVerification(props: PhoneVerificationProps): React.JSX.Element;
export default PhoneVerification;
