import dayjs from 'dayjs';
import type {
  Appointment,
  CoachAlert,
  CoachTask,
  DoseLog,
  InternalNote,
  Member,
  Message,
  SessionNote,
  SideEffect,
  SmartGoal,
  StaffMember,
  TitrationStep,
  WeightReading,
} from '../types';

export const TODAY = dayjs('2026-06-12T08:00:00');

// Deterministic PRNG so demo data is stable across reloads.
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const TITRATION: Record<string, TitrationStep[]> = {
  Wegovy: [
    { doseMg: 0.25, label: 'Starting dose', weeks: 'Weeks 1–4' },
    { doseMg: 0.5, label: 'Step 2', weeks: 'Weeks 5–8' },
    { doseMg: 1.0, label: 'Step 3', weeks: 'Weeks 9–12' },
    { doseMg: 1.7, label: 'Step 4', weeks: 'Weeks 13–16' },
    { doseMg: 2.4, label: 'Maintenance dose', weeks: 'Week 17+' },
  ],
  Zepbound: [
    { doseMg: 2.5, label: 'Starting dose', weeks: 'Weeks 1–4' },
    { doseMg: 5, label: 'Step 2', weeks: 'Weeks 5–8' },
    { doseMg: 7.5, label: 'Step 3', weeks: 'Weeks 9–12' },
    { doseMg: 10, label: 'Step 4', weeks: 'Weeks 13–16' },
    { doseMg: 12.5, label: 'Step 5', weeks: 'Weeks 17–20' },
    { doseMg: 15, label: 'Maintenance dose', weeks: 'Week 21+' },
  ],
};

interface Seed {
  first: string;
  last: string;
  age: number;
  sex: 'F' | 'M';
  local: string;
  employer: string;
  occupation: string;
  med: 'Wegovy' | 'Zepbound';
  weeksIn: number;
  startWeight: number;
  targetLoss: number;
  engagement: 'engaged' | 'at-risk' | 'lapsed';
  lossRate: number; // avg lbs/week
}

const SEEDS: Seed[] = [
  { first: 'Maria', last: 'Delgado', age: 47, sex: 'F', local: 'UFCW Local 881', employer: 'Midwest Grocers Co-op', occupation: 'Deli Manager', med: 'Wegovy', weeksIn: 24, startWeight: 238, targetLoss: 40, engagement: 'engaged', lossRate: 1.4 },
  { first: 'James', last: 'Okafor', age: 52, sex: 'M', local: 'IBEW Local 134', employer: 'Lakeshore Electric', occupation: 'Journeyman Electrician', med: 'Zepbound', weeksIn: 18, startWeight: 286, targetLoss: 55, engagement: 'engaged', lossRate: 1.9 },
  { first: 'Patricia', last: 'Nowak', age: 58, sex: 'F', local: 'SEIU Local 73', employer: 'Cook County Schools', occupation: 'School Custodian', med: 'Wegovy', weeksIn: 31, startWeight: 212, targetLoss: 35, engagement: 'at-risk', lossRate: 0.9 },
  { first: 'Darnell', last: 'Hayes', age: 41, sex: 'M', local: 'Teamsters Local 705', employer: 'Great Lakes Freight', occupation: 'Delivery Driver', med: 'Zepbound', weeksIn: 9, startWeight: 312, targetLoss: 70, engagement: 'engaged', lossRate: 2.2 },
  { first: 'Linda', last: 'Tran', age: 49, sex: 'F', local: 'SEIU Local 73', employer: 'Riverside Medical Center', occupation: 'Patient Services Rep', med: 'Wegovy', weeksIn: 14, startWeight: 198, targetLoss: 30, engagement: 'engaged', lossRate: 1.2 },
  { first: 'Robert', last: 'Kaminski', age: 61, sex: 'M', local: 'IBEW Local 134', employer: 'Lakeshore Electric', occupation: 'Foreman', med: 'Wegovy', weeksIn: 38, startWeight: 264, targetLoss: 45, engagement: 'lapsed', lossRate: 0.7 },
  { first: 'Angela', last: 'Brooks', age: 38, sex: 'F', local: 'UFCW Local 881', employer: 'Midwest Grocers Co-op', occupation: 'Front-End Supervisor', med: 'Zepbound', weeksIn: 12, startWeight: 244, targetLoss: 50, engagement: 'engaged', lossRate: 1.8 },
  { first: 'Miguel', last: 'Santos', age: 44, sex: 'M', local: 'Teamsters Local 705', employer: 'Great Lakes Freight', occupation: 'Warehouse Lead', med: 'Zepbound', weeksIn: 21, startWeight: 298, targetLoss: 60, engagement: 'at-risk', lossRate: 1.5 },
  { first: 'Denise', last: 'Whitfield', age: 55, sex: 'F', local: 'SEIU Local 73', employer: 'Cook County Schools', occupation: 'Cafeteria Manager', med: 'Wegovy', weeksIn: 27, startWeight: 226, targetLoss: 38, engagement: 'engaged', lossRate: 1.1 },
  { first: 'Kevin', last: "O'Brien", age: 35, sex: 'M', local: 'IBEW Local 134', employer: 'Northside Power Systems', occupation: 'Apprentice Electrician', med: 'Wegovy', weeksIn: 6, startWeight: 252, targetLoss: 45, engagement: 'engaged', lossRate: 1.6 },
  { first: 'Sandra', last: 'Petrova', age: 50, sex: 'F', local: 'UFCW Local 881', employer: 'Midwest Grocers Co-op', occupation: 'Bakery Lead', med: 'Zepbound', weeksIn: 16, startWeight: 219, targetLoss: 35, engagement: 'at-risk', lossRate: 1.0 },
  { first: 'Marcus', last: 'Reed', age: 46, sex: 'M', local: 'Teamsters Local 705', employer: 'Great Lakes Freight', occupation: 'Dispatcher', med: 'Wegovy', weeksIn: 44, startWeight: 274, targetLoss: 50, engagement: 'engaged', lossRate: 1.0 },
];

