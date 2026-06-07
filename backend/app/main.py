from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.encoders import jsonable_encoder  # 💡 Added to sanitize NumPy objects
from sqlalchemy.orm import Session
from typing import List
import traceback  # 💡 Added for deep error debugging

from app.core.config import settings
from app.core.database import Base, engine, get_db
from app.models.test_run import TestRun
from app.services.vision_engine import VisionEngine
from app.schemas.test_run import TestRunResponse

# Create database tables automatically (for Codespaces local dev development)
Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.PROJECT_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/v1/analyze", response_model=TestRunResponse)
async def analyze_images(
    project_name: str = "Percy Clone Test",
    design_file: UploadFile = File(...),
    actual_file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    if not design_file.filename.lower().endswith(('.png', '.jpg', '.jpeg')):
        raise HTTPException(status_code=400, detail="Invalid design image format.")
    if not actual_file.filename.lower().endswith(('.png', '.jpg', '.jpeg')):
        raise HTTPException(status_code=400, detail="Invalid actual screenshot format.")
        
    try:
        design_bytes = await design_file.read()
        actual_bytes = await actual_file.read()
        
        # Run core OpenCV calculations
        analysis = VisionEngine.analyze_differences(
            design_bytes=design_bytes,
            actual_bytes=actual_bytes,
            iou_thresh=settings.IOU_THRESHOLD,
            delta_thresh=settings.DELTA_THRESHOLD_PIXELS
        )
        
        # 💡 FIX: Convert all raw NumPy integers/floats down to standard serializable Python values
        clean_diff_boxes = jsonable_encoder(analysis["diff_boxes"])
        clean_color_score = float(analysis["color_diff_score"])
        
        # Commit record directly to SQLite
        db_run = TestRun(
            project_name=project_name,
            design_filename=design_file.filename,
            actual_filename=actual_file.filename,
            color_diff_score=clean_color_score,
            diff_boxes=clean_diff_boxes
        )
        db.add(db_run)
        db.commit()
        db.refresh(db_run)
        
        return db_run
        
    except Exception as e:
        # 💡 Print the full stack trace to your terminal logs so you see exactly what failed
        print("--- ENGINE PIPELINE CRASH TRACEBACK ---")
        traceback.print_exc()
        print("---------------------------------------")
        raise HTTPException(status_code=500, detail=f"Database or Engine failure: {str(e)}")

# Optional fetch endpoint for dashboard history
@app.get("/api/v1/history", response_model=List[TestRunResponse])
def get_test_history(db: Session = Depends(get_db)):
    return db.query(TestRun).order_by(TestRun.id.desc()).all()