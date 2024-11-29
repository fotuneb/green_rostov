from pydantic import BaseModel

class TrackerInfo(BaseModel):
    task_id: int
    started_at: str
    time_tracked: int
    