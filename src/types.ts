export type Medication = 'Wegovy' | 'Zepbound';

export type EngagementStatus = 'engaged' | 'at-risk' | 'lapsed';

export type ProgramPhase =
  | 'Onboarding'
  | 'Titration'
  | 'Active Loss'
  | 'Plateau Support'
  | 'Maintenance'
  | 'Off-ramp';

export type EnrollmentStage =
  | 'Eligibility Verified'
  | 'Consent Signed'
  | 'Onboarded'
  | 'Active';

export interface WeightReading {
  date: string; // ISO date
  weightLbs: number;
  source: 'Connected Scale' | 'Self-reported';
}

export interface DoseLog {
  date: string;
  doseMg: number;
  taken: boolean;
}

export type SideEffectSeverity = 'mild' | 'moderate' | 'severe';

export interface SideEffect {
  id: string;
  date: string;
  symptom: string;
  severity: SideEffectSeverity;
  notes: string;
  escalated: boolean;
}

export interface WeightGoal {
  startDate: string;
  startWeightLbs: number;
  targetLossLbs: number;
  targetDate: string;
}

export interface SmartGoal {
  id: string;
  title: string;
  detail: string;
  category: 'Nutrition' | 'Activity' | 'Medication' | 'Lifestyle';
  status: 'on-track' | 'behind' | 'achieved';
  due: string;
}

export interface SessionNote {
  id: string;
  date: string;
  author: string;
  type: 'SOAP' | 'Quick Note';
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  signed: boolean;
}

export interface TitrationStep {
  doseMg: number;
  label: string;
  weeks: string;
}

export interface Member {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  sex: 'F' | 'M';
  unionLocal: string;
  employer: string;
  occupation: string;
  phase: ProgramPhase;
  enrollmentStage: EnrollmentStage;
  eligibilityStatus: 'Active' | 'Renewal Due' | 'Lapsed';
  consentSigned: boolean;
  enrolledDate: string;
  medication: Medication;
  currentDoseMg: number;
  titrationStepIndex: number;
  adherencePct: number; // last 4 weeks
  persistenceWeeks: number;
  engagement: EngagementStatus;
  lastContact: string;
  heightIn: number;
  proteinTargetG: number;
  weightGoal: WeightGoal;
  readings: WeightReading[];
  doseLogs: DoseLog[];
  sideEffects: SideEffect[];
  smartGoals: SmartGoal[];
  notes: SessionNote[];
}

export type AlertSeverity = 'high' | 'medium' | 'low';

export interface CoachAlert {
  id: string;
  memberId: string;
  severity: AlertSeverity;
  category: 'Side Effect' | 'Missed Dose' | 'Engagement' | 'Rapid Loss' | 'Eligibility';
  message: string;
  createdAt: string;
  resolved: boolean;
}

export interface CoachTask {
  id: string;
  memberId: string | null;
  title: string;
  due: string; // ISO datetime
  kind: 'Check-in' | 'Follow-up' | 'Documentation' | 'Outreach' | 'Admin';
  done: boolean;
}

export interface Message {
  id: string;
  memberId: string;
  from: 'member' | 'coach';
  body: string;
  sentAt: string;
  read: boolean;
}

export interface StaffMember {
  id: string;
  name: string;
  role: string;
}

export type InternalNoteCategory = 'Engagement' | 'Eligibility / PBM' | 'Side Effects' | 'General';

export interface InternalNoteReply {
  id: string;
  authorId: string;
  body: string;
  sentAt: string;
}

export interface InternalNote {
  id: string;
  memberId: string;
  title: string;
  body: string;
  authorId: string;
  taggedIds: string[];
  category: InternalNoteCategory;
  status: 'active' | 'resolved';
  createdAt: string;
  replies: InternalNoteReply[];
}

export interface Appointment {
  id: string;
  memberId: string;
  start: string;
  end: string;
  type: 'Video Session' | 'Phone Call' | 'Initial Consult';
  status: 'upcoming' | 'completed' | 'no-show';
}