const SYMPTOMS = ['Nausea', 'Constipation', 'Fatigue', 'Heartburn', 'Injection-site irritation', 'Dizziness'];

function buildReadings(seed: Seed, rand: () => number): WeightReading[] {
  const readings: WeightReading[] = [];
  let w = seed.startWeight;
  for (let week = 0; week <= seed.weeksIn; week++) {
    const date = TODAY.subtract(seed.weeksIn - week, 'week');
    if (week > 0) {
      // Loss tapers over time, with noise; lapsed members plateau late.
      const taper = 1 - (week / seed.weeksIn) * 0.45;
      const lapse = seed.engagement === 'lapsed' && week > seed.weeksIn * 0.6 ? 0.2 : 1;
      w -= seed.lossRate * taper * lapse + (rand() - 0.5) * 1.6;
    }
    // Lapsed/at-risk members miss recent readings.
    const missChance = seed.engagement === 'lapsed' && week > seed.weeksIn - 4 ? 0.8
      : seed.engagement === 'at-risk' && week > seed.weeksIn - 3 ? 0.45 : 0.05;
    if (rand() < missChance) continue;
    readings.push({
      date: date.format('YYYY-MM-DD'),
      weightLbs: Math.round(w * 10) / 10,
      source: rand() < 0.8 ? 'Connected Scale' : 'Self-reported',
    });
  }
  return readings;
}

function buildDoseLogs(seed: Seed, member: Pick<Member, 'medication' | 'titrationStepIndex'>, rand: () => number): DoseLog[] {
  const ladder = TITRATION[seed.med];
  const logs: DoseLog[] = [];
  for (let week = 1; week <= seed.weeksIn; week++) {
    const stepIdx = Math.min(Math.floor((week - 1) / 4), member.titrationStepIndex);
    const missChance = seed.engagement === 'lapsed' && week > seed.weeksIn - 5 ? 0.5
      : seed.engagement === 'at-risk' ? 0.18
      : week > seed.weeksIn - 4 ? 0 // engaged members stay current in recent weeks
      : 0.05;
    logs.push({
      date: TODAY.subtract(seed.weeksIn - week, 'week').format('YYYY-MM-DD'),
      doseMg: ladder[stepIdx].doseMg,
      taken: rand() > missChance,
    });
  }
  return logs;
}

