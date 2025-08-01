import os

from queue import Queue

from instagram_crawling.instagram_crawler import InstagramCrawler
from instagram_crawling.socket_handler import SocketHandler
from instagram_crawling.meta_data import (
	BASE_PROFILE_DIR,
	BASE_DRIVER_DIR,
	BLACK_LIST_DIR,
	CRAWLING_RESULT_DIR,
)
from instagram_crawling.utils import create_json_file_if_not_exists


def main():
	for path in [BASE_PROFILE_DIR, BASE_DRIVER_DIR, BLACK_LIST_DIR, CRAWLING_RESULT_DIR]:
		os.makedirs(path, exist_ok=True)

	create_json_file_if_not_exists(BLACK_LIST_DIR)

	command_queue = Queue()
	response_queue = Queue()

	socket_handler = SocketHandler(command_queue, response_queue)
	socket_handler.start()
		
	crawler = InstagramCrawler(command_queue, response_queue)
	crawler.start()

if __name__ == '__main__': 
	main()