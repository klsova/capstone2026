import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware

# --- Demo purpose imports for saving peak area data
import os
import json
from pydantic import BaseModel
from typing import List, Optional
# --------------------------


def clean_counts(data):
    # na check and handling
    na_count = data['counts'].isna().sum()
    if na_count > 0:
        print(f"{na_count} NA's found, replacing with 0")
        data['counts'] = data['counts'].fillna(0)
    else:
        print("No NA's found!")

    # negative value handling
    if (data['counts'] < 0).any():
        neg_count = (data['counts'] < 0).sum()
        print(f"Warning: {neg_count} negative values found, clipped to 0.")
        data['counts'] = data['counts'].clip(lower=0)

    return data

# for all three facilities, na & negative value handling is called in the return


def rk_2_preprocess(data):
    rk_2_prep = data.copy()
    rk_2_prep["timestamp"] = pd.to_datetime(rk_2_prep["timestamp"])
    return clean_counts(rk_2_prep)


def aurum_preprocess(data):
    aurum_prep = data[["timestamp", "ch1_currentvalue"]].copy()
    aurum_prep["timestamp"] = pd.to_datetime(aurum_prep["timestamp"])
    aurum_prep.rename(columns={"ch1_currentvalue": "counts"}, inplace=True)
    return clean_counts(aurum_prep)


def floor_2_preprocess(data):
    floor_2_prep = data.copy()
    floor_2_prep["timestamp"] = pd.to_datetime(floor_2_prep["timestamp"])
    return clean_counts(floor_2_prep)

# schedule preprocess


def schedule_preprocess(schedule, facility):
    cols = ["start_of_beam", "end_of_beam", "end_of_synthesis"]
    schedule[cols] = schedule[cols].apply(pd.to_datetime)

    locations = {
        "rk_2": "PET-keskus/TYKS",
        "aurum": "Aurum"
    }

    target_loc = locations.get(facility)
    return schedule[schedule["location"] == target_loc].copy() if target_loc else schedule


def preprocess(data, facility, schedule):

    if facility == "rk_2":
        data = rk_2_preprocess(data)
    elif facility == "aurum":
        data = aurum_preprocess(data)
    elif facility == "floor_2":
        data = floor_2_preprocess(data)

    # preprocess Schedule
    processed_schedule = schedule_preprocess(schedule, facility)

    return data, processed_schedule

# usage
# df, df_schedule = preprocess(data, facility, schedule)


def window_calc(facility, data):

    # number of rows in data = timeframe
    rows = len(data)
    window_size = 1

    # size for rk_2 sample rate, sample rate c. 22 seconds
    if facility == "rk_2":
        if rows <= 492:
            window_size = rows + 1

        elif rows > 492 and rows <= 1080:

            window_size = rows // 4

        elif rows > 1080 and rows <= 2160:
            window_size = rows // 2

        else:
            window_size = 2161

    # size for aurum sample rate, sample rate c. 4s
    # TEST IF TOO BIG
    elif facility == "aurum":
        if rows <= 21600:
            window_size = rows // 8

        else:
            window_size = 10801

    # size for floor_2 sample rate, sample rate c. 10sec
    elif facility == "floor_2":
        if rows <= 984:
            window_size = rows + 1

        elif rows > 984 and rows <= 2160:

            window_size = rows // 4

        elif rows > 2160 and rows <= 4320:
            window_size = rows // 2

        else:
            window_size = 4320

    # IMPORTANT!! Calculation requires the window size to be odd, even number throws an error!
    if window_size % 2 == 0:
        window_size += 1
        '''
  print(rows)
  print(window_size)
  '''
    return int(window_size)

# usage
# window_size = window_calc(facility, df)
# print(window_size)


def threshold(data, window_size, n_sigma):

    # used to make MAD corresponsive to SD in terms of deviation from normal. 1.4826 may also be used.
    k_factor = 2.04

    if window_size >= len(data):
        median_val = data.median()
        mad_val = (data - median_val).abs().median()
        print("time interval too short for rolling window, global MAD used")
        threshold = pd.Series(
            median_val + (n_sigma * k_factor * mad_val), index=data.index)

    else:

        # rolling median, center and min periods necessary for correct alignment
        # note: rolling() returns a pd.Series
        rolling_median = data.rolling(
            window=window_size, center=True, min_periods=1).median()

        # difference between data and the rolling median
        abs_diff = (data - rolling_median).abs()

        # rolling median for the previous absolute difference
        rolling_mad = abs_diff.rolling(
            window=window_size, center=True, min_periods=1).median()

        # multiply by scaling
        threshold = rolling_median + (n_sigma * k_factor * rolling_mad)

    return threshold

# usage
# df['threshold'] = threshold(df['counts'], window_size, n_sigma)


