import { Grid } from '@mui/material';
import CumulativeChart from './CumulativeChart';
import PeakDetectionChart from './PeakDetectionChart';
import HourlyActivityChart from './HourlyActivityChart';
import ChartCard from './ChartCard';

interface ChartsProps {
  facility: string;
  startDate: string;
  endDate: string;
}

const Charts: React.FC<ChartsProps> = ({ facility, startDate, endDate }) => {
  console.log(facility, startDate, endDate);

  return (
    <Grid container spacing={3}>
      {/*Tuntikaavio*/}
      <Grid size={6}>
        <ChartCard title="Hourly Activity" height={350}>
          <HourlyActivityChart />
        </ChartCard>
      </Grid>

      {/*Kumulaatiokaavio*/}
      <Grid size={6}>
        <ChartCard title="Cumulative Sum" height={350}>
          <CumulativeChart startDate={startDate} endDate={endDate} />
        </ChartCard>
      </Grid>

      {/*Piikkikaavio*/}
      <Grid size={12}>
        <ChartCard title={`Peak Detection: ${facility}`} height={400}>
          <PeakDetectionChart
            facility={facility}
            startDate={startDate}
            endDate={endDate}
          />
        </ChartCard>
      </Grid>
    </Grid>
  );
};

export default Charts;
