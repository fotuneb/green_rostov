from pydantic import BaseModel

class TrackerInfo(BaseModel):
    task_id: int
    track_date: str
    track_amount: int
    