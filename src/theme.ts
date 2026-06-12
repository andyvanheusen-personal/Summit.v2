import { createTheme, alpha } from '@mui/material/styles';

const TEAL = '#0E7C72';
const TEAL_DARK = '#0A5C55';
const CORAL = '#F0653C';
const INK = '#13252B';
const SLATE = '#5B6B73';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: TEAL, dark: TEAL_DARK, light: '#3BA199', contrastText: '#fff' },
    secondary: { main: CORAL, contrastText: '#fff' },
    success: { main: '#1E9E6A' },
    warning: { main: '#E8A13D' },
    error: { main: '#D9534F' },
    info: { main: '#3D7DD8' },
    background: { default: '#F4F7F7', paper: '#FFFFFF' },
    text: { primary: INK, secondary: SLATE },
    divider: '#E3EAEA',
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: '"Inter", "Segoe UI", "Helvetica Neue", Arial, sans-serif',
    h4: { fontWeight: 700, letterSpacing: '-0.02em' },
    h5: { fontWeight: 700, letterSpacing: '-0.01em' },
    h6: { fontWeight: 650 },
    subtitle1: { fontWeight: 600 },
    subtitle2: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: { border: '1px solid #E3EAEA' },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: '1px solid #E3EAEA',
          boxShadow: '0 1px 3px rgba(19,37,43,0.06)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 10 },
        contained: {
          boxShadow: '0 2px 8px ' + alpha(TEAL, 0.35),
          '&:hover': { boxShadow: '0 3px 10px ' + alpha(TEAL, 0.45) },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600 },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: { borderRadius: 99, height: 8, backgroundColor: '#E7EEEE' },
        bar: { borderRadius: 99 },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 700,
          color: SLATE,
          fontSize: 12,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          backgroundColor: '#FAFCFC',
        },
      },
    },
    MuiTab: {
      styleOverrides: { root: { fontWeight: 600 } },
    },
  },
});
