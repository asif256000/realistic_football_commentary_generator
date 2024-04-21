import json
from pathlib import Path

from extract_data import FootballDataHandler
from gpt_api_wrapper import GPTAPIWrapper
from logger import CustomLogger
from utils import get_assistant_prompt, get_generated_summary_json_path

if __name__ == "__main__":
    logger = CustomLogger(logger_name="CommentaryGenerator")
    logger.log_info("The commentary generation process has started.")

    filter_game_ids = [
        "EL5SQLU5/",
        "6LgN5qhA/",
        "SjxW3Gxh/",
        "zXRqAtdp/",
        "z7bjmjQJ/",
        "bBGRJv8C/",
        "Klyke6w5/",
        "2J6xgTqs/",
        "vopOTEEl/",
        "KhAeigSt/",
        "StRC9O3T/",
        "pOrucubg/",
        "G29Np7eA/",
        "zg7F4UWG/",
        "d02MHFlb/",
    ]
    minor_events_to_ignore = ["Offside", "Foul", "Hand Ball", "Yellow card", "Second yellow card"]
    data_handler = FootballDataHandler(
        logger=logger, reqd_game_ids=filter_game_ids, minor_events=minor_events_to_ignore
    )
    gpt_wrapper = GPTAPIWrapper(logger=logger, model="gpt-4-turbo-preview")
    asst_instruction = get_assistant_prompt()
    assistant_id = gpt_wrapper.create_assistant("Soccer Summarizer Bot", asst_instruction)
    retrieved_assistant_id = gpt_wrapper.get_assistant_from_id(assistant_id)
    assert assistant_id == retrieved_assistant_id
    logger.log_info(f"Assistant with id {assistant_id} has been created successfully.")

    game_summaries = dict()
    for game_id in filter_game_ids:
        game_events_prompt = data_handler.generate_prompt_for_game_id(game_id)
        logger.log_info(f"Generated prompt for game with id {game_id}.")

        thread_id = gpt_wrapper.create_assistant_thread(game_events_prompt)
        run_id = gpt_wrapper.create_run_from_thread(thread_id, assistant_id)
        retrieved_run_id = gpt_wrapper.poll_run_till_complete(thread_id, run_id)
        logger.log_info(f"Run with id {retrieved_run_id} has completed execution.")

        messages = gpt_wrapper.list_messages_in_thread(thread_id=thread_id)
        all_messages = [msg.content[0].text.value for msg in messages.data]
        summary = all_messages[0]
        game_summaries[game_id] = summary
        logger.log_info(f"Response from the assistant: {summary}")

        gpt_wrapper.delete_thread_with_id(thread_id)
        logger.log_info(f"Deleted thread with id {thread_id}.")

    gpt_wrapper.delete_assistant_with_id(assistant_id)
    logger.log_info(f"Deleted assistant with id {assistant_id}.")
    logger.log_info("All game summaries have been generated.")

    json_path = get_generated_summary_json_path()
    with open(json_path, "w") as f:
        json.dump(game_summaries, f)