function buildSideEffects(seed: Seed, idx: number, rand: () => number): SideEffect[] {
  const effects: SideEffect[] = [];
  const count = Math.floor(rand() * 3) + (seed.engagement === 'at-risk' ? 1 : 0);
  for (let i = 0; i < count; i++) {
    const sev = rand();
    effects.push({
      id: `se-${idx}-${i}`,
      date: TODAY.subtract(Math.floor(rand() * seed.weeksIn * 5), 'day').format('YYYY-MM-DD'),
      symptom: SYMPTOMS[Math.floor(rand() * SYMPTOMS.length)],
      severity: sev > 0.85 ? 'severe' : sev > 0.5 ? 'moderate' : 'mild',
      notes: 'Reported during weekly check-in.',
      escalated: sev > 0.85,
    });
  }
  return effects.sort((a, b) => b.date.localeCompare(a.date));
}

function buildSmartGoals(seed: Seed, idx: number, rand: () => number): SmartGoal[] {
  const pool: Omit<SmartGoal, 'id' | 'status' | 'due'>[] = [
    { title: `Hit ${Math.round(seed.startWeight * 0.45 / 2.2 * 1.4)}g protein daily`, detail: 'Protein-first plating at each meal to preserve lean mass during loss.', category: 'Nutrition' },
    { title: 'Resistance training 2x/week', detail: '20-minute band or bodyweight session, Tue/Sat.', category: 'Activity' },
    { title: 'Log injection day reminder', detail: 'Weekly dose every Sunday evening with phone reminder.', category: 'Medication' },
    { title: '7,000 steps on workdays', detail: 'Track via phone; park farther on site days.', category: 'Activity' },
    { title: 'Sleep by 10:30pm on weeknights', detail: 'Wind-down alarm; no screens after 10pm.', category: 'Lifestyle' },
  ];
  const n = 2 + Math.floor(rand() * 2);
  return pool.slice(0, n).map((g, i) => ({
    ...g,
    id: `sg-${idx}-${i}`,
    status: rand() > 0.7 ? 'achieved' : rand() > 0.35 ? 'on-track' : 'behind',
    due: TODAY.add(Math.floor(rand() * 6) + 1, 'week').format('YYYY-MM-DD'),
  }));
}

function buildNotes(seed: Seed, idx: number, name: string): SessionNote[] {
  const notes: SessionNote[] = [];
  const sessions = Math.min(Math.floor(seed.weeksIn / 2), 6);
  for (let i = 0; i < sessions; i++) {
    const d = TODAY.subtract(i * 2, 'week').subtract(2, 'day');
    notes.push({
      id: `note-${idx}-${i}`,
      date: d.format('YYYY-MM-DD'),
      author: 'Sarah Mitchell, NBC-HWC',
      type: 'SOAP',
      subjective: `${name} reports ${i === 0 ? 'steady energy and improving portion awareness' : 'good adherence with some weekend challenges'}. Appetite suppression noted on current dose.`,
      objective: `Weight trending per plan. Dose logs current. ${i === 0 ? 'Protein intake averaging near target.' : 'Step count slightly below goal.'}`,
      assessment: 'Progressing toward weight goal; behavior changes consolidating. No clinical concerns this session.',
      plan: 'Continue current titration step. Reinforce protein-first meals and resistance training. Next session in 2 weeks.',
      signed: i > 0,
    });
  }
  return notes;
}

