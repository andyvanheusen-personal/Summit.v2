import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import {
  Box, Button, Card, CardContent, CardHeader, Checkbox, Chip, Divider, Grid, IconButton, List,
  ListItem, ListItemButton, ListItemIcon, ListItemText, Stack, Tooltip, Typography,
} from '@mui/material';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import VideocamRoundedIcon from '@mui/icons-material/VideocamRounded';
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded';
import NotificationsActiveRoundedIcon from '@mui/icons-material/NotificationsActiveRounded';
import TrendingDownRoundedIcon from '@mui/icons-material/TrendingDownRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import MedicationRoundedIcon from '@mui/icons-material/MedicationRounded';
import MarkChatUnreadRoundedIcon from '@mui/icons-material/MarkChatUnreadRounded';
import { ALERTS, APPOINTMENTS, COACH, MEMBERS, TASKS, TODAY, memberById, totalLoss } from '../data/mockData';
import { useMessages } from '../context/MessagesContext';
import { useInternalNotes } from '../context/InternalNotesContext';
import { MemberAvatar, SeverityChip } from '../components/shared';
import type { CoachAlert } from '../types';

const SEVERITY_ORDER = { high: 0, medium: 1, low: 2 };

function KpiCard({ icon, label, value, sub, accent }: {
  icon: React.ReactNode; label: string; value: string; sub: string; accent: string;
}) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
        <Box sx={{ width: 44, height: 44, borderRadius: 3, display: 'grid', placeItems: 'center', bgcolor: `${accent}1A`, color: accent, flexShrink: 0 }}>
          {icon}
        </Box>
        <Box>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {label}
          </Typography>
          <Typography variant="h5">{value}</Typography>
          <Typography variant="caption" color="text.secondary">{sub}</Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState<CoachAlert[]>(ALERTS);
  const [doneTasks, setDoneTasks] = useState<Set<string>>(new Set());

  const openAlerts = useMemo(
    () => alerts.filter((a) => !a.resolved).sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]),
    [alerts],
  );
  const { unreadCount: unread } = useMessages();
  const { taggedActiveCount } = useInternalNotes();
  const todaysAppts = APPOINTMENTS.filter((a) => dayjs(a.start).isSame(TODAY, 'day'));
  const avgLossPct = (
    MEMBERS.reduce((sum, m) => sum + (totalLoss(m) / m.weightGoal.startWeightLbs) * 100, 0) / MEMBERS.length
  ).toFixed(1);
  const avgAdherence = Math.round(MEMBERS.reduce((s, m) => s + m.adherencePct, 0) / MEMBERS.length);

  const resolveAlert = (id: string) =>
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, resolved: true } : a)));

  return (
    <Box>
      <Stack sx={{ mb: 3 }}>
        <Typography variant="h4">Good morning, {COACH.name.split(' ')[0]}</Typography>
        <Typography color="text.secondary">
          You have {todaysAppts.length} sessions, {openAlerts.length} open alerts, {unread} unread messages and {taggedActiveCount} internal notes waiting on you today.
        </Typography>
      </Stack>

      <Grid container spacing={2.5} sx={{ mb: 1 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KpiCard icon={<GroupsRoundedIcon />} label="Active caseload" value={`${MEMBERS.length}`} sub="across 4 union locals" accent="#0E7C72" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KpiCard icon={<TrendingDownRoundedIcon />} label="Avg. weight loss" value={`${avgLossPct}%`} sub="of starting body weight" accent="#3D7DD8" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KpiCard icon={<MedicationRoundedIcon />} label="Medication adherence" value={`${avgAdherence}%`} sub="last 4 weeks, caseload avg." accent="#8E5BC0" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KpiCard icon={<MarkChatUnreadRoundedIcon />} label="Needs reply" value={`${unread}`} sub="unread member messages" accent="#F0653C" />
        </Grid>
      </Grid>

      <Grid container spacing={2.5}>
        {/* Alert triage */}
        <Grid size={{ xs: 12, lg: 5 }}>
          <Card sx={{ height: '100%' }}>
            <CardHeader
              avatar={<NotificationsActiveRoundedIcon color="error" />}
              title="Alert triage"
              subheader="Highest severity first"
              action={<Chip label={`${openAlerts.length} open`} size="small" color={openAlerts.length ? 'error' : 'success'} variant="outlined" sx={{ mt: 1 }} />}
            />
            <Divider />
            <List disablePadding>
              {openAlerts.length === 0 && (
                <ListItem><ListItemText primary="All clear — no open alerts." /></ListItem>
              )}
              {openAlerts.map((alert) => {
                const member = memberById(alert.memberId);
                return (
                  <ListItem
                    key={alert.id}
                    divider
                    alignItems="flex-start"
                    secondaryAction={
                      <Stack direction="row" spacing={0.5}>
                        {alert.severity === 'high' && (
                          <Tooltip title="Escalate to clinician">
                            <IconButton size="small" color="error" onClick={() => resolveAlert(alert.id)}>
                              <ArrowUpwardRoundedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Mark resolved">
                          <IconButton size="small" color="success" onClick={() => resolveAlert(alert.id)}>
                            <CheckCircleRoundedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    }
                  >
                    <ListItemButton
                      onClick={() => member && navigate(`/members/${member.id}`)}
                      sx={{ borderRadius: 2, mr: 7, px: 1 }}
                    >
                      <Stack spacing={0.75} sx={{ width: '100%' }}>
                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                          <SeverityChip severity={alert.severity} />
                          <Chip label={alert.category} size="small" variant="outlined" />
                          <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto !important' }}>
                            {dayjs(alert.createdAt).isSame(TODAY, 'day')
                              ? dayjs(alert.createdAt).format('h:mm A')
                              : dayjs(alert.createdAt).format('MMM D')}
                          </Typography>
                        </Stack>
                        <Typography variant="body2">{alert.message}</Typography>
                      </Stack>
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          </Card>
        </Grid>

        {/* Task queue */}
        <Grid size={{ xs: 12, md: 7, lg: 4 }}>
          <Card sx={{ height: '100%' }}>
            <CardHeader
              title="Today's queue"
              subheader={`${TASKS.length - doneTasks.size} tasks remaining`}
            />
            <Divider />
            <List disablePadding>
              {TASKS.map((task) => {
                const member = task.memberId ? memberById(task.memberId) : undefined;
                const done = doneTasks.has(task.id);
                return (
                  <ListItem key={task.id} divider disablePadding>
                    <ListItemButton
                      onClick={() =>
                        setDoneTasks((prev) => {
                          const next = new Set(prev);
                          if (next.has(task.id)) next.delete(task.id); else next.add(task.id);
                          return next;
                        })
                      }
                      dense
                      sx={{ gap: 1 }}
                    >
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <Checkbox edge="start" checked={done} disableRipple size="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary={task.title}
                        secondary={`${dayjs(task.due).format('h:mm A')}${member ? ` · ${member.unionLocal}` : ''}`}
                        slotProps={{
                          primary: {
                            sx: {
                              fontSize: 14,
                              ...(done && { textDecoration: 'line-through', color: 'text.disabled' }),
                            },
                          },
                        }}
                      />
                      <Chip label={task.kind} size="small" variant="outlined" sx={{ flexShrink: 0 }} />
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          </Card>
        </Grid>

        {/* Today's sessions */}
        <Grid size={{ xs: 12, md: 5, lg: 3 }}>
          <Card sx={{ height: '100%' }}>
            <CardHeader title="Today's sessions" subheader={TODAY.format('dddd, MMM D')} />
            <Divider />
            <List disablePadding>
              {todaysAppts.map((appt) => {
                const member = memberById(appt.memberId)!;
                return (
                  <ListItem key={appt.id} divider disablePadding>
                    <ListItemButton onClick={() => navigate(`/members/${member.id}`)}>
                      <ListItemIcon sx={{ minWidth: 48 }}>
                        <MemberAvatar member={member} size={36} />
                      </ListItemIcon>
                      <ListItemText
                        primary={`${member.firstName} ${member.lastName}`}
                        secondary={
                          <Stack component="span" direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                            {appt.type === 'Phone Call'
                              ? <PhoneRoundedIcon sx={{ fontSize: 14 }} />
                              : <VideocamRoundedIcon sx={{ fontSize: 14 }} />}
                            <span>{dayjs(appt.start).format('h:mm A')} · {appt.type}</span>
                          </Stack>
                        }
                        slotProps={{ secondary: { component: 'div' } }}
                      />
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
            <Box sx={{ p: 2 }}>
              <Button fullWidth variant="outlined" onClick={() => navigate('/calendar')}>
                Open calendar
              </Button>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
