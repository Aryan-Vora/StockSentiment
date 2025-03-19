from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class Stock(BaseModel):
    symbol: str
    name: str
    price: Optional[float] = None
    posts: List[str] = []  # related post IDs


class Post(BaseModel):
    id: str
    title: str
    content: str
    created_at: datetime
    stocks: List[dict]  # [{"symbol": "AAPL", "score": 9}]
