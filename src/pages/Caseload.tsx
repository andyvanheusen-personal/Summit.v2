import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import {
  Box, Card, Chip, InputAdornment, LinearProgress, MenuItem, Stack, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TextField, ToggleButton, ToggleButtonGroup, Typography,
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { MEMBERS, currentWeight, goalProgressPct, totalLoss } from '../data/mockData';
import { EngagementChip, MemberAvatar } from '../components/shared';
import type { EngagementStatus } from '../types';

export default function Caseload() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [local, setLocal] = useState('all');
  const [engagement, setEngagement] = useState<'all' | EngagementStatus>('all');

  const locals = useMemo(() => [...new Set(MEMBERS.map((m) => m.unionLocal))].sort(), []);

  const rows = useMemo(() => {
    return MEMBERS.filter((m) => {
      const name = `${m.firstName} ${m.lastName}`.toLowerCase();
      if (query && !name.includes(query.toLowerCase())) return false;
      if (local !== 'all' && m.unionLocal !== local) return false;
      if (engagement !== 'all' && m.engagement !== engagement) return false;
      return true;
    }).sort((a, b) => {
      const order = { lapsed: 0, 'at-risk': 1, engaged: 2 };
      return order[a.engagement] - order[b.engagement] || a.lastName.localeCompare(b.lastName);
    });
  }, [query, local, engagement]);

  const counts = useMemo(() => ({
    engaged: MEMBERS.filter((m) => m.engagement === 'engaged').length,
    atRisk: MEMBERS.filter((m) => m.engagement === 'at-risk').length,
    lapsed: MEMBERS.filter((m) => m.engagement === 'lapsed').length,
  }), []);

  return (
    <Box>
      <Stack sx={{ mb: 3, alignItems: { md: 'flex-end' } }} direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4">Caseload</Typography>
          <Typography color="text.secondary">
            {MEMBERS.length} members · {counts.engaged} engaged · {counts.atRisk} at risk · {counts.lapsed} lapsed
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            size="small"
            placeholder="Search members…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start"><SearchRoundedIcon fontSize="small" /></InputAdornment>
                ),
              },
            }}
            sx={{ width: 220, bgcolor: 'background.paper' }}
          />
          <TextField
            size="small"
            select
            value={local}
            onChange={(e) => setLocal(e.target.value)}
            sx={{ width: 200, bgcolor: 'background.paper' }}
          >
            <MenuItem value="all">All union locals</MenuItem>
            {locals.map((l) => <MenuItem key={l} value={l}>{l}</MenuItem>)}
          </TextField>
          <ToggleButtonGroup
            size="small"
            exclusive
            value={engagement}
            onChange={(_, v) => v && setEngagement(v)}
            sx={{ bgcolor: 'background.paper' }}
          >
            <ToggleButton value="all">All</ToggleButton>
            <ToggleButton value="engaged">Engaged</ToggleButton>
            <ToggleButton value="at-risk">At risk</ToggleButton>
            <ToggleButton value="lapsed">Lapsed</ToggleButton>
          </ToggleButtonGroup>
        </Stack>
      </Stack>

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Member</TableCell>
                <TableCell>Union local</TableCell>
                <TableCell>Phase</TableCell>
                <TableCell>Medication</TableCell>
                <TableCell align="right">Weight loss</TableCell>
                <TableCell sx={{ minWidth: 160 }}>Goal progress</TableCell>
                <TableCell align="right">Adherence</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Last contact</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((m) => {
                const pct = goalProgressPct(m);
                return (
                  <TableRow
                    key={m.id}
                    hover
                    onClick={() => navigate(`/members/${m.id}`)}
                    sx={{ cursor: 'pointer', '&:last-child td': { border: 0 } }}
                  >
                    <TableCell>
                      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                        <MemberAvatar member={m} size={38} />
                        <Box>
                          <Typography variant="subtitle2">{m.firstName} {m.lastName}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {m.age} · {m.occupation}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{m.unionLocal}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={m.phase} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{m.medication}</Typography>
                      <Typography variant="caption" color="text.secondary">{m.currentDoseMg} mg/wk</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="subtitle2" color="primary.dark">−{totalLoss(m)} lbs</Typography>
                      <Typography variant="caption" color="text.secondary">
                        now {currentWeight(m)} lbs
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Stack spacing={0.5}>
                        <LinearProgress
                          variant="determinate"
                          value={pct}
                          color={pct >= 75 ? 'success' : pct >= 40 ? 'primary' : 'warning'}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {pct}% of {m.weightGoal.targetLossLbs} lb goal
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell align="right">
                      <Typography
                        variant="subtitle2"
                        color={m.adherencePct >= 90 ? 'success.main' : m.adherencePct >= 70 ? 'warning.main' : 'error.main'}
                      >
                        {m.adherencePct}%
                      </Typography>
                    </TableCell>
                    <TableCell><EngagementChip status={m.engagement} /></TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {dayjs(m.lastContact).format('MMM D')}
                      </Typography>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
}
