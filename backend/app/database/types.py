from typing import Any, Optional, TypeVar, cast

from pydantic import HttpUrl
from sqlalchemy.dialects.postgresql import VARCHAR
from sqlalchemy.types import TypeDecorator

T = TypeVar("T")


class HttpUrlType(TypeDecorator):
    """SQLAlchemy type for Pydantic HttpUrl."""
    
    impl = VARCHAR
    cache_ok = True

    def process_bind_param(self, value: Optional[HttpUrl], dialect: Any) -> Optional[str]:
        """Convert HttpUrl to string when storing in database."""
        if value is None:
            return None
        return str(value)

    def process_result_value(self, value: Optional[str], dialect: Any) -> Optional[HttpUrl]:
        """Convert string to HttpUrl when retrieving from database."""
        if value is None:
            return None
        return cast(HttpUrl, value)
