from sqlalchemy import Column, Integer, String, Float, JSON, DateTime
from datetime import datetime, timezone
from app.core.database import Base

class TestRun(Base):
    __tablename__ = "test_runs"

    id = Column(Integer, primary_key=True, index=True)
    project_name = Column(String, default="Default Project", index=True)
    design_filename = Column(String, nullable=False)
    actual_filename = Column(String, nullable=False)
    
    # Global metrics
    color_diff_score = Column(Float, nullable=False)
    
    # Store the complex array of detected diff boxes as JSON
    # Structure matches our VisionEngine output: [{"status": "...", "box": {...}, "delta_x": ...}]
    diff_boxes = Column(JSON, nullable=False)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))