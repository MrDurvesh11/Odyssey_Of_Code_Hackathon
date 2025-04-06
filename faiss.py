import os
import json
import streamlit as st
from langchain.chains import RetrievalQA
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_community.llms import HuggingFaceEndpoint
from langchain_core.prompts import PromptTemplate

# Paths
DATA_PATH = "data/memory.json"
DB_FAISS_PATH = "vectorstore/db_faiss"

# Load vectorstore
@st.cache_resource
def get_vectorstore():
    embedding_model = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
    return FAISS.load_local(DB_FAISS_PATH, embedding_model, allow_dangerous_deserialization=True)

# Load LLM
HF_TOKEN = os.environ.get("HF_TOKEN")
HUGGING_FACE_REPO_ID = "mistralai/Mistral-7B-Instruct-v0.3"

def load_llm():
    return HuggingFaceEndpoint(
        repo_id=HUGGING_FACE_REPO_ID,
        temperature=0.5,
        huggingfacehub_api_token=HF_TOKEN,
        model_kwargs={"max_length": 512}
    )

# Define custom prompt template
CUSTOM_PROMPT_TEMPLATE = """
Use the provided context to answer the user's question.
If you don't know the answer, say so.
Do not provide information outside the context.

Context: {context}
Question: {question}

Start the answer directly. No small talk.
"""

def set_custom_prompt():
    return PromptTemplate(template=CUSTOM_PROMPT_TEMPLATE, input_variables=["context", "question"])

# Initialize Streamlit app
def main():
    st.title("Chat with MemoryBot")

    # Initialize chat history
    if 'messages' not in st.session_state:
        st.session_state.messages = []

    # Display existing chat history
    for message in st.session_state.messages:
        st.chat_message(message['role']).markdown(message['content'])

    # Get user input
    prompt = st.chat_input("Ask me a question...")

    if prompt:
        st.session_state.messages.append({'role': 'user', 'content': prompt})
        st.chat_message("user").markdown(prompt)

        try:
            vectorstore = get_vectorstore()
            qa_chain = RetrievalQA.from_chain_type(
                llm=load_llm(),
                chain_type="stuff",
                retriever=vectorstore.as_retriever(search_kwargs={'k': 3}),
                return_source_documents=True,
                chain_type_kwargs={'prompt': set_custom_prompt()}
            )

            response = qa_chain.invoke({'query': prompt})

            # Extract result and source documents
            result = response['result']
            source_docs = response['source_documents']
            formatted_sources = "\n".join(
                [f"- Page {doc.metadata.get('page', 'N/A')} from {doc.metadata.get('source', 'Unknown Source')}" for doc in source_docs]
            )

            response_text = f"*Response:\n{result}\n\nSources:*\n{formatted_sources if formatted_sources else 'No relevant documents found.'}"

            st.session_state.messages.append({'role': 'assistant', 'content': response_text})
            st.chat_message("assistant").markdown(response_text)

        except Exception as e:
            st.error(f"Error: {e}")

if _name_ == "_main_":
    main()