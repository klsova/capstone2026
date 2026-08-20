import { Grid } from '@mui/material';
import CumulativeChart from './CumulativeChart';
import PeakDetectionChart from './PeakDetectionChart';
import WeeklyPeakEmissions from './WeeklyPeakEmissions';
import ChartCard from './ChartCard';

interface ChartsProps {
  facility: string;
  startDate: string;
  endDate: string;
  emissionsData: any[];
  peaksData: any[];
  annualPeaks: any[];
}

const Charts: React.FC<ChartsProps> = ({
  facility,
  startDate,
  endDate,
  emissionsData,
  peaksData,
  annualPeaks,
}) => {
  return (
    <Grid container spacing={3}>
      <Grid size={6}>
        <ChartCard title="Weekly Peak Emissions" height={350}>
          <WeeklyPeakEmissions savedPeaks={annualPeaks} />
        </ChartCard>
      </Grid>

      {/*Kumulaatiokaavio*/}
      <Grid size={6}>
        <ChartCard title="Cumulative Sum [MBq]" height={350}>
          <CumulativeChart savedPeaks={annualPeaks} />
        </ChartCard>
      </Grid>

      {/*Piikkikaavio*/}
      <Grid size={12}>
        <ChartCard title={`Peak Detection: ${facility}`} height={400}>
          <PeakDetectionChart
            facility={facility}
            startDate={startDate}
            endDate={endDate}
            emissionsData={emissionsData}
            peaksData={peaksData}
          />
        </ChartCard>
      </Grid>
    </Grid>
  );
};

export default Charts;
