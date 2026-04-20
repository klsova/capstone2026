import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const fetchEmissionData = async (facility: string, startDate: string, endDate: string) => {
  try {
    const response = await axios.get(`${API_URL}/emissions`, {
      params: { facility, startDate, endDate }
    });

    return response.data;
  } catch (error) {
    console.error("Error when fetching emission data:", error);
    throw error;
  }
}