from fastapi import APIRouter, HTTPException
from db import stocks_collection, posts_collection
from models import Stock, Post
from bson import ObjectId
from datetime import datetime

router = APIRouter()


# Create a new post
@router.post("/posts/")
async def create_post(post: Post):
    post_dict = post.model_dump()
    post_dict["_id"] = post_dict["id"]
    post_dict["created_at"] = datetime.utcnow()
    del post_dict["id"]

    posts_collection.insert_one(post_dict)

    # Update related stocks
    for stock in post.stocks:
        stocks_collection.update_one(
            {"_id": stock["symbol"]},
            {"$addToSet": {"posts": post_dict["_id"]}},
            upsert=True
        )

    return {"message": "Post added", "post_id": post_dict["_id"]}


# Fetch all posts
@router.get("/posts/")
async def get_posts():
    posts = list(posts_collection.find({}, {"_id": 0}))
    return posts


# Fetch a stock and related posts
@router.get("/stocks/{symbol}")
async def get_stock(symbol: str):
    stock = stocks_collection.find_one({"_id": symbol})
    if not stock:
        raise HTTPException(status_code=404, detail="Stock not found")

    posts = list(posts_collection.find(
        {"_id": {"$in": stock.get("posts", [])}}, {"_id": 0}))
    stock["posts"] = posts
    return stock
