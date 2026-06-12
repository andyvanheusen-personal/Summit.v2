import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import dayjs, { Dayjs } from 'dayjs';
import {
  Alert, Box, Button, Card, CardContent, CardHeader, Chip, Dialog, DialogActions, DialogContent,
  DialogTitle, Divider, Grid, IconButton, LinearProgress, List, ListItem, ListItemText, Paper,
  Stack, Step, StepLabel, Stepper, Tab, Table, TableBody, TableCell, TableHead, TableRow, Tabs,
  TextField, Tooltip, Typography,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { LineChart } from '@mui/x-charts/LineChart';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import FlagRoundedIcon from '@mui/icons-material/FlagRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import LocalHospitalRoundedIcon from '@mui/icons-material/LocalHospitalRounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import RestaurantRoundedIcon from '@mui/icons-material/RestaurantRounded';
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded';
import LockPersonRoundedIcon from '@mui/icons-material/LockPersonRounded';
import { TITRATION, currentWeight, memberById, totalLoss, TODAY } from '../data/mockData';
import { EngagementChip, MemberAvatar, SeverityChip, StatBlock } from '../components/shared';
import MemberInternalNotes from '../components/MemberInternalNotes';
import type { Member, SessionNote, WeightGoal } from '../types';

function GoalProgressCard({ member, goal, onEdit }: { member: Member; goal: WeightGoal; onEdit: () => void }) {
  const lost = totalLoss(member);
  const pct = Math.max(0, Math.min(100, Math.round((lost / goal.targetLossLbs) * 100)));
  const current = currentWeight(member);
  const targetWeight = goal.startWeightLbs - goal.targetLossLbs;
  const totalWeeks = Math.max(1, dayjs(goal.targetDate).diff(goal.startDate, 'week'));
  const weeksElapsed = Math.min(totalWeeks, TODAY.diff(goal.startDate, 'week'));
  const expectedLoss = (goal.targetLossLbs / totalWeeks) * weeksElapsed;
  const onPace = lost >= expectedLoss * 0.85;
  const weeksLeft = dayjs(goal.targetDate).diff(TODAY, 'week');

  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader
        avatar={<FlagRoundedIcon color="primary" />}
        title="Weight loss goal"
        subheader={`Lose ${goal.targetLossLbs} lbs by ${dayjs(goal.targetDate).format('MMM D, YYYY')}`}
        action={
          <Tooltip title="Edit goal">
            <IconButton onClick={onEdit}><EditRoundedIcon fontSize="small" /></IconButton>
          </Tooltip>
        }
      />
      <CardContent sx={{ pt: 0 }}>
        <Stack direction="row" spacing={1} sx={{ mb: 1, alignItems: 'baseline' }}>
          <Typography variant="h4" color="primary.dark">−{lost} lbs</Typography>
          <Typography color="text.secondary">of {goal.targetLossLbs} lb goal</Typography>
        </Stack>
        <LinearProgress
          variant="determinate"
          value={pct}
          sx={{ height: 12, mb: 1 }}
          color={pct >= 100 ? 'success' : onPace ? 'primary' : 'warning'}
        />
        <Stack direction="row" sx={{ mb: 2, justifyContent: 'space-between' }}>
          <Typography variant="caption" color="text.secondary">
            Started {goal.startWeightLbs} lbs · {dayjs(goal.startDate).format('MMM D, YYYY')}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Target {targetWeight} lbs
          </Typography>
        </Stack>
        <Stack direction="row" spacing={3} sx={{ flexWrap: 'wrap' }}>
          <StatBlock label="Progress" value={`${pct}%`} />
          <StatBlock label="Current" value={`${current} lbs`} />
          <StatBlock
            label="Pace"
            value={onPace ? 'On track' : 'Behind pace'}
            color={onPace ? '#1E9E6A' : '#E8A13D'}
            sub={weeksLeft > 0 ? `${weeksLeft} weeks remaining` : 'Target date passed'}
          />
        </Stack>
      </CardContent>
    </Card>
  );
}

