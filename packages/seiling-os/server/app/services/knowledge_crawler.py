"""Knowledge crawler service for Sei docs"""

import json
import re
import uuid
from typing import Any

import httpx
from bs4 import BeautifulSoup
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.knowledge import KnowledgeChunk, KnowledgeSource

# Sei docs base URL
SEI_DOCS_BASE = "https://docs.sei.io"


class KnowledgeCrawlerService:
    """Service for crawling Sei documentation"""

    def __init__(self, session: AsyncSession):
        self.session = session
        self.client = httpx.AsyncClient(timeout=30.0)

    async def crawl_sei_docs(
        self, url: str, max_pages: int = 10
    ) -> tuple[bool, dict[str, Any]]:
        """
        Crawl Sei documentation starting from a URL.

        Args:
            url: Starting URL (should be docs.sei.io)
            max_pages: Maximum number of pages to crawl

        Returns:
            Tuple of (success, result_dict)
        """
        try:
            if not url.startswith("https://docs.sei.io"):
                return False, {"error": "Only Sei docs URLs are supported"}

            # Create or get source
            source = await self._get_or_create_source(url)
            if not source:
                return False, {"error": "Failed to create source"}

            # Crawl pages
            crawled_urls = set()
            urls_to_crawl = [url]
            chunks_created = 0

            while urls_to_crawl and len(crawled_urls) < max_pages:
                current_url = urls_to_crawl.pop(0)
                if current_url in crawled_urls:
                    continue

                crawled_urls.add(current_url)

                # Fetch page
                try:
                    response = await self.client.get(current_url)
                    response.raise_for_status()
                    html = response.text
                except Exception as e:
                    continue  # Skip failed pages

                # Parse and extract content
                chunks = await self._extract_chunks(html, current_url, source.id)
                chunks_created += len(chunks)

                # Find links to other docs pages
                new_urls = await self._extract_doc_links(html)
                for new_url in new_urls:
                    if (
                        new_url.startswith("https://docs.sei.io")
                        and new_url not in crawled_urls
                        and new_url not in urls_to_crawl
                    ):
                        urls_to_crawl.append(new_url)

            await self.session.commit()

            return True, {
                "message": f"Crawled {len(crawled_urls)} pages, created {chunks_created} chunks",
                "source_id": source.id,
                "pages_crawled": len(crawled_urls),
                "chunks_created": chunks_created,
            }
        except Exception as e:
            await self.session.rollback()
            return False, {"error": f"Error crawling: {str(e)}"}

    async def _get_or_create_source(self, url: str) -> KnowledgeSource | None:
        """Get or create a knowledge source"""
        from sqlalchemy import select

        result = await self.session.execute(
            select(KnowledgeSource).where(KnowledgeSource.url == url)
        )
        source = result.scalar_one_or_none()

        if source:
            return source

        # Create new source
        source = KnowledgeSource(
            id=f"src_{uuid.uuid4().hex[:12]}",
            title=url.split("/")[-1] or "Sei Docs",
            url=url,
            source_type="website",
        )
        self.session.add(source)
        await self.session.flush()
        return source

    async def _extract_chunks(
        self, html: str, url: str, source_id: str
    ) -> list[KnowledgeChunk]:
        """Extract text chunks from HTML"""
        soup = BeautifulSoup(html, "html.parser")

        # Remove script and style elements
        for script in soup(["script", "style", "nav", "footer"]):
            script.decompose()

        # Get main content
        main_content = soup.find("main") or soup.find("article") or soup.body

        if not main_content:
            return []

        text = main_content.get_text()
        # Clean up text
        text = re.sub(r"\s+", " ", text).strip()

        # Split into chunks (roughly 500 chars each)
        chunk_size = 500
        chunks = []
        for i in range(0, len(text), chunk_size):
            chunk_text = text[i : i + chunk_size].strip()
            if len(chunk_text) < 100:  # Skip very short chunks
                continue

            chunk = KnowledgeChunk(
                id=f"chunk_{uuid.uuid4().hex[:12]}",
                source_id=source_id,
                content=chunk_text,
                metadata_json=json.dumps({"url": url, "chunk_index": i // chunk_size}),
            )
            self.session.add(chunk)
            chunks.append(chunk)

        await self.session.flush()
        return chunks

    async def _extract_doc_links(self, html: str) -> list[str]:
        """Extract documentation links from HTML"""
        soup = BeautifulSoup(html, "html.parser")
        links = []

        for a in soup.find_all("a", href=True):
            href = a["href"]
            if href.startswith("http"):
                links.append(href)
            elif href.startswith("/"):
                links.append(f"{SEI_DOCS_BASE}{href}")

        return links

    async def close(self):
        """Close HTTP client"""
        await self.client.aclose()

