import os
import time

from dotenv import load_dotenv
from openai import OpenAI

from logger import CustomLogger
from utils import time_this_function


class GPTAPIWrapper:
    def __init__(self, logger: CustomLogger, model: str = "gpt-3.5-turbo"):
        load_dotenv()
        self.logger = logger
        key = os.getenv("OPENAI_API_KEY")
        self.my_client = OpenAI(api_key=key)
        self.model = model
        self.my_assistants = dict()
        self.assistant_runs = dict()

    @time_this_function
    def get_completion(self, prompt: str, temp: float = 0):
        messages = [{"role": "user", "content": prompt}]

        response = self.my_client.chat.completions.create(model=self.model, messages=messages, temperature=temp)

        self.logger.log_debug(response)

        return response.choices[0].message.content

    @time_this_function
    def stream_completion(self, prompt: str, temp: float = 0):
        messages = [{"role": "user", "content": prompt}]

        response = self.my_client.chat.completions.create(
            model=self.model, messages=messages, stream=True, temperature=temp
        )

        self.logger.log_debug(response)

        for resp_chunk in response:
            curr_chunk = resp_chunk.choices[0].delta.content
            if curr_chunk is not None:
                yield curr_chunk

    @time_this_function
    def converse(
        self,
        prompt: str,
        messages: str | list = None,
        max_tokens: int = 3000,
        temperature: int = 0,
        top_p: int = 1,
        frequency_penalty: int = 0,
        presence_penalty: int = 0,
    ):
        if messages is None:
            messages = list()

        messages.append({"role": "user", "content": prompt})

        response = (
            self.my_client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens,
                top_p=top_p,
                frequency_penalty=frequency_penalty,
                presence_penalty=presence_penalty,
            )
            .choices[0]
            .message.content
        )

        messages.append({"role": "assistant", "content": response})

        self.logger.log_debug(response)

        return response, messages

    @time_this_function
    def create_assistant(self, assistant_name: str, instruction: str):
        my_assistant = self.my_client.beta.assistants.create(
            model=self.model, instructions=instruction, name=assistant_name
        )
        self.logger.log_debug(my_assistant)
        self.my_assistants[my_assistant.id] = my_assistant

        return my_assistant.id

    @time_this_function
    def get_assistant_from_id(self, assistant_id: str):
        my_assistant = self.my_client.beta.assistants.retrieve(assistant_id)
        self.logger.log_debug(my_assistant)
        if self.my_assistants.get(assistant_id) != my_assistant:
            self.my_assistants[assistant_id] = my_assistant

        return my_assistant.id

    def delete_assistant_with_id(self, assistant_id: str):
        response = self.my_client.beta.assistants.delete(assistant_id)
        self.logger.log_debug(response)
        if response.deleted:
            self.my_assistants.pop(assistant_id)
            for run_id in list(self.assistant_runs.keys()):
                if self.assistant_runs[run_id].assistant_id == assistant_id:
                    self.assistant_runs.pop(run_id)

        return response.deleted

    @time_this_function
    def create_assistant_thread(self, user_msg: str):
        thread = self.my_client.beta.threads.create(messages=[{"role": "user", "content": user_msg}])
        self.logger.log_debug(thread)

        return thread.id

    @time_this_function
    def delete_thread_with_id(self, thread_id: str):
        response = self.my_client.beta.threads.delete(thread_id)
        self.logger.log_debug(response)
        if response.deleted:
            for run_id in list(self.assistant_runs.keys()):
                if self.assistant_runs[run_id].thread_id == thread_id:
                    self.assistant_runs.pop(run_id)

        return response.deleted

    @time_this_function
    def create_run_from_thread(self, thread_id: str, assistant_id: str):
        run = self.my_client.beta.threads.runs.create(thread_id=thread_id, assistant_id=assistant_id)
        self.logger.log_debug(run)
        self.assistant_runs[run.id] = run

        return run.id

    @time_this_function
    def poll_run_till_complete(self, thread_id: str, run_id: str):
        while True:
            run = self.my_client.beta.threads.runs.retrieve(thread_id=thread_id, run_id=run_id)

            if run.status not in ["queued", "in_progress", "requires_action", "cancelling"]:
                self.logger.log_debug(run)
                return run.id

            time.sleep(1)

    @time_this_function
    def list_messages_in_thread(self, thread_id: str):
        messages = self.my_client.beta.threads.messages.list(thread_id=thread_id)
        self.logger.log_debug(messages)

        return messages
