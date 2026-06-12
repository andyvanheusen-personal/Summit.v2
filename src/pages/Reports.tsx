import { useMemo } from 'react';
import {
  Box, Card, CardContent, CardHeader, Divider, Grid, Stack, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Typography, Chip,
} from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';
import { PieChart } from '@mui/x-charts/PieChart';
import { useMembers } from '../context/MembersContext';
import { totalLoss } from '../data/memberStats';
import { StatBlock } from '../components/shared';

interface CohortRow {
  local: string;
  members: number;
  avgLossPct: number;
  avgAdherence: number;
  engagedPct: number;
  totalLbs: number;
}

export default function Reports() {
  const { members } = useMembers();
  const cohorts: CohortRow[] = useMemo(() => {
    const locals = [...new Set(members.map((m) => m.unionLocal))].sort();
    return locals.map((local) => {
      const ms = members.filter((m) => m.unionLocal === local);
      return {
        local,
        members: ms.length,
        avgLossPct: ms.reduce((s, m) => s + (totalLoss(m) / m.weightGoal.startWeightLbs) * 100, 0) / ms.length,
        avgAdherence: Math.round(ms.reduce((s, m) => s + m.adherencePct, 0) / ms.length),
        engagedPct: Math.round((ms.filter((m) => m.engagement === 'engaged').length / ms.length) * 100),
        totalLbs: Math.round(ms.reduce((s, m) => s + totalLoss(m), 0)),
      };
    });
  }, [members]);

  const totalLbsLost = Math.round(members.reduce((s, m) => s + totalLoss(m), 0));
  const avgLossPct = (members.reduce((s, m) => s + (totalLoss(m) / m.weightGoal.startWeightLbs) * 100, 0) / members.length).toFixed(1);
  const persistence12 = Math.round((members.filter((m) => m.persistenceWeeks >= 12).length / members.length) * 100);
  const fivePctClub = members.filter((m) => totalLoss(m) / m.weightGoal.startWeightLbs >= 0.05).length;

  const phaseCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const m of members) counts.set(m.phase, (counts.get(m.phase) ?? 0) + 1);
    return [...counts.entries()].map(([label, value], id) => ({ id, label, value }));
  }, [members]);

  return (
    <Box>
      <Stack sx={{ mb: 3 }}>
        <Typography variant="h4">Reports</Typography>
        <Typography color="text.secondary">Caseload outcomes and union benefit-fund reporting</Typography>
      </Stack>

      <Card sx={{ mb: 2.5 }}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid size={{ xs: 6, md: 3 }}>
              <StatBlock label="Total lbs lost" value={`${totalLbsLost} lbs`} sub="across caseload" color="#0E7C72" />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <StatBlock label="Avg. body weight lost" value={`${avgLossPct}%`} sub="from baseline" />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <StatBlock label="12-week persistence" value={`${persistence12}%`} sub="still on therapy at week 12" />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <StatBlock label="≥5% loss milestone" value={`${fivePctClub} of ${members.length}`} sub="clinically meaningful threshold" />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Card sx={{ height: '100%' }}>
            <CardHeader title="Average weight loss by union local" subheader="% of starting body weight" />
            <CardContent sx={{ pt: 0 }}>
              <BarChart
                height={280}
                xAxis={[{ data: cohorts.map((c) => c.local.replace(' Local', '')), scaleType: 'band' }]}
                yAxis={[{ valueFormatter: (v: number) => `${v}%` }]}
                series={[{
                  data: cohorts.map((c) => Math.round(c.avgLossPct * 10) / 10),
                  color: '#0E7C72',
                  valueFormatter: (v: number | null) => `${v}% avg loss`,
                }]}
                borderRadius={8}
                margin={{ left: 0 }}
                hideLegend
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <Card sx={{ height: '100%' }}>
            <CardHeader title="Caseload by program phase" subheader="Current distribution" />
            <CardContent sx={{ pt: 0 }}>
              <PieChart
                height={280}
                series={[{
                  data: phaseCounts,
                  innerRadius: 60,
                  paddingAngle: 2,
                  cornerRadius: 4,
                }]}
                colors={['#0E7C72', '#3D7DD8', '#8E5BC0', '#E8A13D', '#F0653C', '#5B8C3E']}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card>
        <CardHeader
          title="Union benefit-fund summary"
          subheader="Shared with each fund office monthly — aggregate, de-identified outcomes"
          action={<Chip label="De-identified" size="small" variant="outlined" sx={{ mt: 1 }} />}
        />
        <Divider />
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Union local</TableCell>
                <TableCell align="right">Enrolled members</TableCell>
                <TableCell align="right">Avg. weight loss</TableCell>
                <TableCell align="right">Total lbs lost</TableCell>
                <TableCell align="right">Med. adherence</TableCell>
                <TableCell align="right">Engaged</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {cohorts.map((c) => (
                <TableRow key={c.local} sx={{ '&:last-child td': { border: 0 } }}>
                  <TableCell><Typography variant="subtitle2">{c.local}</Typography></TableCell>
                  <TableCell align="right">{c.members}</TableCell>
                  <TableCell align="right">{c.avgLossPct.toFixed(1)}%</TableCell>
                  <TableCell align="right">{c.totalLbs} lbs</TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" color={c.avgAdherence >= 85 ? 'success.main' : 'warning.main'} sx={{ fontWeight: 600 }}>
                      {c.avgAdherence}%
                    </Typography>
                  </TableCell>
                  <TableCell align="right">{c.engagedPct}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
}