function buildMembers(): Member[] {
  return SEEDS.map((seed, idx) => {
    const rand = mulberry32(idx + 7);
    const ladder = TITRATION[seed.med];
    const titrationStepIndex = Math.min(Math.floor(seed.weeksIn / 4), ladder.length - 1);
    const readings = buildReadings(seed, rand);
    const phase = seed.weeksIn <= 4 ? 'Onboarding'
      : titrationStepIndex < ladder.length - 1 ? 'Titration'
      : seed.weeksIn > 40 ? 'Maintenance'
      : seed.engagement === 'lapsed' ? 'Plateau Support'
      : 'Active Loss';
    const doseLogs = buildDoseLogs(seed, { medication: seed.med, titrationStepIndex }, rand);
    const recent = doseLogs.slice(-4);
    const adherencePct = Math.round((recent.filter((d) => d.taken).length / recent.length) * 100);
    const lastContactDays = seed.engagement === 'lapsed' ? 19 : seed.engagement === 'at-risk' ? 8 : Math.floor(rand() * 4) + 1;
    return {
      id: `m-${idx + 1}`,
      firstName: seed.first,
      lastName: seed.last,
      age: seed.age,
      sex: seed.sex,
      unionLocal: seed.local,
      employer: seed.employer,
      occupation: seed.occupation,
      phase,
      enrollmentStage: 'Active',
      eligibilityStatus: seed.engagement === 'lapsed' ? 'Renewal Due' : 'Active',
      consentSigned: true,
      enrolledDate: TODAY.subtract(seed.weeksIn, 'week').format('YYYY-MM-DD'),
      medication: seed.med,
      currentDoseMg: ladder[titrationStepIndex].doseMg,
      titrationStepIndex,
      adherencePct,
      persistenceWeeks: seed.weeksIn,
      engagement: seed.engagement,
      lastContact: TODAY.subtract(lastContactDays, 'day').format('YYYY-MM-DD'),
      heightIn: seed.sex === 'F' ? 64 + Math.floor(rand() * 4) : 68 + Math.floor(rand() * 5),
      proteinTargetG: Math.round((seed.startWeight / 2.2) * 1.2),
      weightGoal: {
        startDate: TODAY.subtract(seed.weeksIn, 'week').format('YYYY-MM-DD'),
        startWeightLbs: seed.startWeight,
        targetLossLbs: seed.targetLoss,
        targetDate: TODAY.subtract(seed.weeksIn, 'week').add(Math.round(seed.targetLoss / 1.2), 'week').format('YYYY-MM-DD'),
      },
      readings,
      doseLogs,
      sideEffects: buildSideEffects(seed, idx, rand),
      smartGoals: buildSmartGoals(seed, idx, rand),
      notes: buildNotes(seed, idx, seed.first),
    };
  });
}

export const MEMBERS: Member[] = buildMembers();

export function memberById(id: string): Member | undefined {
  return MEMBERS.find((m) => m.id === id);
}

export function currentWeight(m: Member): number {
  return m.readings.length ? m.readings[m.readings.length - 1].weightLbs : m.weightGoal.startWeightLbs;
}

export function totalLoss(m: Member): number {
  return Math.round((m.weightGoal.startWeightLbs - currentWeight(m)) * 10) / 10;
}

export function goalProgressPct(m: Member): number {
  return Math.max(0, Math.min(100, Math.round((totalLoss(m) / m.weightGoal.targetLossLbs) * 100)));
}

function fullName(m: Member) {
  return `${m.firstName} ${m.lastName}`;
}

