from langchain.messages import HumanMessage, SystemMessage

if __name__ == '__main__':
    messages = [
        SystemMessage('你是一位乐于助人的智能小助手'),
        HumanMessage('你好, 请介绍一下你自己')
    ]
    print(messages)
