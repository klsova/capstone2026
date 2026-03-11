import { Box, Typography, Button } from '@mui/material';

import Charts from './Charts';

const Dashboard = () => {
  return (
    <Box component="main" sx={{ flexGrow: 1, p: 4 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          mb: 4,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            Dashboard
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: 'text.secondary', fontFamily: 'monospace' }}
          >
            Last updated: DD-MM-YY HH:MM
          </Typography>
        </Box>
        <Button
          variant="contained"
          sx={{ bgcolor: '#60c9f8', '&:hover': { bgcolor: '#4fb8e7' }, px: 4, py: 1 }}
        >
          Export
        </Button>
      </Box>

      <Charts />
    </Box>
  );
};

export default Dashboard;
