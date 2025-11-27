# -*- coding: utf-8 -*-
import os

from dotenv import dotenv_values


def double_check_env(file_path: str):
    """打印 .env 文件中的环境变量"""
    if not os.path.exists(file_path):
        print(f'无法找到文件 {file_path}')
        return
    parsed = dotenv_values(file_path)
    for key in parsed.keys():
        current = os.getenv(key)
        if current is not None:
            print(f'{key}={current}')
        else:
            print(f'{key}=<not set>')
