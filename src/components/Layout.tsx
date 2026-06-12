import { useState } from 'react';
import { Outlet, NavLink, useNavigate, Navigate } from 'react-router-dom';
import {
  AppBar, Avatar, Badge, Box, Chip, Divider, Drawer, IconButton, List, ListItemButton,
  ListItemIcon, ListItemText, Menu, MenuItem, Toolbar, Tooltip, Typography,
} from '@mui/material';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import ForumRoundedIcon from '@mui/icons-material/ForumRounded';
import SpeakerNotesRoundedIcon from '@mui/icons-material/SpeakerNotesRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded';
import VerifiedUserRoundedIcon from '@mui/icons-material/VerifiedUserRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import TerrainRoundedIcon from '@mui/icons-material/TerrainRounded';
import { useAuth } from '../auth/AuthContext';
import { useMessages } from '../context/MessagesContext';
import { useInternalNotes } from '../context/InternalNotesContext';
import { ALERTS, COACH } from '../data/mockData';

const DRAWER_WIDTH = 240;

const NAV = [
  { to: '/', label: 'Today', icon: <DashboardRoundedIcon /> },
  { to: '/caseload', label: 'Caseload', icon: <GroupsRoundedIcon /> },
  { to: '/inbox', label: 'Inbox', icon: <ForumRoundedIcon /> },
  { to: '/internal-notes', label: 'Internal Notes', icon: <SpeakerNotesRoundedIcon /> },
  { to: '/calendar', label: 'Calendar', icon: <CalendarMonthRoundedIcon /> },
  { to: '/reports', label: 'Reports', icon: <InsightsRoundedIcon /> },
];

export default function Layout() {
  const { isAuthenticated, logout } = useAuth();
  const { unreadCount: unread } = useMessages();
  const { taggedActiveCount } = useInternalNotes();
  const navigate = useNavigate();
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const openAlerts = ALERTS.filter((a) => !a.resolved).length;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            bgcolor: '#0C2A2E',
            color: '#C9DCDC',
            border: 'none',
          },
        }}
      >
        <Toolbar
          onClick={() => navigate('/')}
          role="link"
          aria-label="Go to Today dashboard"
          sx={{
            gap: 1.2,
            px: 2.5,
            cursor: 'pointer',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' },
          }}
        >
          <Box
            sx={{
              width: 34, height: 34, borderRadius: 2.5, display: 'grid', placeItems: 'center',
              background: 'linear-gradient(135deg, #14A092 0%, #0E7C72 60%, #0A5C55 100%)',
            }}
          >
            <TerrainRoundedIcon sx={{ color: '#fff', fontSize: 22 }} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 800, color: '#fff', lineHeight: 1.1, letterSpacing: '-0.01em' }}>
              Summit
            </Typography>
            <Typography variant="caption" sx={{ color: '#7FA8A5', lineHeight: 1 }}>
              Coach Portal
            </Typography>
          </Box>
        </Toolbar>
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />
        <List sx={{ px: 1.5, pt: 2, flexGrow: 1 }}>
          {NAV.map((item) => (
            <ListItemButton
              key={item.to}
              component={NavLink}
              to={item.to}
              end={item.to === '/'}
              sx={{
                borderRadius: 2.5,
                mb: 0.5,
                color: '#A9C4C2',
                '& .MuiListItemIcon-root': { color: '#7FA8A5', minWidth: 40 },
                '&.active': {
                  bgcolor: 'rgba(20,160,146,0.18)',
                  color: '#fff',
                  '& .MuiListItemIcon-root': { color: '#2FBFAF' },
                },
                '&:hover': { bgcolor: 'rgba(255,255,255,0.06)' },
              }}
            >
              <ListItemIcon>
                {item.label === 'Inbox' ? (
                  <Badge badgeContent={unread} color="secondary">{item.icon}</Badge>
                ) : item.label === 'Internal Notes' ? (
                  <Badge badgeContent={taggedActiveCount} color="secondary">{item.icon}</Badge>
                ) : item.label === 'Today' ? (
                  <Badge badgeContent={openAlerts} color="error" variant="dot">{item.icon}</Badge>
                ) : (
                  item.icon
                )}
              </ListItemIcon>
              <ListItemText primary={item.label} slotProps={{ primary: { sx: { fontWeight: 600, fontSize: 14.5 } } }} />
            </ListItemButton>
          ))}
        </List>
        <Box sx={{ p: 2 }}>
          <Chip
            icon={<VerifiedUserRoundedIcon sx={{ fontSize: 15 }} />}
            label="HIPAA-secure session"
            size="small"
            sx={{
              width: '100%', bgcolor: 'rgba(20,160,146,0.15)', color: '#8FCFC8',
              '& .MuiChip-icon': { color: '#2FBFAF' }, fontSize: 11.5,
            }}
          />
        </Box>
      </Drawer>

      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <AppBar
          position="sticky"
          color="transparent"
          sx={{ bgcolor: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(8px)', borderBottom: '1px solid', borderColor: 'divider', boxShadow: 'none' }}
        >
          <Toolbar sx={{ justifyContent: 'flex-end', gap: 1.5 }}>
            <Typography variant="body2" color="text.secondary">
              Friday, June 12, 2026
            </Typography>
            <Tooltip title="Account">
              <IconButton onClick={(e) => setMenuAnchor(e.currentTarget)} size="small">
                <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main', fontWeight: 700, fontSize: 15 }}>
                  SM
                </Avatar>
              </IconButton>
            </Tooltip>
            <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
              <Box sx={{ px: 2, py: 1 }}>
                <Typography variant="subtitle2">{COACH.name}, {COACH.credentials}</Typography>
                <Typography variant="caption" color="text.secondary">{COACH.title}</Typography>
              </Box>
              <Divider />
              <MenuItem
                onClick={() => {
                  setMenuAnchor(null);
                  logout();
                  navigate('/login');
                }}
              >
                <ListItemIcon><LogoutRoundedIcon fontSize="small" /></ListItemIcon>
                Sign out
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>
        <Box component="main" sx={{ p: { xs: 2, md: 3.5 }, flexGrow: 1 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
