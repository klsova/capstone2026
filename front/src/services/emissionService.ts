import axios from 'axios';
import dayjs from 'dayjs';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// names used on backend, unify later
const facilityMap: Record<string, string> = {
  "Aurum": "aurum",
  "PET_Downstairs": "rk_2",
  "PET_Upstairs": "floor_2"
};

export const calculatePeakArea = (startTime: string, endTime: string, emissions: any[]): number => {
  const startTimeMs = new Date(startTime).getTime();
  const endTimeMs = new Date(endTime).getTime();
  let area = 0;

  emissions.forEach((d: any) => {
    const timestampMs = new Date(d.timestamp).getTime();

    if (timestampMs >= startTimeMs && timestampMs <= endTimeMs) {
      if (d.counts > d.threshold) {
        area += (d.counts - d.threshold);
      }
    }
  });

  return Math.round(area * 100) / 100;
}

const stripTimezone = (dateStr: string) => {
  if (!dateStr || dateStr === "Invalid Date") return "";

  const dateObj = new Date(dateStr);
  if (isNaN(dateObj.getTime())) return "";

  return dateObj.toISOString().substring(0, 19).replace('T', ' ');
};

export const fetchEmissionData = async (facility: string, startDate: string, endDate: string, nSigma: number = 6) => {
  try {
    const mappedFacility = facilityMap[facility];

    // const formattedStart = stripTimezone(startDate);
    // const formattedEnd = stripTimezone(endDate);
    const formattedStart = dayjs(startDate).format('YYYY-MM-DD HH:mm:ss');
    const formattedEnd = dayjs(endDate).format('YYYY-MM-DD HH:mm:ss');



    const response = await axios.get(`${API_URL}/emissions`, {
      params: { facility: mappedFacility, startDate: formattedStart, endDate: formattedEnd, n_sigma: nSigma }
    });

    const responseData = response.data;

    
    const emissions = responseData.df || [];
    const peaks = (responseData.peaks || []).map((p: any) => ({
      id: `PEAK-${p.peak_id}`,
      startTime: p.peak_start,
      endTime: p.peak_end,
      severity: 'High',
      area: calculatePeakArea(p.peak_start, p.peak_end, emissions)
    }));

    return {
      emissions,
      peaks
    };
  } catch (error) {
    console.error("Error when fetching emission data:", error);
    throw error;
  }
}

export const savePeaksToBackend = async (facility: string, peaks: any[]) => {
  try {
    const response = await axios.post(`${API_URL}/save_peaks`, {
      facility: facility,
      peaks: peaks
    });
    return response.data;
  } catch (error) {
    console.error("Error trying to save emission data", error);
    throw error;
  }
};

export const fetchSavedPeaks = async (facility: string) => {
  try {
    const response = await axios.get(`${API_URL}/saved_peaks/${facility}`);
    return response.data;
  } catch (error) {
    console.error("Error when trying to fetch saved peak data:", error);
    return [];
  }
};