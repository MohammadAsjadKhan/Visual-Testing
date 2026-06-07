from pydantic import BaseModel
from typing import List, Dict, Any
from datetime import datetime

class BoxDetail(BaseModel):
    x: int
    y: int
    w: int
    h: int

class DiffBoxSchema(BaseModel):
    status: str  # "misplaced", "missing", or "extra"
    box: BoxDetail
    delta_x: int
    delta_y: int

class TestRunCreate(BaseModel):
    project_name: str
    design_filename: str
    actual_filename: str
    color_diff_score: float
    diff_boxes: List[DiffBoxSchema]

class TestRunResponse(BaseModel):
    id: int
    project_name: str
    design_filename: str
    actual_filename: str
    color_diff_score: float
    diff_boxes: List[DiffBoxSchema]
    created_at: datetime

    class Config:
        from_attributes = True