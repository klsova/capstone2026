import { Paper, Grid } from '@mui/material';
import CumulativeChart from './CumulativeChart';
import PeakDetectionChart from './PeakDetectionChart';
import HourlyActivityChart from './HourlyActivityChart';

const Charts = () => {
  return (
    <Grid container spacing={3}>
      {/*Tuntikaavio*/}
      <Grid size={6}>
        <Paper
          sx={{
            p: 3,
            height: 350,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'text.secondary',
            boxSizing: 'border-box',
          }}
        >
          <HourlyActivityChart />
        </Paper>
      </Grid>
      {/*Kumulaatiokaavio*/}
      <Grid size={6}>
        <Paper
          sx={{
            p: 3,
            height: 350,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            color: 'text.secondary',
            boxSizing: 'border-box',
          }}
        >
          <CumulativeChart />
        </Paper>
      </Grid>

      {/*Piikkikaavio*/}
      <Grid size={12}>
        <Paper
          sx={{
            p: 3,
            height: 400,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'text.secondary',
          }}
        >
          <PeakDetectionChart />
        </Paper>
      </Grid>
    </Grid>
  );
};

export default Charts;
