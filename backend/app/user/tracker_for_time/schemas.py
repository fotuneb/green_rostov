from pydantic import BaseModel

class TrackerInfo(BaseModel):
    task: int
    track_date: str
    track_amount: int
    