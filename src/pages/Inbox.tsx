import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import {
  Badge, Box, Button, Card, Chip, Divider, IconButton, List, ListItemAvatar, ListItemButton,
  ListItemText, Paper, Stack, TextField, Tooltip, Typography,
} from '@mui/material';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import PersonSearchRoundedIcon from '@mui/icons-material/PersonSearchRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import ForumRoundedIcon from '@mui/icons-material/ForumRounded';
import { TODAY } from '../data/mockData';
import { useMembers } from '../context/MembersContext';
import { useMessages } from '../context/MessagesContext';
import { MemberAvatar } from '../components/shared';
import type { Message } from '../types';

const QUICK_REPLIES = [
  'Great progress this week — keep it up! 👏',
  'Thanks for flagging that. Let’s talk it through at your next session.',
  'That’s common on a dose change. Small, protein-first meals will help — call me if it gets worse.',
  'I’ve sent the resource pack to your member app.',
];

export default function Inbox() {
  const navigate = useNavigate();
  const { memberById } = useMembers();
  const { messages, markThreadRead, sendMessage } = useMessages();
  // No thread is selected (or marked read) until the coach clicks one.
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');

  const threads = useMemo(() => {
    const byMember = new Map<string, Message[]>();
    for (const msg of messages) {
      const list = byMember.get(msg.memberId) ?? [];
      list.push(msg);
      byMember.set(msg.memberId, list);
    }
    return [...byMember.entries()]
      .map(([memberId, msgs]) => ({
        memberId,
        msgs: msgs.sort((a, b) => a.sentAt.localeCompare(b.sentAt)),
        unread: msgs.filter((m) => m.from === 'member' && !m.read).length,
      }))
      .sort((a, b) => b.msgs[b.msgs.length - 1].sentAt.localeCompare(a.msgs[a.msgs.length - 1].sentAt));
  }, [messages]);

  const selectedThread = threads.find((t) => t.memberId === selectedId);
  const selectedMember = selectedId ? memberById(selectedId) : undefined;

  const openThread = (memberId: string) => {
    setSelectedId(memberId);
    markThreadRead(memberId);
  };

  const send = (body: string) => {
    if (!body.trim() || !selectedId) return;
    sendMessage(selectedId, body.trim());
    setDraft('');
  };

  return (
    <Box>
      <Stack sx={{ mb: 3 }}>
        <Typography variant="h4">Inbox</Typography>
        <Typography color="text.secondary">Secure member messaging — HIPAA-compliant channel</Typography>
      </Stack>

      <Card sx={{ display: 'flex', height: 'calc(100vh - 220px)', minHeight: 480 }}>
        {/* Thread list */}
        <Box sx={{ width: 320, borderRight: '1px solid', borderColor: 'divider', overflowY: 'auto', flexShrink: 0 }}>
          <List disablePadding>
            {threads.map((t) => {
              const member = memberById(t.memberId)!;
              const last = t.msgs[t.msgs.length - 1];
              return (
                <ListItemButton
                  key={t.memberId}
                  selected={t.memberId === selectedId}
                  onClick={() => openThread(t.memberId)}
                  divider
                  alignItems="flex-start"
                >
                  <ListItemAvatar>
                    <Badge badgeContent={t.unread} color="secondary">
                      <MemberAvatar member={member} size={42} />
                    </Badge>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: t.unread ? 800 : 600 }}>
                          {member.firstName} {member.lastName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {dayjs(last.sentAt).isSame(TODAY, 'day') ? dayjs(last.sentAt).format('h:mm A') : dayjs(last.sentAt).format('MMM D')}
                        </Typography>
                      </Stack>
                    }
                    secondary={(last.from === 'coach' ? 'You: ' : '') + last.body}
                    slotProps={{
                      secondary: {
                        noWrap: true,
                        sx: t.unread ? { fontWeight: 600, color: 'text.primary' } : undefined,
                      },
                    }}
                  />
                </ListItemButton>
              );
            })}
          </List>
        </Box>

        {/* Conversation */}
        {!selectedThread && (
          <Stack sx={{ flexGrow: 1, alignItems: 'center', justifyContent: 'center', bgcolor: '#F8FAFA' }} spacing={1}>
            <ForumRoundedIcon sx={{ fontSize: 44, color: 'text.disabled' }} />
            <Typography variant="subtitle1" color="text.secondary">Select a conversation</Typography>
            <Typography variant="body2" color="text.disabled">
              Unread threads stay marked until you open them.
            </Typography>
          </Stack>
        )}
        {selectedThread && selectedMember && (
          <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <Stack direction="row" spacing={1.5} sx={{ p: 2, alignItems: 'center' }}>
              <MemberAvatar member={selectedMember} size={38} />
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="subtitle1">{selectedMember.firstName} {selectedMember.lastName}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {selectedMember.medication} {selectedMember.currentDoseMg} mg · Week {selectedMember.persistenceWeeks} · {selectedMember.unionLocal}
                </Typography>
              </Box>
              <Tooltip title="Open member profile">
                <IconButton onClick={() => navigate(`/members/${selectedMember.id}`)}>
                  <PersonSearchRoundedIcon />
                </IconButton>
              </Tooltip>
            </Stack>
            <Divider />
            <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2.5, bgcolor: '#F8FAFA' }}>
              <Stack spacing={1.5}>
                {selectedThread.msgs.map((msg) => (
                  <Stack key={msg.id} sx={{ alignItems: msg.from === 'coach' ? 'flex-end' : 'flex-start' }}>
                    <Paper
                      sx={{
                        p: 1.5,
                        px: 2,
                        maxWidth: '72%',
                        bgcolor: msg.from === 'coach' ? 'primary.main' : 'background.paper',
                        color: msg.from === 'coach' ? '#fff' : 'text.primary',
                        borderRadius: msg.from === 'coach' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                        border: msg.from === 'coach' ? 'none' : undefined,
                      }}
                    >
                      <Typography variant="body2">{msg.body}</Typography>
                    </Paper>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                      {dayjs(msg.sentAt).format('MMM D · h:mm A')}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Box>
            <Divider />
            <Box sx={{ p: 2 }}>
              <Stack direction="row" spacing={1} sx={{ mb: 1.5, flexWrap: 'wrap' }}>
                {QUICK_REPLIES.map((q) => (
                  <Chip
                    key={q}
                    icon={<BoltRoundedIcon />}
                    label={q.length > 44 ? q.slice(0, 44) + '…' : q}
                    size="small"
                    variant="outlined"
                    onClick={() => send(q)}
                  />
                ))}
              </Stack>
              <Stack direction="row" spacing={1}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder={`Message ${selectedMember.firstName}…`}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(draft); } }}
                  multiline
                  maxRows={4}
                />
                <Button variant="contained" endIcon={<SendRoundedIcon />} onClick={() => send(draft)} disabled={!draft.trim()}>
                  Send
                </Button>
              </Stack>
            </Box>
          </Box>
        )}
      </Card>
    </Box>
  );
}
