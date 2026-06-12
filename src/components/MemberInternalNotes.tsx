import { useEffect, useMemo, useRef, useState } from 'react';
import dayjs from 'dayjs';
import {
  Alert, Box, Button, Card, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Divider,
  IconButton, MenuItem, Stack, TextField, Tooltip, Typography,
} from '@mui/material';
import MarkChatReadRoundedIcon from '@mui/icons-material/MarkChatReadRounded';
import MarkChatUnreadRoundedIcon from '@mui/icons-material/MarkChatUnreadRounded';
import AddCommentRoundedIcon from '@mui/icons-material/AddCommentRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ReplayRoundedIcon from '@mui/icons-material/ReplayRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import LockPersonRoundedIcon from '@mui/icons-material/LockPersonRounded';
import { CURRENT_STAFF_ID, STAFF, staffById } from '../data/mockData';
import { useInternalNotes } from '../context/InternalNotesContext';
import { CATEGORY_COLOR, StaffAvatar, noteLastActivity } from './shared';
import type { InternalNote, InternalNoteCategory, Member } from '../types';

const CATEGORIES: InternalNoteCategory[] = ['Engagement', 'Eligibility / PBM', 'Side Effects', 'General'];

function NoteCard({ note, highlighted }: { note: InternalNote; highlighted: boolean }) {
  const { setStatus, addReply, unseenIds, markSeen, markUnseen } = useInternalNotes();
  const [reply, setReply] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const author = staffById(note.authorId)!;
  const resolved = note.status === 'resolved';
  const unseen = unseenIds.has(note.id);
  const tagged = note.taggedIds.includes(CURRENT_STAFF_ID);

  useEffect(() => {
    if (highlighted) {
      ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [highlighted]);

  const send = () => {
    if (!reply.trim()) return;
    addReply(note.id, reply.trim());
    setReply('');
  };

  return (
    <Card
      ref={ref}
      sx={{
        ...(resolved
          ? { bgcolor: '#F2F5F5', '& .MuiAvatar-root': { filter: 'grayscale(1)', opacity: 0.8 } }
          : { borderLeft: '4px solid', borderLeftColor: 'primary.main' }),
        ...(highlighted && {
          outline: '2px solid',
          outlineColor: 'secondary.main',
          boxShadow: '0 0 0 6px rgba(240,101,60,0.15)',
        }),
      }}
    >
      <Box sx={{ p: 2.5, pb: 2 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap', rowGap: 0.5, mb: 0.75 }}>
          <Typography variant="subtitle1" sx={resolved ? { color: 'text.secondary' } : undefined}>
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
          <Box sx={{ flexGrow: 1 }} />
          {tagged && (
            <Tooltip title={unseen ? 'Mark as read' : 'Mark as unread — keeps it in your notifications'}>
              <IconButton size="small" onClick={() => (unseen ? markSeen(note.id) : markUnseen(note.id))}>
                {unseen
                  ? <MarkChatReadRoundedIcon fontSize="small" />
                  : <MarkChatUnreadRoundedIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
          )}
          {resolved ? (
            <Button size="small" startIcon={<ReplayRoundedIcon />} onClick={() => setStatus(note.id, 'active')}>
              Reopen
            </Button>
          ) : (
            <Button
              size="small"
              color="success"
              startIcon={<CheckCircleRoundedIcon />}
              onClick={() => setStatus(note.id, 'resolved')}
            >
              Resolve
            </Button>
          )}
        </Stack>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 1.5 }}>
          <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
            <StaffAvatar staffId={note.authorId} size={24} />
            <Typography variant="caption" color="text.secondary">
              {author.name} · {dayjs(note.createdAt).format('MMM D, YYYY · h:mm A')}
            </Typography>
          </Stack>
          {note.taggedIds.length > 0 && (
            <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
              <Typography variant="caption" color="text.secondary">tagged</Typography>
              {note.taggedIds.map((id) => <StaffAvatar key={id} staffId={id} size={22} />)}
            </Stack>
          )}
        </Stack>
        <Typography variant="body2" color="text.secondary">{note.body}</Typography>
      </Box>

      {note.replies.length > 0 && (
        <>
          <Divider />
          <Stack spacing={1.25} sx={{ p: 2.5, py: 2 }}>
            {note.replies.map((r) => {
              const replyAuthor = staffById(r.authorId)!;
              return (
                <Box key={r.id} sx={{ display: 'flex', gap: 1.25, alignItems: 'flex-start' }}>
                  <StaffAvatar staffId={r.authorId} size={26} />
                  <Box sx={{ bgcolor: resolved ? '#E9EEEE' : '#F4F8F8', borderRadius: 2.5, p: 1.5, flexGrow: 1 }}>
                    <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                      <Typography variant="caption" sx={{ fontWeight: 700 }}>{replyAuthor.name}</Typography>
                      <Typography variant="caption" color="text.disabled">
                        {dayjs(r.sentAt).format('MMM D · h:mm A')}
                      </Typography>
                    </Stack>
                    <Typography variant="body2" color="text.secondary">{r.body}</Typography>
                  </Box>
                </Box>
              );
            })}
          </Stack>
        </>
      )}

      {!resolved && (
        <>
          <Divider />
          <Stack direction="row" spacing={1} sx={{ p: 2, alignItems: 'flex-start' }}>
            <StaffAvatar staffId={CURRENT_STAFF_ID} size={30} />
            <TextField
              fullWidth
              size="small"
              placeholder="Reply to this discussion…"
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
              multiline
              maxRows={4}
            />
            <Button variant="contained" endIcon={<SendRoundedIcon />} onClick={send} disabled={!reply.trim()}>
              Reply
            </Button>
          </Stack>
        </>
      )}
    </Card>
  );
}

function NewNoteDialog({ member, open, onClose }: { member: Member; open: boolean; onClose: () => void }) {
  const { createNote } = useInternalNotes();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [taggedIds, setTaggedIds] = useState<string[]>([]);
  const [category, setCategory] = useState<InternalNoteCategory>('General');

  const valid = title.trim() && body.trim() && taggedIds.length > 0;

  const submit = () => {
    createNote({ memberId: member.id, title: title.trim(), body: body.trim(), taggedIds, category });
    setTitle(''); setBody(''); setTaggedIds([]); setCategory('General');
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>New internal note — {member.firstName} {member.lastName}</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          <TextField label="Topic" value={title} onChange={(e) => setTitle(e.target.value)} fullWidth />
          <TextField
            label="Note"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            multiline
            minRows={3}
            fullWidth
          />
          <TextField
            select
            label="Tag staff (they'll be notified)"
            value={taggedIds}
            onChange={(e) => setTaggedIds(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
            fullWidth
            slotProps={{
              select: {
                multiple: true,
                renderValue: (selected) => (
                  <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', rowGap: 0.5 }}>
                    {(selected as string[]).map((id) => (
                      <Chip key={id} label={staffById(id)?.name} size="small" />
                    ))}
                  </Stack>
                ),
              },
            }}
          >
            {STAFF.filter((s) => s.id !== CURRENT_STAFF_ID).map((s) => (
              <MenuItem key={s.id} value={s.id}>
                {s.name} — {s.role}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value as InternalNoteCategory)}
            fullWidth
          >
            {CATEGORIES.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
          </TextField>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" disabled={!valid} onClick={submit}>
          Create note
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function MemberInternalNotes({ member, highlightNoteId }: { member: Member; highlightNoteId?: string | null }) {
  const { notes, markSeen } = useInternalNotes();
  const [dialogOpen, setDialogOpen] = useState(false);

  const memberNotes = useMemo(() => {
    const mine = notes.filter((n) => n.memberId === member.id);
    return mine.sort((a, b) => {
      if (a.status !== b.status) return a.status === 'active' ? -1 : 1;
      return noteLastActivity(b).localeCompare(noteLastActivity(a));
    });
  }, [notes, member.id]);

  // Opening this tab reads the notes shown — clears their notification state.
  // Keyed on the member only, so a manual "mark as unread" afterwards sticks.
  useEffect(() => {
    memberNotes.forEach((n) => markSeen(n.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [member.id]);

  return (
    <Box>
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center', mb: 2 }}>
        <Alert
          severity="info"
          icon={<LockPersonRoundedIcon fontSize="small" />}
          sx={{ flexGrow: 1, py: 0.25 }}
        >
          Staff-only discussion — never visible to {member.firstName}. Tagged staff are notified.
        </Alert>
        <Tooltip title="Start a staff discussion about this member">
          <Button
            variant="contained"
            startIcon={<AddCommentRoundedIcon />}
            onClick={() => setDialogOpen(true)}
            sx={{ flexShrink: 0 }}
          >
            New internal note
          </Button>
        </Tooltip>
      </Stack>

      {memberNotes.length === 0 ? (
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">
            No internal notes for {member.firstName} yet. Start one to loop in clinical, PBM or program staff.
          </Typography>
        </Card>
      ) : (
        <Stack spacing={2}>
          {memberNotes.map((note) => (
            <NoteCard key={note.id} note={note} highlighted={note.id === highlightNoteId} />
          ))}
        </Stack>
      )}

      <NewNoteDialog member={member} open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </Box>
  );
}
