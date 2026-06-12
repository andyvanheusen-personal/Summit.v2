import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import {
  Box, Card, CardContent, Chip, Grid, Stack, Typography,
} from '@mui/material';
import VideocamRoundedIcon from '@mui/icons-material/VideocamRounded';
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded';
import { APPOINTMENTS, TODAY } from '../data/mockData';
import { useMembers } from '../context/MembersContext';
import { MemberAvatar } from '../components/shared';

const STATUS_META = {
  upcoming: { label: 'Upcoming', color: 'primary' as const },
  completed: { label: 'Completed', color: 'success' as const },
  'no-show': { label: 'No-show', color: 'error' as const },
};

export default function CalendarPage() {
  const navigate = useNavigate();
  const { memberById } = useMembers();

  const weekStart = TODAY.startOf('week').add(1, 'day'); // Monday
  const days = useMemo(() => Array.from({ length: 5 }, (_, i) => weekStart.add(i, 'day')), [weekStart]);

  const byDay = useMemo(() => {
    const map = new Map<string, typeof APPOINTMENTS>();
    for (const day of days) map.set(day.format('YYYY-MM-DD'), []);
    for (const appt of APPOINTMENTS) {
      const key = dayjs(appt.start).format('YYYY-MM-DD');
      map.get(key)?.push(appt);
    }
    for (const list of map.values()) list.sort((a, b) => a.start.localeCompare(b.start));
    return map;
  }, [days]);

  const completed = APPOINTMENTS.filter((a) => a.status === 'completed').length;
  const noShows = APPOINTMENTS.filter((a) => a.status === 'no-show').length;

  return (
    <Box>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 3, alignItems: { md: 'flex-end' } }}>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4">Calendar</Typography>
          <Typography color="text.secondary">
            Week of {weekStart.format('MMMM D')} · {APPOINTMENTS.filter((a) => a.status === 'upcoming' && dayjs(a.start).isBefore(weekStart.add(5, 'day'))).length} upcoming sessions this week
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Chip label={`${completed} completed this week`} color="success" variant="outlined" />
          <Chip label={`${noShows} no-show`} color="error" variant="outlined" />
        </Stack>
      </Stack>

      <Grid container spacing={2}>
        {days.map((day) => {
          const appts = byDay.get(day.format('YYYY-MM-DD')) ?? [];
          const isToday = day.isSame(TODAY, 'day');
          return (
            <Grid key={day.toString()} size={{ xs: 12, sm: 6, md: 2.4 }}>
              <Card
                sx={{
                  height: '100%',
                  minHeight: 320,
                  ...(isToday && { borderColor: 'primary.main', borderWidth: 2, boxShadow: '0 4px 16px rgba(14,124,114,0.15)' }),
                }}
              >
                <Box sx={{ p: 2, pb: 1.5, bgcolor: isToday ? 'rgba(14,124,114,0.06)' : 'transparent' }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: isToday ? 'primary.main' : 'text.secondary' }}>
                    {day.format('dddd')}
                  </Typography>
                  <Typography variant="h6">{day.format('MMM D')}</Typography>
                </Box>
                <CardContent sx={{ pt: 0.5 }}>
                  <Stack spacing={1.25}>
                    {appts.length === 0 && (
                      <Typography variant="body2" color="text.disabled" sx={{ pt: 2, textAlign: 'center' }}>
                        No sessions
                      </Typography>
                    )}
                    {appts.map((appt) => {
                      const member = memberById(appt.memberId)!;
                      const meta = STATUS_META[appt.status];
                      return (
                        <Box
                          key={appt.id}
                          onClick={() => navigate(`/members/${member.id}`)}
                          sx={{
                            p: 1.25,
                            borderRadius: 2.5,
                            border: '1px solid',
                            borderColor: 'divider',
                            cursor: 'pointer',
                            transition: 'box-shadow 120ms',
                            '&:hover': { boxShadow: '0 3px 10px rgba(19,37,43,0.12)' },
                            ...(appt.status === 'no-show' && { opacity: 0.7 }),
                          }}
                        >
                          <Stack direction="row" spacing={1} sx={{ mb: 0.75, alignItems: 'center' }}>
                            <MemberAvatar member={member} size={28} />
                            <Typography variant="subtitle2" noWrap>
                              {member.firstName} {member.lastName[0]}.
                            </Typography>
                          </Stack>
                          <Stack direction="row" spacing={0.5} sx={{ color: 'text.secondary', mb: 0.75, alignItems: 'center' }}>
                            {appt.type === 'Phone Call' ? <PhoneRoundedIcon sx={{ fontSize: 14 }} /> : <VideocamRoundedIcon sx={{ fontSize: 14 }} />}
                            <Typography variant="caption">
                              {dayjs(appt.start).format('h:mm')}–{dayjs(appt.end).format('h:mm A')}
                            </Typography>
                          </Stack>
                          <Chip label={meta.label} size="small" color={meta.color} variant="outlined" sx={{ height: 20, fontSize: 11 }} />
                        </Box>
                      );
                    })}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
