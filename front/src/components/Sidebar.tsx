import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Typography,
  ListItemButton,
  Divider,
} from '@mui/material';

import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const drawerWidth: number = 260;
  const location = useLocation();
  const menuItems = [
    { text: 'Dashboard', path: '/dashboard' },
    { text: 'Reports', path: '/reports' },
    { text: 'Notifications', path: '/notifications' },
    { text: 'Settings', path: '/settings' },
  ];

  return (
    <Box
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiPaper-root': {
          width: drawerWidth,
          boxSizing: 'border-box',
          bgcolor: '#293a4a',
          color: 'white',
          p: 2,
        },
      }}
    >
      <Drawer variant="permanent" anchor="left" open>
        <Typography variant="h6" sx={{ p: 2, fontWeight: 'bold', lineHeight: 1.2 }}>
          Radiation Emission Tracking
        </Typography>

        <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)', my: 2 }} />

        <List>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                component={Link}
                to={item.path}
                sx={{
                  bgcolor:
                    location.pathname === item.path
                      ? 'rgba(214, 242, 255, 0.1)'
                      : 'transparent',
                  borderRadius: 1,
                  mb: 1,
                }}
              >
                <ListItemText primary={item.text} />

                {/* Placeholder ilmoituspallura*/}
                {item.text === 'Notifications' && (
                  <Box
                    component={'span'}
                    sx={{
                      bgcolor: 'red',
                      color: 'white',
                      borderRadius: '40%',
                      px: 1,
                      fontSize: '0.7rem',
                      ml: 1,
                    }}
                  >
                    3
                  </Box>
                )}
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Typography variant="overline" sx={{ px: 2, mt: 4, color: 'gray' }}>
          Facilities
        </Typography>
        <List>
          {['Aurum', 'PET Centre Downstairs', 'PET Centre Upstairs'].map((text) => (
            <ListItem key={text}>
              <ListItemText primary={`• ${text}`} sx={{ color: 'lightgray' }} />
            </ListItem>
          ))}
        </List>

        {/* Terminaali-placeholder*/}
        <Box
          sx={{
            mt: 'auto',
            bgcolor: '#04151f',
            p: 2,
            borderRadius: 1,
            borderLeft: '4px solid #00acc1',
            height: 100,
          }}
        >
          <Typography
            variant="caption"
            sx={{ color: 'gray', textTransform: 'uppercase' }}
          >
            Terminal
          </Typography>
        </Box>
      </Drawer>
    </Box>
  );
};

export default Sidebar;
