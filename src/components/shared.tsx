import { Avatar, Box, Chip, Tooltip, Typography } from '@mui/material';
import type { ChipProps } from '@mui/material';
import { staffById } from '../data/mockData';
import type { AlertSeverity, EngagementStatus, InternalNote, InternalNoteCategory, Member, SideEffectSeverity } from '../types';

const AVATAR_COLORS = ['#0E7C72', '#3D7DD8', '#8E5BC0', '#D96A9B', '#E8A13D', '#5B8C3E'];

export function initials(m: Member) {
  return `${m.firstName[0]}${m.lastName[0]}`;
}

export function avatarColor(m: Member) {
  const n = m.id.split('-')[1];
  return AVATAR_COLORS[Number(n) % AVATAR_COLORS.length];
}

export function MemberAvatar({ member, size = 40 }: { member: Member; size?: number }) {
  return (
    <Avatar sx={{ bgcolor: avatarColor(member), width: size, height: size, fontSize: size * 0.4, fontWeight: 700 }}>
      {initials(member)}
    </Avatar>
  );
}

const ENGAGEMENT_META: Record<EngagementStatus, { label: string; color: ChipProps['color'] }> = {
  engaged: { label: 'Engaged', color: 'success' },
  'at-risk': { label: 'At Risk', color: 'warning' },
  lapsed: { label: 'Lapsed', color: 'error' },
};

export function EngagementChip({ status, size = 'small' }: { status: EngagementStatus; size?: ChipProps['size'] }) {
  const meta = ENGAGEMENT_META[status];
  return <Chip label={meta.label} color={meta.color} size={size} variant="outlined" />;
}

const SEVERITY_COLOR: Record<AlertSeverity | SideEffectSeverity, ChipProps['color']> = {
  high: 'error',
  medium: 'warning',
  low: 'info',
  severe: 'error',
  moderate: 'warning',
  mild: 'default',
};

export function SeverityChip({ severity }: { severity: AlertSeverity | SideEffectSeverity }) {
  return (
    <Chip
      label={severity.charAt(0).toUpperCase() + severity.slice(1)}
      color={SEVERITY_COLOR[severity]}
      size="small"
    />
  );
}

export const CATEGORY_COLOR: Record<InternalNoteCategory, 'info' | 'secondary' | 'warning' | 'default'> = {
  Engagement: 'info',
  'Eligibility / PBM': 'secondary',
  'Side Effects': 'warning',
  General: 'default',
};

const STAFF_COLORS: Record<string, string> = {
  's-1': '#0E7C72',
  's-2': '#8E5BC0',
  's-3': '#3D7DD8',
  's-4': '#5B8C3E',
  's-5': '#D96A9B',
};

export function staffInitials(name: string) {
  return name
    .replace('Dr. ', '')
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2);
}

export function StaffAvatar({ staffId, size = 26 }: { staffId: string; size?: number }) {
  const staff = staffById(staffId);
  if (!staff) return null;
  return (
    <Tooltip title={`${staff.name} — ${staff.role}`}>
      <Avatar sx={{ width: size, height: size, fontSize: size * 0.42, fontWeight: 700, bgcolor: STAFF_COLORS[staffId] ?? '#5B6B73' }}>
        {staffInitials(staff.name)}
      </Avatar>
    </Tooltip>
  );
}

export function noteLastActivity(note: InternalNote) {
  return note.replies.length ? note.replies[note.replies.length - 1].sentAt : note.createdAt;
}

export function StatBlock({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <Box>
      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </Typography>
      <Typography variant="h5" sx={{ color: color ?? 'text.primary', lineHeight: 1.2 }}>
        {value}
      </Typography>
      {sub && (
        <Typography variant="caption" color="text.secondary">
          {sub}
        </Typography>
      )}
    </Box>
  );
}
