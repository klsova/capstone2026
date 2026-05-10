import React, { createContext, useState, useContext, type ReactNode } from 'react';
import dayjs from 'dayjs';

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
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [facility, setFacility] = useState('Not Selected');
  const [startDate, setStartDate] = useState(dayjs().subtract(7, 'day').toISOString());
  const [endDate, setEndDate] = useState(dayjs().toISOString());
  const [emissionsData, setEmissionsData] = useState<any[]>([]);
  const [peaksData, setPeaksData] = useState<any[]>([]);

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
