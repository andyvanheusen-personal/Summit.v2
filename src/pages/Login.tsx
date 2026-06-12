import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert, Box, Button, Chip, Divider, IconButton, InputAdornment, Paper, Stack, TextField, Typography,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import TerrainRoundedIcon from '@mui/icons-material/TerrainRounded';
import VerifiedUserRoundedIcon from '@mui/icons-material/VerifiedUserRounded';
import { useAuth } from '../auth/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (login(username, password)) {
      navigate('/');
    } else {
      setError(true);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        p: 2,
        background:
          'radial-gradient(1100px 600px at 15% -10%, rgba(20,160,146,0.35), transparent 60%),' +
          'radial-gradient(900px 500px at 110% 110%, rgba(240,101,60,0.18), transparent 55%),' +
          'linear-gradient(160deg, #0C2A2E 0%, #0E3A3C 55%, #0A5C55 100%)',
      }}
    >
      <Paper sx={{ width: '100%', maxWidth: 420, p: { xs: 3, sm: 5 }, borderRadius: 4, border: 'none', boxShadow: '0 24px 64px rgba(8,28,30,0.45)' }}>
        <Stack spacing={1} sx={{ mb: 3.5, alignItems: 'center' }}>
          <Box
            sx={{
              width: 56, height: 56, borderRadius: 3.5, display: 'grid', placeItems: 'center', mb: 0.5,
              background: 'linear-gradient(135deg, #14A092 0%, #0E7C72 60%, #0A5C55 100%)',
              boxShadow: '0 8px 20px rgba(14,124,114,0.4)',
            }}
          >
            <TerrainRoundedIcon sx={{ color: '#fff', fontSize: 34 }} />
          </Box>
          <Typography variant="h4">Summit</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
            Health Coach Portal — GLP-1 Benefit Program
          </Typography>
        </Stack>

        <form onSubmit={handleSubmit}>
          <Stack spacing={2.5}>
            {error && <Alert severity="error">Invalid credentials. Try the demo login below.</Alert>}
            <TextField
              label="Username"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setError(false); }}
              fullWidth
              autoFocus
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start"><PersonRoundedIcon fontSize="small" /></InputAdornment>
                  ),
                },
              }}
            />
            <TextField
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(false); }}
              fullWidth
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start"><LockRoundedIcon fontSize="small" /></InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword((s) => !s)} edge="end" size="small">
                        {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
            <Button type="submit" variant="contained" size="large" sx={{ py: 1.4, fontSize: 16 }}>
              Sign in
            </Button>
          </Stack>
        </form>

        <Divider sx={{ my: 3 }}>
          <Typography variant="caption" color="text.secondary">demo access</Typography>
        </Divider>
        <Stack direction="row" spacing={1} sx={{ mb: 2, justifyContent: 'center' }}>
          <Chip label="Username: demo" size="small" variant="outlined" onClick={() => setUsername('demo')} />
          <Chip label="Password: password" size="small" variant="outlined" onClick={() => setPassword('password')} />
        </Stack>
        <Stack direction="row" spacing={0.75} sx={{ justifyContent: 'center', alignItems: 'center' }}>
          <VerifiedUserRoundedIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
          <Typography variant="caption" color="text.secondary">
            HIPAA-compliant · SOC 2 Type II · Demo environment
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
}
