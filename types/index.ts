export type ReportType = 'lost' | 'found';
export type ReportStatus = 'new' | 'pending' | 'resolved';
export type ReportCategory = 'phone' | 'wallet' | 'keys' | 'pet' | 'document' | 'bag' | 'jewelry' | 'electronics' | 'clothing' | 'other';
export type UserRole = 'user' | 'admin';
export type ContactRequestStatus = 'pending' | 'approved' | 'denied';

// Verified map location captured via Leaflet/OpenStreetMap + Nominatim.
// `locationVerified` is set authoritatively by the server after the coordinates
// pass validation — the client value is never trusted on its own.
export interface UserLocation {
  latitude: number | null;
  longitude: number | null;
  country: string;
  city: string;
  address: string;
  governorate: string; // nearest Egyptian governorate (derived)
  locationVerified: boolean;
  updatedAt?: string | null;
}

export interface User {
  id: string;
  name: string;
  username: string;
  phone: string;
  phoneVerified?: boolean;
  phoneVerifiedAt?: string | null;
  email: string;
  role: UserRole;
  points: number;
  balance: number;
  totalEarned: number;
  governorate?: string;
  city?: string;
  bio?: string;
  avatarUrl?: string;
  location?: UserLocation;
  notificationRadiusKm?: number; // proximity-alert radius: 5 | 10 | 25 | 50 km
  // National ID verification (display-safe fields; hash/embeddings stay server-side)
  idVerified?: boolean;
  idVerificationStatus?: 'unverified' | 'pending' | 'approved';
  idFullName?: string;
  maskedNationalId?: string;
  idVerifiedAt?: string | null;
  createdAt?: string;
}

export interface Report {
  id: string;
  title: string;
  description: string;
  category: ReportCategory;
  type: ReportType;
  location: string;
  governorate?: string;
  lat?: number | null;
  lng?: number | null;
  dateLostFound: string;
  imageUrl?: string;
  status: ReportStatus;
  ownerId: string;
  ownerName: string;
  contactMethod: string;
  // Ownership verification (FOUND reports only). The answer itself is never
  // exposed by the API — only the method and the question are public.
  verificationMethod?: VerificationMethod;
  verificationQuestion?: string;
  createdAt: string;
  resolvedAt?: string | null; // when the report became 'resolved'
}

// How ownership is verified for a FOUND report's contact requests.
export type VerificationMethod = 'manual' | 'question' | 'question_and_manual';

export interface Reward {
  id: string;
  title: string;
  description: string;
  image: string;
  requiredPoints: number;
  category: string;
  stock: number;
  usesVouchers: boolean;
  active: boolean;
  displayOrder: number;
  createdAt?: string;
}

export interface Redemption {
  id: string;
  userId: string;
  userName?: string;
  rewardId: string;
  rewardTitle: string;
  points: number;
  voucherCode?: string;
  status: 'fulfilled' | 'pending' | 'cancelled';
  createdAt: string;
}

export interface RewardStats {
  pointsBalance: number;
  walletBalance: number;
  totalRecoveries: number;
  totalRewardsRedeemed: number;
  lifetimeEarnedPoints: number;
  lifetimeRedeemedPoints: number;
  level: string;
  nextLevel: string | null;
  currentLevelMin: number;
  nextLevelAt: number | null;
  remainingToNext: number;
  progressPercent: number;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  recoveries: number;
  points: number;
  level: string;
}

export interface VoucherCodeItem {
  id: string;
  rewardId: string;
  code: string;
  used: boolean;
  usedBy?: string;
  usedAt?: string | null;
}