export const ALERTS: CoachAlert[] = [
  { id: 'a-1', memberId: 'm-8', severity: 'high', category: 'Side Effect', message: `${fullName(MEMBERS[7])} reported severe nausea after dose increase to ${MEMBERS[7].currentDoseMg}mg — review and escalate to prescriber.`, createdAt: TODAY.subtract(2, 'hour').toISOString(), resolved: false },
  { id: 'a-2', memberId: 'm-6', severity: 'high', category: 'Engagement', message: `${fullName(MEMBERS[5])} has had no weight readings or messages for 19 days — persistence risk.`, createdAt: TODAY.subtract(5, 'hour').toISOString(), resolved: false },
  { id: 'a-3', memberId: 'm-3', severity: 'medium', category: 'Missed Dose', message: `${fullName(MEMBERS[2])} missed 2 of last 4 weekly doses (${MEMBERS[2].adherencePct}% adherence).`, createdAt: TODAY.subtract(1, 'day').toISOString(), resolved: false },
  { id: 'a-4', memberId: 'm-11', severity: 'medium', category: 'Missed Dose', message: `${fullName(MEMBERS[10])} skipped this week's injection — check in on side-effect concerns.`, createdAt: TODAY.subtract(1, 'day').toISOString(), resolved: false },
  { id: 'a-5', memberId: 'm-4', severity: 'low', category: 'Rapid Loss', message: `${fullName(MEMBERS[3])} losing >2.5 lbs/week for 3 weeks — reinforce protein target to protect lean mass.`, createdAt: TODAY.subtract(2, 'day').toISOString(), resolved: false },
  { id: 'a-6', memberId: 'm-6', severity: 'low', category: 'Eligibility', message: `${fullName(MEMBERS[5])}'s benefit eligibility renewal is due July 1 — confirm with IBEW Local 134 fund office.`, createdAt: TODAY.subtract(3, 'day').toISOString(), resolved: false },
];

export const TASKS: CoachTask[] = [
  { id: 't-1', memberId: 'm-8', title: 'Call Miguel Santos re: severe nausea report', due: TODAY.hour(9).minute(30).toISOString(), kind: 'Follow-up', done: false },
  { id: 't-2', memberId: 'm-2', title: 'Video session — James Okafor (week 18 review)', due: TODAY.hour(10).minute(0).toISOString(), kind: 'Check-in', done: false },
  { id: 't-3', memberId: 'm-6', title: 'Re-engagement outreach — Robert Kaminski (19 days quiet)', due: TODAY.hour(11).minute(15).toISOString(), kind: 'Outreach', done: false },
  { id: 't-4', memberId: 'm-1', title: 'Video session — Maria Delgado (goal milestone review)', due: TODAY.hour(13).minute(0).toISOString(), kind: 'Check-in', done: false },
  { id: 't-5', memberId: 'm-2', title: 'Sign SOAP note from today’s session', due: TODAY.hour(14).minute(0).toISOString(), kind: 'Documentation', done: false },
  { id: 't-6', memberId: 'm-10', title: "Send week-6 titration education pack — Kevin O'Brien", due: TODAY.hour(15).minute(0).toISOString(), kind: 'Follow-up', done: false },
  { id: 't-7', memberId: 'm-5', title: 'Video session — Linda Tran (protein plan refresh)', due: TODAY.hour(15).minute(30).toISOString(), kind: 'Check-in', done: false },
  { id: 't-8', memberId: null, title: 'Submit weekly cohort summary to SEIU Local 73 fund office', due: TODAY.hour(16).minute(30).toISOString(), kind: 'Admin', done: false },
];

export const MESSAGES: Message[] = [
  { id: 'msg-1', memberId: 'm-8', from: 'member', body: "The new dose is hitting me hard — couldn't keep dinner down last night. Should I skip this week's shot?", sentAt: TODAY.subtract(2, 'hour').toISOString(), read: false },
  { id: 'msg-2', memberId: 'm-1', from: 'member', body: 'Down another 1.5 lbs this week!! 4 lbs from my goal 🎉', sentAt: TODAY.subtract(3, 'hour').toISOString(), read: false },
  { id: 'msg-3', memberId: 'm-10', from: 'member', body: 'Quick question — is it normal to feel full after just half a meal? Trying not to under-eat protein.', sentAt: TODAY.subtract(5, 'hour').toISOString(), read: false },
  { id: 'msg-4', memberId: 'm-4', from: 'member', body: 'Got my resistance bands. Can you send that 20-min routine you mentioned?', sentAt: TODAY.subtract(1, 'day').toISOString(), read: true },
  { id: 'msg-5', memberId: 'm-4', from: 'coach', body: 'Absolutely — sending the routine now. Start with 2 sets and we’ll review form on Friday’s call.', sentAt: TODAY.subtract(1, 'day').add(1, 'hour').toISOString(), read: true },
  { id: 'msg-6', memberId: 'm-7', from: 'member', body: 'Survived the family BBQ — protein first, one plate, no seconds. Old me would have gone back three times.', sentAt: TODAY.subtract(2, 'day').toISOString(), read: true },
  { id: 'msg-7', memberId: 'm-7', from: 'coach', body: 'That is a huge win, Angela. That skill is exactly what keeps results durable after titration. 👏', sentAt: TODAY.subtract(2, 'day').add(2, 'hour').toISOString(), read: true },
  { id: 'msg-8', memberId: 'm-3', from: 'coach', body: 'Hi Patricia — noticed a couple of missed doses. No judgment at all; want to find 10 minutes this week to talk through what’s getting in the way?', sentAt: TODAY.subtract(3, 'day').toISOString(), read: true },
  { id: 'msg-9', memberId: 'm-12', from: 'member', body: 'One year in. Never thought I’d be the guy meal-prepping on Sundays. Thanks coach.', sentAt: TODAY.subtract(4, 'day').toISOString(), read: true },
];

