import { useLocation } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';
import Charts from './Charts';
import dayjs from 'dayjs';

const Dashboard = () => {
  const location = useLocation();

  // Käyttäjän aloitusruudussa valitsema laitos + aikaikkuna
  const { facility, start, end } = location.state || {
    facility: 'Not Selected',
    start: dayjs().subtract(7, 'day').toISOString(),
    end: dayjs().toISOString,
  };

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
            Dashboard: {facility}
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: 'text.secondary', fontFamily: 'monospace' }}
          >
            Time range: {dayjs(start).format('DD.MM.YYYY')} -{' '}
            {dayjs(end).format('DD.MM.YYYY')}
          </Typography>
        </Box>
        <Button
          variant="contained"
          sx={{ bgcolor: '#60c9f8', '&:hover': { bgcolor: '#4fb8e7' }, px: 4, py: 1 }}
        >
          Export
        </Button>
      </Box>

      <Charts facility={facility} startDate={start} endDate={end} />
    </Box>
  );
};

export default Dashboard;
