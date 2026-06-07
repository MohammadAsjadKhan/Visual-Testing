import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Visual Testing AI"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./visual_tester.db")
    
    # Matching thresholds
    IOU_THRESHOLD: float = 0.6  # Below this, a box is considered extra/missing
    DELTA_THRESHOLD_PIXELS: int = 5  # Pixels of tolerance before flagging as misplaced

settings = Settings()