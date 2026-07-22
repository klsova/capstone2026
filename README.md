# Radiation Emission Tracking System - Frontend

## 1. Overview

The Radiation Emission Tracking System is a Single Page Application (SPA) built with React and TypeScript. Its primary purpose is to provide interface to analyze emission data (counts), present detected anomalous emission peaks, and track cumulative radiation limits in Megabecquerels, MBq.

The application fetches data from a Python backend and utilizes interactive visualizations to allow approving, editing, or rejecting detected peaks before saving them for future use in reporting.

### Core Technologies
* **Framework:** React 18 (via Vite)
* **Language:** TypeScript
* **Routing:** React Router v6
* **UI Components:** Material-UI (MUI) v5
* **Data Visualization:** Recharts
* **Date Handling:** Day.js
* **Data Fetching:** Axios
* **Reporting:** ExcelJS

---

## 2. Getting Started

### Prerequisites
* Node.js (v18+)
* npm or yarn

### Installation
1. Navigate to the front directory from repository root:
   ```
   cd front
   ```
2. Install the required dependencies:
   ```
   npm install
   ```

### Environment Variables
Create a `.env` file in the root of the `front` directory. The application requires the backend API URL to function correctly:

```env
# The URL pointing to the Python FastAPI backend
VITE_API_URL=http://localhost:8000/api
```

### Running the Application
To start the local development server:
```
npm run dev
```
The application will typically be available at `http://localhost:5173`.

---

## 3. Project Structure

The codebase is modular and organized by feature and responsibility.

```text
src/
├── components/          # Reusable UI elements and main views
│   ├── Charts.tsx               # Wrapper for all dashboard charts
│   ├── ChartCard.tsx            # Expandable card container for charts
│   ├── CumulativeChart.tsx      # Annual tracking against limits
│   ├── Dashboard.tsx            # Main operational view
│   ├── FacilitySelection.tsx    # Landing page for facility & date selection
│   ├── PeakDetectionChart.tsx   # Core interactive area chart for raw data
│   ├── Settings.tsx             # Configuration (e.g., MBq constants)
│   ├── Sidebar.tsx              # Application navigation
│   └── WeeklyPeakEmissions.tsx  # Weekly aggregation bar chart
│
├── context/             # Global state management
│   └── DataContext.tsx          # Handles facility, dates, constants, and loaded data
│
├── services/            # External API communication
│   └── emissionService.ts       # Axios calls to the Python backend
│
├── utils/               # Helper functions
│   └── exportUtils.ts           # ExcelJS logic for report generation
│
├── App.tsx              # Main application router
└── main.tsx             # React entry point
```
## 4. State Management (Context API)

The application utilizes React's Context API (`DataContext.tsx`) to manage global state. This ensures that user selections and fetched data remain synchronized across all views and components without the need for prop-drilling.

Key global states managed by `DataContext`:
* **Contextual Data:** `facility` (active location), `startDate`, and `endDate`.
* **Emission Data:** 
  * `emissionsData`: Raw time-series data points (counts and dynamic threshold).
  * `peaksData`: Automatically detected or manually added peaks currently being reviewed in the dashboard.
  * `savedPeaks`: Historically approved and archived peaks fetched from the backend.
* **Physics Constants:** `mbqConstant`. A facility-specific divider (calibration constant) used to convert raw counts into Megabecquerels (MBq). This is dynamically fetched from the server whenever a new facility is selected.

---

## 5. Core Features & Logic

### 5.1 Data Fetching & API Communication (`emissionService.ts`)
The application communicates with the Python FastAPI backend via Axios. 
* **Dynamic Data Retrieval:** Fetches raw emission points and automatically detected peaks based on the selected facility, time range, and statistical threshold multiplier (`n_sigma`).
* **Constant Management:** Retrieves and updates facility-specific MBq conversion constants.
* **Area Calculation:** Computes the integral area (counts above threshold) for any given time window directly on the client side.

### 5.2 Interactive Peak Detection (`PeakDetectionChart.tsx`)

* **Visualization:** Plots raw counts against a dynamically calculated threshold using Recharts. Users can toggle between a daily detailed view and a full-range view.
* **Peak Management:** Users can click on existing peaks to edit their boundaries and notes, or click anywhere on the chart to manually create new peaks via a dedicated modal.
* **Real-time Conversion:** The custom tooltip displays peak areas in both raw counts and MBq units, utilizing the active `mbqConstant`.
* **Overlap Handling:** If a user manually adjusts a peak so that it collides with another, the system automatically detects the overlap and asks to delete the overridden peak.

### 5.3 Long-term Tracking (`CumulativeChart.tsx` & `WeeklyPeakEmissions.tsx`)
* **Weekly Aggregation:** Sums up the area of all approved peaks on a weekly basis.
* **Cumulative Sum:** Tracks the running total of emissions (in MBq) throughout the year and visualizes it against an indicative limit.

### 5.4 Report Generation (`exportUtils.ts`)
* **Client-side Export:** Uses the `exceljs` library to generate an Excel (`.xlsx`) report.