function WeightChart({ member, goal }: { member: Member; goal: WeightGoal }) {
  const data = useMemo(() => {
    const dates = member.readings.map((r) => new Date(r.date));
    const weights = member.readings.map((r) => r.weightLbs);
    return { dates, weights };
  }, [member]);
  const targetWeight = goal.startWeightLbs - goal.targetLossLbs;

  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader
        title="Weight trend"
        subheader={`${member.readings.length} readings · connected scale & self-reported`}
      />
      <CardContent sx={{ pt: 0 }}>
        <LineChart
          height={300}
          xAxis={[{ data: data.dates, scaleType: 'time', valueFormatter: (d: Date) => dayjs(d).format('MMM D') }]}
          yAxis={[{
            min: Math.min(targetWeight, ...data.weights) - 8,
            max: Math.max(...data.weights) + 8,
            valueFormatter: (v: number) => `${v} lb`,
          }]}
          series={[
            {
              data: data.weights,
              label: 'Weight (lbs)',
              color: '#0E7C72',
              showMark: false,
              curve: 'monotoneX',
              area: true,
              valueFormatter: (v: number | null) => (v == null ? '' : `${v} lbs`),
            },
            {
              data: data.dates.map(() => targetWeight),
              label: `Goal (${targetWeight} lbs)`,
              color: '#F0653C',
              showMark: false,
              valueFormatter: (v: number | null) => (v == null ? '' : `${v} lbs`),
            },
          ]}
          sx={{ '& .MuiLineChart-area': { fillOpacity: 0.12 } }}
          margin={{ left: 0, right: 12 }}
          slotProps={{ legend: { position: { vertical: 'top', horizontal: 'end' } } }}
        />
      </CardContent>
    </Card>
  );
}

