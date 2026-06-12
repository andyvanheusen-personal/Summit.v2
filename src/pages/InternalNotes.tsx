import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import {
  Avatar, AvatarGroup, Box, Card, Chip, Collapse, Divider, IconButton, Stack,
  Tooltip, Typography,
} from '@mui/material';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ReplayRoundedIcon from '@mui/icons-material/ReplayRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import SpeakerNotesRoundedIcon from '@mui/icons-material/SpeakerNotesRounded';
import LockPersonRoundedIcon from '@mui/icons-material/LockPersonRounded';
import { CURRENT_STAFF_ID, memberById, staffById } from '../data/mockData';
import { useInternalNotes } from '../context/InternalNotesContext';
import { MemberAvatar } from '../components/shared';
import type { InternalNote, InternalNoteCategory } from '../types';

const CATEGORY_COLOR: Record<InternalNoteCategory, 'info' | 'secondary' | 'warning' | 'default'> = {
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

function staffInitials(name: string) {
  return name
    .replace('Dr. ', '')
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2);
}

function StaffAvatar({ staffId, size = 26 }: { staffId: string; size?: number }) {
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

function lastActivity(note: InternalNote) {
  return note.replies.length ? note.replies[note.replies.length - 1].sentAt : note.createdAt;
}

function NoteRow({ note, resolved }: { note: InternalNote; resolved?: boolean }) {
  const navigate = useNavigate();
  const { setStatus } = useInternalNotes();
  const [expanded, setExpanded] = useState(false);
  const member = memberById(note.memberId)!;
  const author = staffById(note.authorId)!;

  return (
    <Box
      sx={
        resolved
          ? { bgcolor: '#F2F5F5', '& .MuiAvatar-root': { filter: 'grayscale(1)', opacity: 0.8 } }
          : { borderLeft: '4px solid', borderColor: 'primary.main' }
      }
    >
      <Box
        onClick={() => navigate(`/members/${member.id}`)}
        sx={{
          display: 'flex',
          gap: 2,
          px: 2.5,
          py: 2,
          cursor: 'pointer',
          alignItems: 'flex-start',
          '&:hover': { bgcolor: resolved ? '#EAEFEF' : 'rgba(14,124,114,0.04)' },
        }}
      >
        <MemberAvatar member={member} size={40} />
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap', rowGap: 0.5 }}>
            <Typography variant="subtitle2" sx={resolved ? { color: 'text.secondary' } : undefined}>
              {note.title}
            </Typography>
            <Chip label={note.category} size="small" color={CATEGORY_COLOR[note.category]} variant="outlined" />
            {resolved && (
              <Chip
                icon={<CheckCircleRoundedIcon sx={{ fontSize: 14 }} />}
                label="Resolved"
                size="small"
                color="success"
                sx={{ height: 20, fontSize: 11 }}
              />
            )}
          </Stack>
          <Typography variant="caption" color="text.secondary">
            {member.firstName} {member.lastName} · {member.unionLocal}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 0.5,
              display: '-webkit-box',
              WebkitLineClamp: expanded ? 'unset' : 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {note.body}
          </Typography>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mt: 1 }}>
            <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
              <StaffAvatar staffId={note.authorId} size={22} />
              <Typography variant="caption" color="text.secondary">{author.name}</Typography>
            </Stack>
            {note.taggedIds.length > 0 && (
              <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                <Typography variant="caption" color="text.secondary">tagged</Typography>
                <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 22, height: 22, fontSize: 10 } }}>
                  {note.taggedIds.map((id) => <StaffAvatar key={id} staffId={id} size={22} />)}
                </AvatarGroup>
              </Stack>
            )}
            <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', color: 'text.secondary' }}>
              <ChatBubbleOutlineRoundedIcon sx={{ fontSize: 14 }} />
              <Typography variant="caption">{note.replies.length}</Typography>
            </Stack>
            <Typography variant="caption" color="text.disabled" sx={{ ml: 'auto !important' }}>
              {dayjs(lastActivity(note)).format('MMM D · h:mm A')}
            </Typography>
          </Stack>
        </Box>
        <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0, alignItems: 'center' }} onClick={(e) => e.stopPropagation()}>
          {note.replies.length > 0 && (
            <Tooltip title={expanded ? 'Hide replies' : 'Show replies'}>
              <IconButton size="small" onClick={() => setExpanded((v) => !v)}>
                <ExpandMoreRoundedIcon
                  fontSize="small"
                  sx={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 150ms' }}
                />
              </IconButton>
            </Tooltip>
          )}
          {resolved ? (
            <Tooltip title="Reopen note">
              <IconButton size="small" onClick={() => setStatus(note.id, 'active')}>
                <ReplayRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : (
            <Tooltip title="Mark resolved">
              <IconButton size="small" color="success" onClick={() => setStatus(note.id, 'resolved')}>
                <CheckCircleRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      </Box>
      <Collapse in={expanded}>
        <Stack spacing={1.25} sx={{ px: 2.5, pb: 2, pl: 9.5 }}>
          {note.replies.map((reply) => {
            const replyAuthor = staffById(reply.authorId)!;
            return (
              <Box key={reply.id} sx={{ display: 'flex', gap: 1.25, alignItems: 'flex-start' }}>
                <StaffAvatar staffId={reply.authorId} size={26} />
                <Box sx={{ bgcolor: '#F4F8F8', borderRadius: 2.5, p: 1.5, flexGrow: 1 }}>
                  <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>{replyAuthor.name}</Typography>
                    <Typography variant="caption" color="text.disabled">
                      {dayjs(reply.sentAt).format('MMM D · h:mm A')}
                    </Typography>
                  </Stack>
                  <Typography variant="body2" color="text.secondary">{reply.body}</Typography>
                </Box>
              </Box>
            );
          })}
        </Stack>
      </Collapse>
      <Divider />
    </Box>
  );
}

export default function InternalNotes() {
  const { notes } = useInternalNotes();

  // This screen is the coach's action queue: only notes they were tagged in.
  const { active, resolved } = useMemo(() => {
    const tagged = notes.filter((n) => n.taggedIds.includes(CURRENT_STAFF_ID));
    const sorted = tagged.sort((a, b) => lastActivity(b).localeCompare(lastActivity(a)));
    return {
      active: sorted.filter((n) => n.status === 'active'),
      resolved: sorted.filter((n) => n.status === 'resolved'),
    };
  }, [notes]);

  return (
    <Box>
      <Stack sx={{ mb: 3 }}>
        <Typography variant="h4">Internal notes</Typography>
        <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
          <LockPersonRoundedIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
          <Typography color="text.secondary">
            Notes you've been tagged in — staff-only, never visible to members.
          </Typography>
        </Stack>
      </Stack>

      <Card sx={{ mb: 2.5, overflow: 'hidden' }}>
        <Box
          sx={{
            px: 2.5, py: 1.5, display: 'flex', alignItems: 'center', gap: 1.5,
            background: 'linear-gradient(120deg, #0E7C72 0%, #0A5C55 100%)',
          }}
        >
          <SpeakerNotesRoundedIcon sx={{ color: '#fff' }} />
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" sx={{ color: '#fff', lineHeight: 1.2 }}>Active</Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.85)' }}>
              Open discussions waiting on your input
            </Typography>
          </Box>
          <Chip
            label={`${active.length} open`}
            sx={{ bgcolor: 'rgba(255,255,255,0.22)', color: '#fff', fontWeight: 700 }}
          />
        </Box>
        {active.length === 0 && (
          <Typography color="text.secondary" sx={{ p: 3 }}>
            Nothing waiting on you — no active notes where you're tagged.
          </Typography>
        )}
        {active.map((note) => <NoteRow key={note.id} note={note} />)}
      </Card>

      <Card sx={{ overflow: 'hidden' }}>
        <Box
          sx={{
            px: 2.5, py: 1.5, display: 'flex', alignItems: 'center', gap: 1.5,
            background: 'linear-gradient(120deg, #5B6B73 0%, #46545B 100%)',
          }}
        >
          <CheckCircleRoundedIcon sx={{ color: '#9FE8C5' }} />
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" sx={{ color: '#fff', lineHeight: 1.2 }}>Resolved</Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.85)' }}>
              Closed discussions, kept for reference
            </Typography>
          </Box>
          <Chip
            label={`${resolved.length} resolved`}
            sx={{ bgcolor: 'rgba(255,255,255,0.22)', color: '#fff', fontWeight: 700 }}
          />
        </Box>
        {resolved.length === 0 && (
          <Typography color="text.secondary" sx={{ p: 3 }}>No resolved notes.</Typography>
        )}
        {resolved.map((note) => <NoteRow key={note.id} note={note} resolved />)}
      </Card>
    </Box>
  );
}