export interface Payout {
  id: string;
  userId: string;
  userName: string;
  points: number;
  amount: number;
  method: string;
  account: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface RewardConfig {
  pointsPerFoundReport: number;
  pointsPerRecovery: number;
  pointToEgp: number;
  minPayoutPoints: number;
}

export interface ContactMessage {
  senderId: string;
  senderName: string;
  body: string;
  createdAt: string;
}

export type RecoveryStatus =
  | 'none'
  | 'awaiting_owner_confirmation'
  | 'pending_admin_reward_review'
  | 'completed'
  | 'reward_rejected';

export interface RecoveryAuditEntry {
  action: string;
  actorId?: string;
  actorRole?: string;
  detail?: string;
  at?: string;
}

export interface RecoveryInfo {
  status: RecoveryStatus;
  finderDelivered: boolean;
  finderDeliveredAt?: string | null;
  finderUserId?: string;
  ownerReceived?: 'yes' | 'no' | null;
  ownerReceivedAt?: string | null;
  ownerUserId?: string;
  rewardGranted: boolean;
  rewardGrantedAt?: string | null;
  rewardedUserId?: string;
  rewardReviewedBy?: string;
  rewardRejectedReason?: string;
  rewardRejectedAt?: string | null;
  rewardSkippedReason?: string; // e.g. 'pair-cooldown'
  auditLog?: RecoveryAuditEntry[];
}

export interface ContactRequest {
  id: string;
  reportId: string;
  requesterId: string;
  requesterName: string;
  requesterEmail: string;
  reason: string;
  additionalDetails?: string;
  messages?: ContactMessage[];
  status: ContactRequestStatus;
  // True when the requester passed the FOUND report's verification question.
  verificationPassed?: boolean;
  recovery?: RecoveryInfo;
  createdAt: string;
}

export interface MatchExplanation {
  image: string;
  text: string;
  category: string;
  location: string;
  date: string;
  summary: string;
}

export interface MatchResult {
  report: Report;
  score: number; // 0..1 (backward compatible)
  // Hybrid AI matching breakdown (populated by the upgraded engine).
  overallConfidence?: number;
  finalScore?: number; // 0..100
  imageSimilarity?: number | null; // null => not computed
  textSimilarity?: number;
  categoryMatch?: number;
  locationMatch?: number;
  dateMatch?: number;
  // Per-factor contribution to the final score, in percentage points, plus the
  // maximum each factor can contribute (its weight × 100). image is null when no
  // photo could be compared.
  contributions?: {
    image: number | null;
    text: number;
    category: number;
    location: number;
    date: number;
    max?: { image: number; text: number; category: number; location: number; date: number };
  };
  visionAvailable?: boolean; // true => image compared by AI vision (CLIP)
  visionUsed?: boolean; // legacy alias of visionAvailable
  imageComputed?: boolean;
  visualValidation?: string; // why Stage-1 visual validation passed / was skipped
  textEngine?: 'embedding' | 'lexical' | string;
  explanation?: MatchExplanation | string;
}

export interface Notification {
  id: string;
  userId: string;
  reportId: string;
  matchedReportId?: string;   // set for AI-match alerts (local)
  message?: string;           // human-readable line (match alerts / fallback body)
  title?: string;             // proximity alert title
  body?: string;              // proximity alert body
  distanceKm?: number | null; // proximity alert distance badge
  isRead: boolean;
  createdAt: string;
  type?: string;              // proximity | match | comment | message | system
  targetUrl?: string;         // deep-link path to open on click
  targetId?: string;          // primary entity id the notification is about
  kind?: 'proximity' | 'match';
  source?: 'server' | 'local';
  data?: { reportTitle?: string; category?: string; imageUrl?: string; reportType?: string };
}

export type ReportSortOption = 'newest' | 'oldest' | 'most-relevant' | 'urgent';

// A single result from the AI image search (CLIP visual similarity + hybrid score).
export interface ImageSearchResult {
  report: Report;
  imageSimilarity: number;    // 0..1 — headline "Similarity %"
  finalScore: number;         // 0..1 — hybrid score used for ranking
  categoryMatch: number;      // 0 | 1
  textSimilarity: number;     // 0..1
  locationRelevance: number;  // 0..1
}
