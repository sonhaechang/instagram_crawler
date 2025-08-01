import time
import traceback
import sys

from queue import Queue
from typing import Optional

from instagram_crawling.driver import Driver
from instagram_crawling.extract_instagram import ExtractHander
from instagram_crawling.meta_data import ECTRACT_NUM
from instagram_crawling.utils import (
    instagram_login, 
    search_hashtag,
)


class InstagramCrawler:
	def __init__(self, command_queue: Queue, response_queue: Queue) -> None:
		super().__init__()
		self.driver: Optional[Driver] = None 
		self.extract_handler: Optional[ExtractHander] = None
		self.hashtag: Optional[str] = None
		self.file_name: Optional[int] = None
		self.ectract: int = ECTRACT_NUM
		self.command_queue = command_queue
		self.response_queue = response_queue
		
	def main_process(self) -> None:
		while True:
			msg = self.command_queue.get()

			if msg['channel'] == 'hashtag':
				self.hashtag = msg['data']
				break

		search_hashtag(self.driver.instance, self.hashtag)	
		time.sleep(5)

		# print('\n인스타그램 크롤링(게시글 url 저장 및 해쉬태그 저장)을 시작합니다. \n')

		self.response_queue.put({
			'status': 200, 
			'channel': 'hashtag',
		})

		start_time = time.time()
		file_path = self.extract_handler.collect_all_post_urls(
			self.hashtag, 
			start_time
		)

		if file_path is not None:
			self.extract_handler.collect_all_hashtags(
				self.file_name, 
				self.ectract, 
				start_time, 
				file_path
			)
		
		# print('인스타그램 크롤링(게시글 url 저장 및 해쉬태그 저장)이 완료되었습니다. \n')

	def sub_process(self) -> None:		
		# print('\n인스타그램 크롤링(게시글 url을 이용한 해쉬태그 저장)을 시작합니다. \n')

		while True:
			msg = self.command_queue.get()

			if msg['channel'] == 'fileName':
				self.file_name = msg['data']
				break

		self.response_queue.put({
			'status': 200, 
			'channel': 'fileName',
		})

		start_time = time.time()
		self.extract_handler.collect_all_hashtags(
			self.file_name, 
			self.ectract, 
			start_time
		)
		
		# print('인스타그램 크롤링(해쉬태그 저장)이 완료되었습니다. \n')


	def start(self) -> None:
		"""
		_summary_
		"""

		while True:
			msg = self.command_queue.get()

			if msg['channel'] == 'driverStart' and msg['data'] == True:
				self.driver = instagram_login(self.command_queue, self.response_queue)

				if self.driver is not None:
					break

		self.extract_handler = ExtractHander(
			self.driver.instance,
			self.command_queue,
			self.response_queue
		)
		
		while True:
			try:
				while True:
					msg = self.command_queue.get()

					if msg['channel'] == 'crawlingOption':
						crawling_option = msg['data']
						break

				self.response_queue.put({
					'status': 200, 
					'channel': 'crawlingOption',
				})

				if crawling_option == 0:
					self.driver.instance.quit()
					sys.exit()
				elif crawling_option == 1:
					self.main_process()
				elif crawling_option == 2:
					self.sub_process()
				else:
					self.response_queue.put({
						'status': 400, 
						'channel': 'crawlingOption',
						'data': '선택하신 항목이 유효하지 않습니다.\n 선택하신 항목을 다시 확인해주세요.',
					})
					
			except Exception as e:
				traceback.print_exc()