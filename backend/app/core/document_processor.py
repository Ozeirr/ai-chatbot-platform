from typing import List, Dict, Any
from langchain.text_splitter import RecursiveCharacterTextSplitter

class DocumentProcessor:
    def __init__(self, chunk_size=1000, chunk_overlap=200):
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            length_function=len,
        )
    
    def process_crawled_data(self, crawled_data: List[Dict]) -> List[Dict]:
        """
        Process crawled website data into chunks suitable for embedding.
        """
        processed_chunks = []
        
        for page in crawled_data:
            chunks = self.text_splitter.split_text(page["content"])
            
            for i, chunk in enumerate(chunks):
                processed_chunks.append({
                    "content": chunk,
                    "title": page["title"],
                    "url": page["url"],
                    "chunk_id": f"{page['url']}_{i}",
                    "metadata": {
                        "source": page["url"],
                        "title": page["title"],
                        "chunk": i
                    }
                })
                
        return processed_chunks
    
    def process_document(self, document: Dict, client_id: str) -> List[Dict]:
        """
        Process a single document into chunks suitable for embedding.
        """
        chunks = self.text_splitter.split_text(document["content"])
        processed_chunks = []
        
        for i, chunk in enumerate(chunks):
            processed_chunks.append({
                "content": chunk,
                "title": document["title"],
                "url": document.get("url", ""),
                "chunk_id": f"{document['id']}_{i}",
                "client_id": client_id,
                "metadata": {
                    "source": document.get("url", document["id"]),
                    "title": document["title"],
                    "document_id": document["id"],
                    "client_id": client_id,
                    "chunk": i
                }
            })
            
        return processed_chunks
    
    def process_file(self, file_content: str, file_name: str, client_id: str) -> List[Dict]:
        """
        Process a file into chunks suitable for embedding.
        """
        chunks = self.text_splitter.split_text(file_content)
        processed_chunks = []
        
        for i, chunk in enumerate(chunks):
            processed_chunks.append({
                "content": chunk,
                "title": file_name,
                "chunk_id": f"{file_name}_{i}",
                "client_id": client_id,
                "metadata": {
                    "source": file_name,
                    "title": file_name,
                    "client_id": client_id,
                    "chunk": i
                }
            })
            
        return processed_chunks
