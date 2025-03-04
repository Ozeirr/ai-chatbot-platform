"""
Script to fix dimension mismatch between Pinecone index and embeddings.
This will either:
1. Update your config to match the existing index dimension
2. Or recreate the index with your desired dimension (WARNING: this will delete all existing data)
"""

import os
import sys
import argparse
from dotenv import load_dotenv
from pinecone import Pinecone

# Add parent directory to path so we can import from the app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.config import settings
from app.core.vector_store import VectorStore

def get_index_dimension(index_name, api_key, environment):
    """Get the dimension of an existing Pinecone index"""
    pc = Pinecone(api_key=api_key)
    
    try:
        index_info = pc.describe_index(index_name)
        dimension = getattr(index_info, 'dimension', None)
        return dimension
    except Exception as e:
        print(f"Error getting index info: {e}")
        return None

def recreate_index(index_name, api_key, environment, new_dimension):
    """Delete and recreate the index with a new dimension"""
    pc = Pinecone(api_key=api_key)
    
    # Check if index exists
    if index_name in pc.list_indexes().names():
        print(f"Deleting index {index_name}...")
        pc.delete_index(index_name)
        print(f"Index {index_name} deleted.")
    
    # Create a new index with the vector store helper
    # This will use the dimension from settings
    print(f"Creating new index {index_name} with dimension {new_dimension}...")
    vs = VectorStore(index_name)
    print(f"Index {index_name} created with dimension {new_dimension}.")

def update_env_file(dimension):
    """Update the .env file with the correct EMBEDDINGS_DIMENSION"""
    try:
        env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env')
        
        # Read the existing .env file
        if os.path.exists(env_path):
            with open(env_path, 'r') as f:
                lines = f.readlines()
                
            # Check if EMBEDDINGS_DIMENSION already exists
            dimension_exists = False
            for i, line in enumerate(lines):
                if line.startswith('EMBEDDINGS_DIMENSION='):
                    lines[i] = f'EMBEDDINGS_DIMENSION={dimension}\n'
                    dimension_exists = True
                    break
            
            # If it doesn't exist, add it
            if not dimension_exists:
                lines.append(f'EMBEDDINGS_DIMENSION={dimension}\n')
                
            # Write the updated .env file
            with open(env_path, 'w') as f:
                f.writelines(lines)
        else:
            # Create a new .env file
            with open(env_path, 'w') as f:
                f.write(f'EMBEDDINGS_DIMENSION={dimension}\n')
                
        print(f"Updated .env file with EMBEDDINGS_DIMENSION={dimension}")
    except Exception as e:
        print(f"Error updating .env file: {e}")

def main():
    load_dotenv()
    
    parser = argparse.ArgumentParser(description='Fix dimension mismatch between Pinecone and embeddings')
    parser.add_argument('--recreate', action='store_true', help='Recreate the index (WARNING: deletes all data)')
    parser.add_argument('--dimension', type=int, choices=[1024, 1536], help='Desired dimension (1024 or 1536)')
    args = parser.parse_args()
    
    api_key = settings.PINECONE_API_KEY
    index_name = settings.PINECONE_INDEX_NAME
    environment = settings.PINECONE_ENVIRONMENT
    
    # Get current index dimension
    current_dimension = get_index_dimension(index_name, api_key, environment)
    
    if current_dimension is None:
        print(f"Index {index_name} not found. Creating new index...")
        dimension = args.dimension or 1024
        recreate_index(index_name, api_key, environment, dimension)
        update_env_file(dimension)
    else:
        print(f"Current index {index_name} has dimension {current_dimension}")
        
        if args.recreate and args.dimension:
            if args.dimension != current_dimension:
                recreate_index(index_name, api_key, environment, args.dimension)
                update_env_file(args.dimension)
            else:
                print(f"Index already has the requested dimension {args.dimension}.")
        else:
            # No recreation requested, so we'll adapt our code to the existing index
            print(f"Adapting to the existing index dimension: {current_dimension}")
            update_env_file(current_dimension)
            
    print("Done! You can now run your application without dimension mismatch errors.")

if __name__ == "__main__":
    main()
