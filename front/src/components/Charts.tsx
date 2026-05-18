import { Grid } from '@mui/material';
import CumulativeChart from './CumulativeChart';
import PeakDetectionChart from './PeakDetectionChart';
import WeeklyPeakEmissions from './WeeklyPeakEmissions';
import ChartCard from './ChartCard';
import { useData } from '../context/DataContext';

interface ChartsProps {
  facility: string;
  startDate: string;
  endDate: string;
  emissionsData: any[];
  peaksData: any[];
}

const Charts: React.FC<ChartsProps> = ({
  facility,
  startDate,
  endDate,
  emissionsData,
  peaksData,
}) => {
  console.log(facility, startDate, endDate);
  const { savedPeaks } = useData();
  return (
    <Grid container spacing={3}>
      <Grid size={6}>
        <ChartCard title="Weekly Peak Emissions" height={350}>
          <WeeklyPeakEmissions savedPeaks={savedPeaks} />
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
            emissionsData={emissionsData}
            peaksData={peaksData}
          />
        </ChartCard>
      </Grid>
    </Grid>
  );
};

export default Charts;
