import json
from pathlib import Path

import numpy as np
import pandas as pd
import yaml

from logger import CustomLogger
from utils import generate_event_string, get_data_path, time_this_function


class FootballDataHandler:
    def __init__(self, logger: CustomLogger, reqd_game_ids: list[str] = None, minor_events: list[str] = None):
        self.logger = logger
        self.data_dir = get_data_path()

        event_map_file = self.data_dir / "dictionary.yaml"
        game_events_file = self.data_dir / "events.csv"
        game_data_file = self.data_dir / "ginf.csv"

        self.minor_events = minor_events
        combined_df = self.combine_data_files(game_events_file, game_data_file)
        if reqd_game_ids is not None:
            combined_df = self.filter_game_ids(combined_df, reqd_game_ids)
        self.preprocess_data(combined_df, event_map_file)

    @time_this_function
    def combine_data_files(self, game_events_file: Path, game_data_file: Path) -> pd.DataFrame:
        events = pd.read_csv(game_events_file)
        ginf = pd.read_csv(game_data_file)
        self.logger.log_info("Merging the two dataframes on the column 'id_odsp'.")
        return events.merge(ginf, on="id_odsp", suffixes=("_events", "_ginf"))

    def filter_game_ids(self, data: pd.DataFrame, game_ids: list[str]) -> pd.DataFrame:
        return data[data["id_odsp"].isin(game_ids)]

    @time_this_function
    def preprocess_data(self, data: pd.DataFrame, event_map_file: Path):
        # Drop unnecessary columns
        self.logger.log_info("Dropping unnecessary columns from the dataframe.")
        data.drop(columns=["adv_stats", "link_odsp"], inplace=True)
        data.drop(columns=[col for col in data.columns if col.startswith("odd_")], inplace=True)

        # Replace values according to the mappings given in the event_map_file
        with open(event_map_file, "r") as ed_file:
            event_dict = yaml.safe_load(ed_file)

        self.logger.log_info("Replacing values in the dataframe according to the mappings given in the event_map_file.")
        for column_name, mapping in event_dict.items():
            mapping = {int(ev): ev_name for ev, ev_name in mapping.items()}
            data[column_name] = data[column_name].fillna(-1).astype(int)
            data[column_name] = data[column_name].map(mapping)
            data[column_name] = data[column_name].replace(-1, np.nan)

        # Drop rows with duplicate text values, because those are of less importance and quality
        self.logger.log_info("Dropping rows with duplicate text values from the dataframe.")
        value_counts = data["text"].value_counts()
        filtered_ixs = value_counts[value_counts < 2].index
        data = data[data["text"].isin(filtered_ixs)]

        # Special Case: If shot_place column is not na, and event_type column is equal to 'Foul', then drop those rows from the dataframe
        self.logger.log_info("Handling special cases in the dataframe.")
        data = data[(data["shot_place"].isna()) | (data["event_type"] != "Foul")]

        # Remove rows with minor events from 'event_type' column
        if self.minor_events is not None:
            self.logger.log_info("Removing rows with minor events from the 'event_type' column.")
            data = data[~data["event_type"].isin(self.minor_events)]

        self.processed_data = data

    @time_this_function
    def generate_prompt_for_game_id(self, game_id: str) -> str:
        game_data = self.processed_data[self.processed_data["id_odsp"] == game_id].sort_values("time")

        first_row = game_data.iloc[0]

        context_str = f"It is a football match in the {first_row['season']} season of the first division league of {first_row['country']}. "
        context_str += f"The match is played in the home turf of {first_row['ht']} on {first_row['date']}, between home team {first_row['ht']} and away team {first_row['at']}."
        self.logger.log_debug(f"Generated context string: {context_str}")

        game_events = [generate_event_string(row) for _, row in game_data.iterrows()]
        event_str = " ".join(game_events)
        self.logger.log_debug(f"Generated event string: {event_str}")

        result_str = f"The final result of the game is {first_row['ftag']} goals for {first_row['at']} vs {first_row['fthg']} goals for {first_row['ht']}. "
        result_str += (
            f"The winner is the away team {first_row['at']}."
            if first_row["fthg"] < first_row["ftag"]
            else (
                f"The winner is the home team {first_row['ht']}."
                if first_row["fthg"] > first_row["ftag"]
                else "The match ended in a draw."
            )
        )
        self.logger.log_debug(f"Generated result string: {result_str}")

        return " ".join([context_str, result_str, event_str])