function GoalEditDialog({ open, goal, onClose, onSave }: {
  open: boolean; goal: WeightGoal; onClose: () => void; onSave: (g: WeightGoal) => void;
}) {
  const [targetLoss, setTargetLoss] = useState(String(goal.targetLossLbs));
  const [targetDate, setTargetDate] = useState<Dayjs | null>(dayjs(goal.targetDate));
  const lossNum = Number(targetLoss);
  const valid = lossNum > 0 && targetDate != null && targetDate.isAfter(TODAY);
  const weeklyPace = valid ? (lossNum / Math.max(1, targetDate!.diff(goal.startDate, 'week'))).toFixed(1) : null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Edit weight loss goal</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          <TextField
            label="Target loss (lbs)"
            type="number"
            value={targetLoss}
            onChange={(e) => setTargetLoss(e.target.value)}
            fullWidth
          />
          <DatePicker
            label="Target date"
            value={targetDate}
            onChange={setTargetDate}
            minDate={TODAY.add(1, 'week')}
          />
          {weeklyPace && (
            <Alert severity={Number(weeklyPace) > 2 ? 'warning' : 'info'}>
              Required pace: <strong>{weeklyPace} lbs/week</strong> from start date.
              {Number(weeklyPace) > 2 && ' This exceeds the recommended 1–2 lbs/week — consider a later date.'}
            </Alert>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          disabled={!valid}
          onClick={() => onSave({ ...goal, targetLossLbs: lossNum, targetDate: targetDate!.format('YYYY-MM-DD') })}
        >
          Save goal
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function MedicationTab({ member }: { member: Member }) {
  const ladder = TITRATION[member.medication];
  const recentLogs = [...member.doseLogs].reverse().slice(0, 8);
  const [effects, setEffects] = useState(member.sideEffects);

  return (
    <Grid container spacing={2.5}>
      <Grid size={{ xs: 12, md: 5 }}>
        <Card sx={{ height: '100%' }}>
          <CardHeader
            title="Titration schedule"
            subheader={`${member.medication} · currently ${member.currentDoseMg} mg weekly`}
          />
          <Divider />
          <CardContent>
            <Stepper orientation="vertical" activeStep={member.titrationStepIndex}>
              {ladder.map((step) => (
                <Step key={step.doseMg}>
                  <StepLabel
                    optional={<Typography variant="caption" color="text.secondary">{step.weeks}</Typography>}
                  >
                    {step.doseMg} mg — {step.label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </CardContent>
        </Card>
      </Grid>
      <Grid size={{ xs: 12, md: 7 }}>
        <Stack spacing={2.5}>
          <Card>
            <CardHeader
              title="Dose adherence"
              subheader="Weekly injections, most recent first"
              action={
                <Chip
                  label={`${member.adherencePct}% last 4 weeks`}
                  color={member.adherencePct >= 90 ? 'success' : member.adherencePct >= 70 ? 'warning' : 'error'}
                  sx={{ mt: 1 }}
                />
              }
            />
            <Divider />
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Week of</TableCell>
                  <TableCell>Dose</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentLogs.map((log) => (
                  <TableRow key={log.date}>
                    <TableCell>{dayjs(log.date).format('MMM D, YYYY')}</TableCell>
                    <TableCell>{log.doseMg} mg</TableCell>
                    <TableCell>
                      <Chip
                        label={log.taken ? 'Taken' : 'Missed'}
                        size="small"
                        color={log.taken ? 'success' : 'error'}
                        variant={log.taken ? 'outlined' : 'filled'}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
          <Card>
            <CardHeader title="Side effects" subheader="Reported symptoms and escalations" />
            <Divider />
            {effects.length === 0 ? (
              <CardContent><Typography color="text.secondary">No side effects reported.</Typography></CardContent>
            ) : (
              <List disablePadding>
                {effects.map((se) => (
                  <ListItem key={se.id} divider sx={{ gap: 1.5 }}>
                    <ListItemText
                      primary={
                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                          <Typography variant="subtitle2">{se.symptom}</Typography>
                          <SeverityChip severity={se.severity} />
                        </Stack>
                      }
                      secondary={`${dayjs(se.date).format('MMM D, YYYY')} · ${se.notes}`}
                    />
                    {se.escalated ? (
                      <Chip icon={<LocalHospitalRoundedIcon />} label="Escalated to clinician" size="small" color="error" variant="outlined" sx={{ flexShrink: 0 }} />
                    ) : (
                      <Button
                        size="small"
                        color="error"
                        startIcon={<LocalHospitalRoundedIcon />}
                        onClick={() => setEffects((prev) => prev.map((e) => e.id === se.id ? { ...e, escalated: true } : e))}
                        sx={{ flexShrink: 0 }}
                      >
                        Escalate
                      </Button>
                    )}
                  </ListItem>
                ))}
              </List>
            )}
          </Card>
        </Stack>
      </Grid>
    </Grid>
  );
}

function GoalsTab({ member }: { member: Member }) {
  const statusColor = { 'on-track': 'primary', behind: 'warning', achieved: 'success' } as const;
  return (
    <Grid container spacing={2.5}>
      <Grid size={{ xs: 12, md: 7 }}>
        <Card>
          <CardHeader title="SMART goals" subheader="Behavior goals set with the member" />
          <Divider />
          <List disablePadding>
            {member.smartGoals.map((g) => (
              <ListItem key={g.id} divider sx={{ gap: 1.5 }}>
                <ListItemText
                  primary={
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                      {g.category === 'Nutrition' ? <RestaurantRoundedIcon fontSize="small" color="action" /> : <FitnessCenterRoundedIcon fontSize="small" color="action" />}
                      <Typography variant="subtitle2">{g.title}</Typography>
                    </Stack>
                  }
                  secondary={`${g.detail} · Review ${dayjs(g.due).format('MMM D')}`}
                />
                <Chip
                  label={g.status === 'on-track' ? 'On track' : g.status === 'behind' ? 'Behind' : 'Achieved'}
                  color={statusColor[g.status]}
                  size="small"
                  sx={{ flexShrink: 0 }}
                />
              </ListItem>
            ))}
          </List>
        </Card>
      </Grid>
      <Grid size={{ xs: 12, md: 5 }}>
        <Card>
          <CardHeader title="GLP-1 nutrition plan" subheader="Muscle preservation during loss" />
          <Divider />
          <CardContent>
            <Stack spacing={2}>
              <StatBlock label="Daily protein target" value={`${member.proteinTargetG} g`} sub="≈1.2 g/kg body weight — protein-first plating" />
              <Divider />
              <Typography variant="body2" color="text.secondary">
                <strong>Coach guidance:</strong> Prioritize 25–35g protein per meal before other foods. On
                higher-nausea days post-injection, switch to liquid protein (shakes, Greek yogurt smoothies)
                and small frequent meals. Pair with 2× weekly resistance training to protect lean mass.
              </Typography>
              <Alert severity="info" icon={<RestaurantRoundedIcon />}>
                Appetite suppression increases on dose changes — re-check intake the week after each titration step.
              </Alert>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}

function NotesTab({ member }: { member: Member }) {
  const [notes, setNotes] = useState<SessionNote[]>(member.notes);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({ subjective: '', objective: '', assessment: '', plan: '' });

  const addNote = () => {
    setNotes((prev) => [
      {
        id: `note-new-${prev.length}`,
        date: TODAY.format('YYYY-MM-DD'),
        author: 'Sarah Mitchell, NBC-HWC',
        type: 'SOAP',
        ...draft,
        signed: false,
      },
      ...prev,
    ]);
    setDraft({ subjective: '', objective: '', assessment: '', plan: '' });
    setOpen(false);
  };

  return (
    <Box>
      <Stack direction="row" sx={{ mb: 2, justifyContent: 'flex-end' }}>
        <Button variant="contained" onClick={() => setOpen(true)}>New SOAP note</Button>
      </Stack>
      <Stack spacing={2}>
        {notes.map((note) => (
          <Paper key={note.id} sx={{ p: 2.5 }}>
            <Stack direction="row" spacing={1} sx={{ mb: 1.5, alignItems: 'center' }}>
              <Typography variant="subtitle1">{dayjs(note.date).format('MMMM D, YYYY')}</Typography>
              <Chip label={note.type} size="small" variant="outlined" />
              <Box sx={{ flexGrow: 1 }} />
              {note.signed ? (
                <Chip icon={<LockRoundedIcon />} label={`Signed · ${note.author}`} size="small" color="success" variant="outlined" />
              ) : (
                <Chip
                  label="Unsigned draft"
                  size="small"
                  color="warning"
                  onClick={() => setNotes((prev) => prev.map((n) => n.id === note.id ? { ...n, signed: true } : n))}
                  onDelete={() => setNotes((prev) => prev.map((n) => n.id === note.id ? { ...n, signed: true } : n))}
                  deleteIcon={<Tooltip title="Sign note"><LockRoundedIcon /></Tooltip>}
                />
              )}
            </Stack>
            <Grid container spacing={2}>
              {(['subjective', 'objective', 'assessment', 'plan'] as const).map((k) => (
                <Grid key={k} size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'primary.dark' }}>
                    {k}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">{note[k] || '—'}</Typography>
                </Grid>
              ))}
            </Grid>
          </Paper>
        ))}
      </Stack>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>New SOAP note — {member.firstName} {member.lastName}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {(['subjective', 'objective', 'assessment', 'plan'] as const).map((k) => (
              <TextField
                key={k}
                label={k.charAt(0).toUpperCase() + k.slice(1)}
                multiline
                minRows={2}
                value={draft[k]}
                onChange={(e) => setDraft((d) => ({ ...d, [k]: e.target.value }))}
                fullWidth
              />
            ))}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={addNote} disabled={!draft.subjective && !draft.plan}>
            Save draft
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

const TAB_KEYS = ['overview', 'medication', 'goals', 'notes', 'internal-notes'];

export default function MemberProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const member = memberById(id ?? '');
  const tabParam = searchParams.get('tab');
  const [tab, setTab] = useState(() => Math.max(0, TAB_KEYS.indexOf(tabParam ?? 'overview')));
  const highlightNoteId = searchParams.get('note');

  // Keep the tab in sync when deep-linked (e.g. from the internal notes queue).
  useEffect(() => {
    if (tabParam) setTab(Math.max(0, TAB_KEYS.indexOf(tabParam)));
  }, [tabParam]);
  const [goal, setGoal] = useState<WeightGoal | null>(member?.weightGoal ?? null);
  const [editOpen, setEditOpen] = useState(false);

  if (!member || !goal) {
    return (
      <Box>
        <Typography variant="h5">Member not found</Typography>
        <Button onClick={() => navigate('/caseload')} sx={{ mt: 2 }}>Back to caseload</Button>
      </Box>
    );
  }

  const bmi = ((currentWeight(member) / (member.heightIn * member.heightIn)) * 703).toFixed(1);

  return (
    <Box>
      <Button startIcon={<ArrowBackRoundedIcon />} onClick={() => navigate('/caseload')} sx={{ mb: 2 }}>
        Caseload
      </Button>

      {/* Header */}
      <Paper sx={{ p: 3, mb: 2.5 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ alignItems: { md: 'center' } }}>
          <Stack direction="row" spacing={2} sx={{ flexGrow: 1, alignItems: 'center' }}>
            <MemberAvatar member={member} size={64} />
            <Box>
              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                <Typography variant="h5">{member.firstName} {member.lastName}</Typography>
                <EngagementChip status={member.engagement} />
              </Stack>
              <Typography color="text.secondary">
                {member.age} · {member.sex === 'F' ? 'Female' : 'Male'} · {member.occupation} · {member.unionLocal}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }}>
                <Chip label={member.phase} size="small" color="primary" variant="outlined" />
                <Chip label={`${member.medication} ${member.currentDoseMg} mg`} size="small" variant="outlined" />
                <Chip
                  icon={<VerifiedRoundedIcon />}
                  label={`Benefit: ${member.eligibilityStatus}`}
                  size="small"
                  color={member.eligibilityStatus === 'Active' ? 'success' : 'warning'}
                  variant="outlined"
                />
                <Chip label="Consent signed" size="small" variant="outlined" icon={<LockRoundedIcon />} />
              </Stack>
            </Box>
          </Stack>
          <Stack direction="row" spacing={3.5}>
            <StatBlock label="Week" value={`${member.persistenceWeeks}`} sub="in program" />
            <StatBlock label="BMI" value={bmi} sub={`${Math.floor(member.heightIn / 12)}'${member.heightIn % 12}"`} />
            <StatBlock label="Adherence" value={`${member.adherencePct}%`} sub="last 4 weeks" />
          </Stack>
        </Stack>
      </Paper>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2.5, borderBottom: 1, borderColor: 'divider' }}>
        <Tab label="Overview" />
        <Tab label="Medication" />
        <Tab label="Goals & Nutrition" />
        <Tab label="Session notes" />
        <Tab label="Internal notes" icon={<LockPersonRoundedIcon sx={{ fontSize: 16 }} />} iconPosition="start" />
      </Tabs>

      {tab === 0 && (
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, lg: 5 }}>
            <GoalProgressCard member={member} goal={goal} onEdit={() => setEditOpen(true)} />
          </Grid>
          <Grid size={{ xs: 12, lg: 7 }}>
            <WeightChart member={member} goal={goal} />
          </Grid>
        </Grid>
      )}
      {tab === 1 && <MedicationTab member={member} />}
      {tab === 2 && <GoalsTab member={member} />}
      {tab === 3 && <NotesTab member={member} />}
      {tab === 4 && <MemberInternalNotes member={member} highlightNoteId={highlightNoteId} />}

      <GoalEditDialog
        open={editOpen}
        goal={goal}
        onClose={() => setEditOpen(false)}
        onSave={(g) => { setGoal(g); setEditOpen(false); }}
      />
    </Box>
  );
}