def detect_peaks(data):

    above_threshold = data['counts'] > data['threshold']

    peak_mask = above_threshold != above_threshold.shift()
    peak_group = peak_mask.cumsum()

    peaks = data[above_threshold].groupby(peak_group[above_threshold]).agg(
        peak_start=('timestamp', 'first'),
        peak_end=('timestamp', 'last')
    )

    peaks['duration_sec'] = peaks['peak_end'] - peaks['peak_start']
    peaks['duration_sec'] = peaks['duration_sec'].dt.total_seconds().round().astype(int)
    peaks.reset_index(drop=True, inplace=True)
    peaks.insert(0, 'peak_id', peaks.index + 1)

    return peaks

# usage
# peaks_df = detect_peaks(df)


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# ---Demo purpose implementation for saving data------


class PeakModel(BaseModel):
    id: str
    startTime: str
    endTime: str
    notes: Optional[str] = ""
    area: Optional[float] = 0.0
    mbqConstant: Optional[float] = 34.28


class SavePeaksRequest(BaseModel):
    facility: str
    peaks: List[PeakModel]
# ----------------------------


@app.get("/api/emissions")
async def get_emissions(
    facility: str,
    startDate: str,
    endDate: str,
    n_sigma: int = Query(6, description="Multiplier for threshold")
):
    # convert strings to pandas datetime objects
    start_date = pd.to_datetime(startDate)
    end_date = pd.to_datetime(endDate)

    # fetching data

    def fetching(facility):
        if facility == "rk_2":
            data = pd.read_csv("rk2_2026-02-03.csv")
        elif facility == "floor_2":
            data = pd.read_csv("2ndfloor_2026-02-03.csv")
        elif facility == "aurum":
            data = pd.read_csv("aurum_2026-02-03.csv")

        else:
            # error if facility name incorrect
            raise ValueError(f"Unknown facility: {facility}")

        schedule = pd.read_csv("schedule_2026-02-03.csv")
        return data, schedule

    data, schedule = fetching(facility)

    # preprocess
    df, df_schedule = preprocess(data, facility, schedule)
    df = df[(df['timestamp'] >= start_date)
            & (df['timestamp'] <= end_date)]
    df_schedule = df_schedule[(schedule['start_of_beam'] >= start_date) & (
        df_schedule['end_of_synthesis'] <= end_date)]

    # window calc
    window_size = window_calc(facility, df["counts"])

    # scalar value, CHANGE LATER TO BE ABLE TO BE CHANGED FROM FRONT
    # n_sigma = 6

    # threshold calculation
    df['threshold'] = threshold(df["counts"], window_size, n_sigma)

    # peak detection
    peaks_df = detect_peaks(df)

    return {
        "df": df.to_dict(orient='records'),
        "peaks": peaks_df.to_dict(orient='records'),
        "n_sigma": n_sigma
    }


@app.post("/api/save_peaks")
async def save_peaks(request: SavePeaksRequest):
    filename = f"{request.facility}_saved_peaks.json"

    incoming_data = [peak.dict() for peak in request.peaks]
    existing_data = []

    if os.path.exists(filename):
        try:
            with open(filename, "r", encoding="utf-8") as file:
                existing_data = json.load(file)
        except Exception:
            existing_data = []

    combined_peaks = {peak["startTime"]: peak for peak in existing_data}

    for peak in incoming_data:
        combined_peaks[peak["startTime"]] = peak

    final_data = list(combined_peaks.values())

    with open(filename, "w", encoding="utf-8") as file:
        json.dump(final_data, file, indent=4, ensure_ascii=False)

    return {"message": f"Successfully saved {len(final_data)} peaks to {filename}"}
# -------------------------------


@app.get("/api/saved_peaks/{facility}")
async def get_saved_peaks(facility: str):
    filename = f"{facility}_saved_peaks.json"
    if os.path.exists(filename):
        try:
            with open(filename, "r", encoding="utf-8") as file:
                return json.load(file)
        except Exception as e:
            print(f"Error reading the file: {e}")
            return []
    return []

# Demo purpose implementation of MBq divisor constant fetching and updating
FACILITY_CONSTANTS_FILE = "facility_constants.json"

DEFAULT_CONSTANTS = {
    "rk_2": 34.28,
    "aurum": 34.28,
    "floor_2": 34.28
}


class ConstantUpdateRequest(BaseModel):
    facility: str
    new_value: float


def get_all_constants():
    if os.path.exists(FACILITY_CONSTANTS_FILE):
        try:
            with open(FACILITY_CONSTANTS_FILE, "r", encoding="utf-8") as file:
                return json.load(file)
        except Exception:
            return DEFAULT_CONSTANTS
        return DEFAULT_CONSTANTS


@app.get("/api/constant/{facility}")
async def get_constant(facility: str):
    constants = get_all_constants()
    val = constants.get(facility, 34.28)
    return {"facility": facility, "mbq_constant": val}


@app.post("/api/constant")
async def update_constant(request: ConstantUpdateRequest):
    constants = get_all_constants()
    constants[request.facility] = request.new_value

    with open(FACILITY_CONSTANTS_FILE, "w", encoding="utf-8") as file:
        json.dump(constants, file, indent=4)

    return {"message": "Constant updated successfully", "new_value": request.new_value}