export const APPOINTMENTS: Appointment[] = [
  { id: 'ap-1', memberId: 'm-2', start: TODAY.hour(10).minute(0).toISOString(), end: TODAY.hour(10).minute(30).toISOString(), type: 'Video Session', status: 'upcoming' },
  { id: 'ap-2', memberId: 'm-1', start: TODAY.hour(13).minute(0).toISOString(), end: TODAY.hour(13).minute(30).toISOString(), type: 'Video Session', status: 'upcoming' },
  { id: 'ap-3', memberId: 'm-5', start: TODAY.hour(15).minute(30).toISOString(), end: TODAY.hour(16).minute(0).toISOString(), type: 'Video Session', status: 'upcoming' },
  { id: 'ap-4', memberId: 'm-9', start: TODAY.add(1, 'day').hour(9).minute(30).toISOString(), end: TODAY.add(1, 'day').hour(10).minute(0).toISOString(), type: 'Phone Call', status: 'upcoming' },
  { id: 'ap-5', memberId: 'm-11', start: TODAY.add(1, 'day').hour(11).minute(0).toISOString(), end: TODAY.add(1, 'day').hour(11).minute(30).toISOString(), type: 'Video Session', status: 'upcoming' },
  { id: 'ap-6', memberId: 'm-10', start: TODAY.add(3, 'day').hour(14).minute(0).toISOString(), end: TODAY.add(3, 'day').hour(14).minute(30).toISOString(), type: 'Video Session', status: 'upcoming' },
  { id: 'ap-7', memberId: 'm-4', start: TODAY.add(1, 'day').hour(14).minute(0).toISOString(), end: TODAY.add(1, 'day').hour(14).minute(30).toISOString(), type: 'Video Session', status: 'upcoming' },
  { id: 'ap-8', memberId: 'm-3', start: TODAY.subtract(1, 'day').hour(10).minute(0).toISOString(), end: TODAY.subtract(1, 'day').hour(10).minute(30).toISOString(), type: 'Video Session', status: 'no-show' },
  { id: 'ap-9', memberId: 'm-12', start: TODAY.subtract(1, 'day').hour(15).minute(0).toISOString(), end: TODAY.subtract(1, 'day').hour(15).minute(30).toISOString(), type: 'Video Session', status: 'completed' },
  { id: 'ap-10', memberId: 'm-7', start: TODAY.subtract(2, 'day').hour(11).minute(0).toISOString(), end: TODAY.subtract(2, 'day').hour(11).minute(30).toISOString(), type: 'Video Session', status: 'completed' },
  { id: 'ap-11', memberId: 'm-6', start: TODAY.add(4, 'day').hour(10).minute(0).toISOString(), end: TODAY.add(4, 'day').hour(10).minute(30).toISOString(), type: 'Phone Call', status: 'upcoming' },
];

export const COACH = {
  name: 'Sarah Mitchell',
  credentials: 'NBC-HWC',
  title: 'Senior Health Coach',
  email: 'sarah.mitchell@summithealth.com',
};

export const CURRENT_STAFF_ID = 's-1';

