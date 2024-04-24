from unittest.mock import MagicMock

import pytest

from src.gpt_api_wrapper import GPTAPIWrapper


class TestGPTAPIWrapper:
    @pytest.fixture(autouse=True)
    def setup(self):
        self.logger = MagicMock()
        self.gpt_wrapper = GPTAPIWrapper(logger=self.logger)

    def test_converse(self):
        prompt = "Hello, how are you?"
        response, messages = self.gpt_wrapper.converse(prompt)
        assert isinstance(response, str)
        assert isinstance(messages, list)

    def test_create_assistant(self):
        assistant_name = "Test Assistant"
        instruction = "This is a test instruction."
        assistant_id = self.gpt_wrapper.create_assistant(assistant_name, instruction)
        assert isinstance(assistant_id, str)

    def test_get_assistant_from_id(self):
        assistant_id = "test_assistant_id"
        retrieved_assistant_id = self.gpt_wrapper.get_assistant_from_id(assistant_id)
        assert assistant_id == retrieved_assistant_id
