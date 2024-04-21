import time
from pathlib import Path

import pandas as pd


def time_this_function(func):
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        res = func(*args, **kwargs)
        end = time.perf_counter()
        print(f"Function `{func.__name__}` took {end - start:.3f} seconds to run.")
        return res

    return wrapper


def get_assistant_prompt() -> str:
    ASSISTANT_INSTRUCTION = (
        "You are a football commentator bot in the 5 major leagues in Europe, who summarizes the major events "
        "of a game. You are given the contexts for the game, as well as the final results of the game. Use the context and search the "
        "latest data available to set up the environment, then summarize the game, and finally explain the result. While "
        "summarizing the game, you should mention the major events that had impacted the game. If you find the stadium names, "
        "or the shirt number of the players, you should also include those in your summary. Try to keep the commentary "
        "interesting and engaging for the audience while maintaining a 5 minute spoken length for the commentary. "
    )

    return ASSISTANT_INSTRUCTION


def get_data_path() -> Path:
    return Path("resources", "data")


def get_generated_summary_json_path() -> Path:
    return Path("resources", "generated_summaries.json")


def generate_event_string(row: pd.Series) -> str:
    event_str = f"On minute {row['time']},"
    event_str += (
        f" the game is being played on {row['location']} in the field, and"
        if not pd.isna(row["location"]) or row["location"] != "Not recorded"
        else ""
    )
    event_str += f" {row['event_type']} happens" + (
        f" accompanied with {row['event_type2']}." if not pd.isna(row["event_type2"]) else "."
    )
    if row["is_goal"] == 1:
        event_str += f" This resulted in a goal for {row['event_team']}"
        event_str += (
            f", which was accompanied by an assist via {row['assist_method']}."
            if not pd.isna(row["assist_method"]) or row["assist_method"] != "None"
            else "."
        )

    if row["event_type"] != "Substitution":
        event_str += f" The primary player involved in the event was {row['player']}" + (
            f" who used his {row['bodypart']} for the shot" if not pd.isna(row["bodypart"]) else ""
        )
        event_str += (
            f" with the secondary player involved being {row['player2']}." if not pd.isna(row["player2"]) else "."
        )
    else:
        event_str += f" The player {row['player_out']} is substituted" + (
            f" by {row['player_in']}." if not pd.isna(row["player_in"]) else "."
        )
    if not pd.isna(row["shot_place"]):
        if row["shot_outcome"] == "Hit the bar":
            event_str += " The shot had hit the bar."
        elif row["shot_outcome"] == "Blocked":
            event_str += " The shot was blocked by the opponent team."
        elif row["shot_outcome"] == "On target":
            event_str += f" The shot was on target and was placed at the {row['shot_place']} of the goal."
        else:
            event_str += f" The shot was off target and was flying {row['shot_place']}."

    return event_str