export const STAFF: StaffMember[] = [
  { id: 's-1', name: 'Sarah Mitchell', role: 'Senior Health Coach' },
  { id: 's-2', name: 'Dr. Elena Vasquez', role: 'Supervising Clinician' },
  { id: 's-3', name: 'Priya Raman', role: 'Pharmacy Liaison (PBM)' },
  { id: 's-4', name: 'Marcus Webb', role: 'Program Manager' },
  { id: 's-5', name: 'Janet Cole', role: 'Member Services — Eligibility' },
];

export function staffById(id: string): StaffMember | undefined {
  return STAFF.find((s) => s.id === id);
}

export const INTERNAL_NOTES: InternalNote[] = [
  {
    id: 'in-1',
    memberId: 'm-8',
    title: 'Severe nausea after 15 mg step — hold or step back?',
    body: 'Miguel reported severe nausea after moving to 15 mg and skipped dinner two nights running. He is asking whether to skip this week’s shot. I’ve advised small protein-first meals in the meantime — need clinical guidance on whether to hold at 15 mg, step back to 12.5 mg, or pause a week.',
    authorId: 's-1',
    taggedIds: ['s-2'],
    category: 'Side Effects',
    status: 'active',
    createdAt: TODAY.subtract(2, 'hour').toISOString(),
    replies: [
      { id: 'in-1-r1', authorId: 's-2', body: 'Have him hold the next dose and step back to 12.5 mg for two weeks. If nausea persists at 12.5 I want a call with him. Please log this as an escalated side effect.', sentAt: TODAY.subtract(1, 'hour').toISOString() },
    ],
  },
  {
    id: 'in-2',
    memberId: 'm-6',
    title: 'Re-engagement strategy — 19 days quiet',
    body: 'Robert has gone quiet — no readings or messages for 19 days and half his recent doses missed. He’s one of our longest-tenured members and his local’s fund office watches retention closely. Sarah — what’s the re-engagement plan? Happy to support with program-level options.',
    authorId: 's-4',
    taggedIds: ['s-1'],
    category: 'Engagement',
    status: 'active',
    createdAt: TODAY.subtract(1, 'day').toISOString(),
    replies: [
      { id: 'in-2-r1', authorId: 's-1', body: 'He responds better to phone than app messages — planning a low-pressure call Friday framed around maintenance, not loss. Considering a 4-week "reset goal" with one habit (evening walk).', sentAt: TODAY.subtract(20, 'hour').toISOString() },
      { id: 'in-2-r2', authorId: 's-4', body: 'Like it — the reset-goal pattern worked well for plateau members last quarter. Also worth mentioning his eligibility renewal on the call so it doesn’t surprise him.', sentAt: TODAY.subtract(18, 'hour').toISOString() },
    ],
  },
  {
    id: 'in-3',
    memberId: 'm-6',
    title: 'Benefit renewal due July 1 — PBM confirmation needed',
    body: 'Robert’s eligibility shows Renewal Due with the IBEW Local 134 fund office. Priya — can you confirm with the PBM whether his Wegovy prior auth carries through the renewal or needs resubmission? Don’t want a coverage gap mid-titration-maintenance.',
    authorId: 's-5',
    taggedIds: ['s-1', 's-3'],
    category: 'Eligibility / PBM',
    status: 'active',
    createdAt: TODAY.subtract(3, 'day').toISOString(),
    replies: [
      { id: 'in-3-r1', authorId: 's-3', body: 'Checked with the PBM — prior auth survives renewal IF the fund office files by June 20. I’ve flagged it with their administrator and will chase next week.', sentAt: TODAY.subtract(2, 'day').toISOString() },
    ],
  },
  {
    id: 'in-4',
    memberId: 'm-3',
    title: 'Missed doses — exploring barriers, not motivation',
    body: 'Patricia has missed 2 of her last 4 doses but engages well in sessions. I don’t think this is motivation — suspect either injection anxiety or a scheduling barrier (she works early shifts). Planning a barriers conversation this week; tagging for visibility in case a clinician call would help.',
    authorId: 's-1',
    taggedIds: ['s-2'],
    category: 'Engagement',
    status: 'active',
    createdAt: TODAY.subtract(4, 'day').toISOString(),
    replies: [],
  },
  {
    id: 'in-5',
    memberId: 'm-11',
    title: 'Skipped injection — possible side-effect anxiety',
    body: 'Sandra skipped this week’s injection without a logged reason, and her last side-effect entry was moderate heartburn. I suspect she may be avoiding the dose to avoid symptoms. Can you raise it gently at her next check-in? If it is symptom avoidance I can adjust the plan — antacid guidance and dosing with food are both options.',
    authorId: 's-2',
    taggedIds: ['s-1'],
    category: 'Side Effects',
    status: 'active',
    createdAt: TODAY.subtract(5, 'day').toISOString(),
    replies: [],
  },
  {
    id: 'in-9',
    memberId: 'm-2',
    title: 'Zepbound supply constraint — heads-up for July fills',
    body: 'The PBM flagged intermittent Zepbound supply issues for July fills at retail pharmacies. James is due for his next refill mid-July. Mail-order has stock — at his next session, can you ask whether he wants me to move his fills over before it becomes a gap?',
    authorId: 's-3',
    taggedIds: ['s-1'],
    category: 'Eligibility / PBM',
    status: 'active',
    createdAt: TODAY.subtract(6, 'hour').toISOString(),
    replies: [],
  },
  {
    id: 'in-6',
    memberId: 'm-4',
    title: 'Rapid loss >2.5 lbs/week — protein plan adjusted',
    body: 'Darnell was losing faster than 2.5 lbs/week for three straight weeks. Reviewed intake — protein well under target on site days. We agreed a packed-lunch plan and two resistance sessions weekly.',
    authorId: 's-1',
    taggedIds: ['s-2'],
    category: 'Side Effects',
    status: 'resolved',
    createdAt: TODAY.subtract(3, 'week').toISOString(),
    replies: [
      { id: 'in-6-r1', authorId: 's-2', body: 'Plan looks right. Recheck weekly rate in two weeks; flag me if still >2.5.', sentAt: TODAY.subtract(20, 'day').toISOString() },
      { id: 'in-6-r2', authorId: 's-1', body: 'Two-week recheck done — rate now 1.9 lbs/week and protein at target. Resolving.', sentAt: TODAY.subtract(6, 'day').toISOString() },
    ],
  },
  {
    id: 'in-7',
    memberId: 'm-5',
    title: 'PBM prior auth renewal — approved',
    body: 'Linda’s Wegovy prior authorization was due to lapse at month end. Submitted renewal with updated weight-loss documentation (12.4% from baseline).',
    authorId: 's-3',
    taggedIds: ['s-1'],
    category: 'Eligibility / PBM',
    status: 'resolved',
    createdAt: TODAY.subtract(2, 'week').toISOString(),
    replies: [
      { id: 'in-7-r1', authorId: 's-3', body: 'Approved for 12 months. No action needed from coaching side.', sentAt: TODAY.subtract(9, 'day').toISOString() },
    ],
  },
  {
    id: 'in-8',
    memberId: 'm-7',
    title: 'Injection-site irritation — technique coaching needed',
    body: 'Angela reported recurring irritation at injection sites during her clinical review. Can you walk through site rotation and needle technique with her on video and send the injection guide?',
    authorId: 's-2',
    taggedIds: ['s-1'],
    category: 'Side Effects',
    status: 'resolved',
    createdAt: TODAY.subtract(4, 'week').toISOString(),
    replies: [
      { id: 'in-8-r1', authorId: 's-1', body: 'Technique session done — covered rotation and needle angle, guide sent. Will monitor for two weeks.', sentAt: TODAY.subtract(4, 'week').add(2, 'day').toISOString() },
      { id: 'in-8-r2', authorId: 's-1', body: 'Two weeks on — no recurrence reported. Resolving.', sentAt: TODAY.subtract(2, 'week').toISOString() },
    ],
  },
];
