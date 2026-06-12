import type { Member } from '../types';

export function currentWeight(m: Member): number {
  return m.readings.length ? m.readings[m.readings.length - 1].weightLbs : m.weightGoal.startWeightLbs;
}

export function totalLoss(m: Member): number {
  return Math.round((m.weightGoal.startWeightLbs - currentWeight(m)) * 10) / 10;
}

export function goalProgressPct(m: Member): number {
  return Math.max(0, Math.min(100, Math.round((totalLoss(m) / m.weightGoal.targetLossLbs) * 100)));
}
