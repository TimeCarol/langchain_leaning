import datetime

import requests
from langchain.agents import create_agent
from langchain.tools import tool
from langchain_qwq import ChatQwen


@tool
def get_public_ip_addr() -> str:
    """
    获取用户公网ip
    :return: 当前用户的公网ip地址, 例如 232.9.1.23, 失败时返回 Error:
    """
    try:
        return requests.get(
            url='https://60s.viki.moe/v2/ip',
            headers={'Accept': 'application/json'},
        ).json().get('data').get('ip')
    except Exception as e:
        return f'Error: {e}'


@tool
def get_news(query_date: str = None) -> str:
    """
    获取指定日期的新闻
    :param query_date: 需要查询的日期, 可以为空, 为空时默认当天, 格式: 2025-03-01
    :return: 查询的日期的新闻, 多条新闻每一行使用换行符分隔, 失败时返回 Error:
    """
    try:
        return '\n'.join(requests.get(
            url='https://60s.viki.moe/v2/60s',
            params={'date': query_date},
            headers={'Accept': 'application/json'},
        ).json().get('data').get('news'))
    except Exception as e:
        return f'Error: {e}'


@tool
def get_current_time() -> str:
    """
    获取当前时间
    :return: 当前时间, 格式: 2025-09-01 23:09:23
    """
    return datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')


if __name__ == '__main__':
    QWEN3_BASE_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1'
    QWEN3_API_KEY = 'sk-561d7bff63754fef906421fa4dd7218b'
    llm = ChatQwen(
        model='qwen3-max',
        enable_thinking=False,
        base_url=QWEN3_BASE_URL,
        api_key=QWEN3_API_KEY,
    )
    agent = create_agent(
        model=llm,
        tools=[get_public_ip_addr, get_news, get_current_time],
        system_prompt="""你是一个乐于助人的人工智能助手
        规则:
        - 当用户提及时间相关问题时, 需要使用 `get_current_time` 工具来确认当前时间
        - 当用户提及公网ip地址时使用 `get_public_ip_addr` 工具来获取ip
        - 当用户提及新闻时使用 `get_news` 工具获取新闻
        - 当用户提及 今年、本月、上月、去年 类似这种相对时间时需要先调用 `get_current_time` 工具确认当前时间再推断出准确的时间
        """,
    )
    for chunk in agent.stream(
            {'messages': [{'role': 'human', 'content': '我目前的公网ip地址是多少?'}]},
            stream_mode='values'
    ):
        chunk['messages'][-1].pretty_print()
    for chunk in agent.stream(
            {'messages': [{'role': 'human', 'content': '现在时间是多少?'}]},
            stream_mode='values'
    ):
        chunk['messages'][-1].pretty_print()
    for chunk in agent.stream(
            {'messages': [{'role': 'human', 'content': '今年11月25日的新闻有哪些?'}]},
            stream_mode='values'
    ):
        chunk['messages'][-1].pretty_print()
