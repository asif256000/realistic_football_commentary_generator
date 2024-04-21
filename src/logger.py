import logging
from logging.handlers import RotatingFileHandler


class CustomLogger:
    def __init__(self, logger_name: str = __name__, log_file: str = "logs/app.log"):
        # Create a custom logger
        self.logger = logging.getLogger(logger_name)

        # Set the level of logger
        self.logger.setLevel(logging.DEBUG)

        # Create handlers
        self.console_handler = logging.StreamHandler()
        self.file_handler = RotatingFileHandler(log_file, maxBytes=20000, backupCount=5)

        # Set the level of handlers
        self.console_handler.setLevel(logging.WARNING)
        self.file_handler.setLevel(logging.DEBUG)

        # Create formatters and add it to handlers
        self.console_format = logging.Formatter("%(name)s - %(levelname)s - %(message)s")
        self.file_format = logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s")
        self.console_handler.setFormatter(self.console_format)
        self.file_handler.setFormatter(self.file_format)

        # Add handlers to the logger
        self.logger.addHandler(self.console_handler)
        self.logger.addHandler(self.file_handler)

    def log_debug(self, msg):
        self.logger.debug(msg)

    def log_info(self, msg):
        self.logger.info(msg)

    def log_warning(self, msg):
        self.logger.warning(msg)

    def log_error(self, msg):
        self.logger.error(msg)

    def log_critical(self, msg):
        self.logger.critical(msg)
