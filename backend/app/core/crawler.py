import requests
from bs4 import BeautifulSoup
import re
from urllib.parse import urljoin, urlparse
from typing import List, Dict, Set, Optional

from app.config import settings

class WebCrawler:
    def __init__(self, base_url: str, max_pages: int = None):
        self.base_url = base_url
        self.max_pages = max_pages or settings.MAX_PAGES_PER_CRAWL
        self.visited_urls: Set[str] = set()
        self.domain = urlparse(base_url).netloc
        
    def is_valid_url(self, url: str) -> bool:
        """Check if URL is valid and belongs to the same domain."""
        parsed = urlparse(url)
        return bool(parsed.netloc) and parsed.netloc == self.domain
    
    def extract_text(self, html: str) -> str:
        """Extract clean text from HTML content."""
        soup = BeautifulSoup(html, 'html.parser')
        
        # Remove script and style elements
        for script in soup(["script", "style"]):
            script.extract()
        
        # Get text
        text = soup.get_text()
        
        # Break into lines and remove leading and trailing space
        lines = (line.strip() for line in text.splitlines())
        # Break multi-headlines into a line each
        chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
        # Remove blank lines
        text = '\n'.join(chunk for chunk in chunks if chunk)
        
        return text
    
    def extract_title(self, html: str) -> str:
        """Extract page title from HTML."""
        soup = BeautifulSoup(html, 'html.parser')
        title_tag = soup.find('title')
        if title_tag:
            return title_tag.text.strip()
        return "Untitled Page"
        
    def get_links(self, html: str, current_url: str) -> List[str]:
        """Extract all links from the page."""
        soup = BeautifulSoup(html, 'html.parser')
        links = []
        
        for link in soup.find_all('a', href=True):
            url = link['href']
            # Convert relative URLs to absolute
            absolute_url = urljoin(current_url, url)
            
            # Skip URLs with fragments or queries
            if '#' in absolute_url or '?' in absolute_url:
                continue
                
            if self.is_valid_url(absolute_url) and absolute_url not in self.visited_urls:
                links.append(absolute_url)
                
        return links
    
    def crawl(self) -> List[Dict]:
        """
        Crawl the website starting from base_url.
        Returns a list of dictionaries with page content.
        """
        to_visit = [self.base_url]
        results = []
        
        while to_visit and len(self.visited_urls) < self.max_pages:
            current_url = to_visit.pop(0)
            
            if current_url in self.visited_urls:
                continue
                
            try:
                print(f"Crawling: {current_url}")
                response = requests.get(
                    current_url, 
                    timeout=10,
                    headers={
                        'User-Agent': 'AI Chatbot Crawler (+https://github.com/your-repo/ai-chatbot-platform)'
                    }
                )
                if response.status_code != 200:
                    print(f"Failed to crawl {current_url}: Status code {response.status_code}")
                    continue
                    
                self.visited_urls.add(current_url)
                html = response.text
                
                # Extract content
                text = self.extract_text(html)
                title = self.extract_title(html)
                
                if len(text) > 100:  # Only include pages with substantial content
                    results.append({
                        "url": current_url,
                        "title": title,
                        "content": text
                    })
                
                # Find new links
                links = self.get_links(html, current_url)
                to_visit.extend(links)
                
            except Exception as e:
                print(f"Error crawling {current_url}: {e}")
                
        return results
