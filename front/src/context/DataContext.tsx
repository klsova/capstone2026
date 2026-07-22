import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  type ReactNode,
} from 'react';
import dayjs from 'dayjs';
import { fetchMbqConstant } from '../services/emissionService';

interface DataContextType {
  facility: string;
  setFacility: (facility: string) => void;
  startDate: string;
  setStartDate: (date: string) => void;
  endDate: string;
  setEndDate: (date: string) => void;
  emissionsData: any[];
  setEmissionsData: (data: any[]) => void;
  peaksData: any[];
  setPeaksData: (data: any[]) => void;
  savedPeaks: any[];
  setSavedPeaks: (data: any[]) => void;
  mbqConstant: number;
  setMbqConstant: (val: number) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [savedPeaks, setSavedPeaks] = useState<any[]>([]);
  const [facility, setFacility] = useState('Not Selected');
  const [startDate, setStartDate] = useState(dayjs().subtract(7, 'day').toISOString());
  const [endDate, setEndDate] = useState(dayjs().toISOString());
  const [emissionsData, setEmissionsData] = useState<any[]>([]);
  const [peaksData, setPeaksData] = useState<any[]>([]);
  const [mbqConstant, setMbqConstant] = useState<number>(34.28);

  // Fetches the active facility-specific MBq conversion multiplier whenever
  // the facility changes.
  useEffect(() => {
    if (facility && facility !== 'Not Selected') {
      fetchMbqConstant(facility)
        .then((val) => {
          setMbqConstant(val);
        })
        .catch((err) => {
          console.error('Failed to fetch MBq constant, using fallback value.', err);
          setMbqConstant(34.28);
        });
    }
  }, [facility]);

  return (
    <DataContext.Provider
      value={{
        facility,
        setFacility,
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        emissionsData,
        setEmissionsData,
        peaksData,
        setPeaksData,
        savedPeaks,
        setSavedPeaks,
        mbqConstant,
        setMbqConstant,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
};
