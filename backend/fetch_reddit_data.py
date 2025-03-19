import praw
from dotenv import load_dotenv
import os
load_dotenv()
app_id = os.getenv("REDDIT_CLIENT_ID")
client_secret = os.getenv("REDDIT_CLIENT_SECRET")
reddit = praw.Reddit(
    client_id=app_id,
    client_secret=client_secret,
    user_agent="android:" + app_id + ":v1.0 (by u/K6av6ai82j0zo8HB721)"
)

subreddit = reddit.subreddit("stocks")
print(subreddit.title)
for submission in subreddit.hot(limit=1):
    print(submission.title)
    print(submission.score)
    submission.comments.replace_more(limit=None)
    for comment in submission.comments.list():
        print(comment.body)
    print(submission.id)
    print(submission.url)
