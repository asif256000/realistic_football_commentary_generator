import logging
from logging.handlers import RotatingFileHandler

# Create a custom logger
logger = logging.getLogger(__name__)


def setup_logger():
    # Set the level of logger
    logger.setLevel(logging.DEBUG)

    # Create handlers
    console_handler = logging.StreamHandler()
    file_handler = RotatingFileHandler("logs/app.log", maxBytes=20000, backupCount=5)

    # Set the level of handlers
    console_handler.setLevel(logging.WARNING)
    file_handler.setLevel(logging.DEBUG)

    # Create formatters and add it to handlers
    console_format = logging.Formatter("%(name)s - %(levelname)s - %(message)s")
    file_format = logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s")
    console_handler.setFormatter(console_format)
    file_handler.setFormatter(file_format)

    # Add handlers to the logger
    logger.addHandler(console_handler)
    logger.addHandler(file_handler)


def log_debug(msg):
    logger.debug(msg)


def log_info(msg):
    logger.info(msg)


def log_warning(msg):
    logger.warning(msg)


def log_error(msg):
    logger.error(msg)


def log_critical(msg):
    logger.critical(msg)
