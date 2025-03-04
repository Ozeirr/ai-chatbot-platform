from typing import List, Dict, Any, Optional
from langchain.llms import OpenAI
from langchain.chat_models import ChatOpenAI
from langchain.chains import ConversationalRetrievalChain
from langchain.memory import ConversationBufferMemory
from langchain.prompts import PromptTemplate
from langchain_pinecone import PineconeVectorStore

from app.config import settings
from app.core.vector_store import VectorStore

class ChatbotEngine:
    def __init__(self, vector_store: VectorStore):
        self.vector_store = vector_store
        self.llm = ChatOpenAI(
            temperature=0.7,
            model_name="gpt-3.5-turbo",
            openai_api_key=settings.OPENAI_API_KEY
        )
        
    def create_prompt_template(self, client_info: Dict[str, Any]) -> PromptTemplate:
        """Create a custom prompt template for this client."""
        template = f"""You are a helpful AI assistant for {client_info['name']}.
        
        Use the following pieces of context to answer the question at the end.
        If you don't know the answer, just say that you don't know, don't try to make up an answer.
        
        Context:
        {{context}}
        
        Current conversation:
        {{chat_history}}
        
        Question: {{question}}
        
        Helpful Answer:"""
        
        return PromptTemplate(
            input_variables=["context", "chat_history", "question"],
            template=template
        )
    
    def get_retrieval_chain(self, client_id: str, client_info: Dict[str, Any], session_id: str):
        """Create a retrieval chain for the client."""
        # Get vector store for this client
        retriever = PineconeVectorStore.from_existing_index(
            index_name=self.vector_store.index_name,
            embedding=self.vector_store.embeddings,
            namespace=client_id
        ).as_retriever(search_kwargs={"k": 5})
        
        # Set up memory for this conversation
        memory = ConversationBufferMemory(
            memory_key="chat_history",
            return_messages=True
        )
        
        # Create custom prompt
        prompt = self.create_prompt_template(client_info)
        
        # Create chain
        chain = ConversationalRetrievalChain.from_llm(
            llm=self.llm,
            retriever=retriever,
            memory=memory,
            combine_docs_chain_kwargs={"prompt": prompt}
        )
        
        return chain
    
    def get_response(self, 
                    query: str, 
                    client_id: str, 
                    client_info: Dict[str, Any], 
                    session_id: str) -> str:
        """Get response for user query."""
        try:
            chain = self.get_retrieval_chain(client_id, client_info, session_id)
            response = chain({"question": query})
            return response["answer"]
        except Exception as e:
            print(f"Error generating response: {e}")
            return "I'm sorry, I encountered an error processing your request. Please try again later."
