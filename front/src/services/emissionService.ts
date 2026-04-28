import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// names used on backend, unify later
const facilityMap: Record<string, string> = {
  "Aurum": "aurum",
  "PET_Downstairs": "rk_2",
  "PET_Upstairs": "floor_2"
};

const stripTimezone = (dateStr: string) => {
  const isoString = new Date(dateStr).toISOString();
  return isoString.substring(0, 19).replace('T', ' ');
};

export const fetchEmissionData = async (facility: string, startDate: string, endDate: string) => {
  try {

    // 
    const mappedFacility = facilityMap[facility];

    const formattedStart = stripTimezone(startDate);
    const formattedEnd = stripTimezone(endDate);

    const response = await axios.get(`${API_URL}/emissions`, {
      params: { facility: mappedFacility, startDate: formattedStart, endDate: formattedEnd }
    });

    const responseData = response.data;

    
    const emissions = responseData.df || [];
    const peaks = (responseData.peaks || []).map((p: any) => ({
      id: `PEAK-${p.peak_id}`,
      startTime: p.peak_start,
      endTime: p.peak_end,
      severity: 'High'
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