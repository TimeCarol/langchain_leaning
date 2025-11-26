import os

from dotenv import load_dotenv
from langchain.chat_models import init_chat_model
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage

if __name__ == '__main__':
    load_dotenv()
    llm = init_chat_model(
        model='gemma-3-27b-it',
        model_provider='openai',
        api_key=os.getenv('OPENAI_API_KEY'),
        base_url=os.getenv('OPENAI_BASE_URL'),
    )
    messages = [
        SystemMessage(content='你是一个擅长人工智能相关学科的专家'),
    ]
    while True:
        input_msg = HumanMessage(content=input('INPUT: '))
        messages.append(input_msg)
        print('OUTPUT: ', end='', flush=True)
        ai_message_content = ''
        for chunk in llm.stream(input=messages):
            print(chunk.content, end='', flush=True)
            ai_message_content += chunk.content
        ai_message = AIMessage(content=ai_message_content)
        messages.append(ai_message)
