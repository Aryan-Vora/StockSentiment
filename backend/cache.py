import time
from dataclasses import dataclass
from typing import Generic, TypeVar


T = TypeVar("T")


@dataclass
class CacheEntry(Generic[T]):
    value: T
    expires_at: float


class TTLCache(Generic[T]):
    def __init__(self, ttl_seconds: int):
        self.ttl_seconds = ttl_seconds
        self._items: dict[str, CacheEntry[T]] = {}

    def get(self, key: str) -> T | None:
        entry = self._items.get(key)
        if not entry:
            return None
        if entry.expires_at < time.time():
            self._items.pop(key, None)
            return None
        return entry.value

    def set(self, key: str, value: T) -> T:
        self._items[key] = CacheEntry(
            value=value,
            expires_at=time.time() + self.ttl_seconds,
        )
        return value

    def clear(self) -> None:
        self._items.clear()
