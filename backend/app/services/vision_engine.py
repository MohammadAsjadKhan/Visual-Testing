import cv2
import numpy as np
from typing import List, Dict, Any, Tuple

class VisionEngine:
    @staticmethod
    def preprocess_and_get_boxes(image_bytes: bytes, target_size: Tuple[int, int] = (1920, 1080)) -> Tuple[np.ndarray, List[Dict[str, int]]]:
        """
        Safely decodes, normalizes, and filters out fine text/noise using 
        morphological processing to focus solely on main structural layouts.
        """
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            img = cv2.imdecode(nparr, cv2.IMREAD_UNCHANGED)
            if img is not None and img.shape[2] == 4:
                img = cv2.cvtColor(img, cv2.COLOR_BGRA2BGR)
            else:
                raise ValueError("OpenCV failed to decode image frame.")
        
        img_resized = cv2.resize(img, target_size)
        
        # 1. Heavily blur to bleed text details together and mask small text strokes
        gray = cv2.cvtColor(img_resized, cv2.COLOR_BGR2GRAY)
        blurred = cv2.GaussianBlur(gray, (9, 9), 0)
        
        # 2. Extract boundaries via Canny edge detection
        edged = cv2.Canny(blurred, 50, 150)
        
        # 3. Morphological Closing: Blends horizontal character breaks into structural blocks
        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (25, 8))
        closed = cv2.morphologyEx(edged, cv2.MORPH_CLOSE, kernel)
        
        # 4. Extract finalized parent blocks
        contours, _ = cv2.findContours(closed, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        boxes = []
        for cnt in contours:
            x, y, w, h = cv2.boundingRect(cnt)
            
            # Strict Filtering Metrics:
            # - Must be wider than 30px and taller than 25px (ignores tiny icons / solo strings)
            # - Ignore overly flat/long thin strips that usually signify stray lines or underline text artifacts
            if w > 30 and h > 25:
                # Filter out lines that look like text baseline noise
                if h < 8 and w > 200:
                    continue
                boxes.append({"x": int(x), "y": int(y), "w": int(w), "h": int(h)})
                
        return img_resized, boxes

    @staticmethod
    def calculate_iou(box1: Dict[str, int], box2: Dict[str, int]) -> float:
        x1 = max(box1["x"], box2["x"])
        y1 = max(box1["y"], box2["y"])
        x2 = min(box1["x"] + box1["w"], box2["x"] + box2["w"])
        y2 = min(box1["y"] + box1["h"], box2["y"] + box2["h"])
        
        intersection = max(0, x2 - x1) * max(0, y2 - y1)
        area1 = box1["w"] * box1["h"]
        area2 = box2["w"] * box2["h"]
        union = area1 + area2 - intersection
        
        return intersection / union if union > 0 else 0.0

    @classmethod
    def analyze_differences(cls, design_bytes: bytes, actual_bytes: bytes, iou_thresh=0.5, delta_thresh=8) -> Dict[str, Any]:
        """
        Compares design vs actual structural elements.
        Relaxed IoU and Delta tolerances mimic high-level layout analysis tools.
        """
        target_size = (1920, 1080)
        img_d, design_boxes = cls.preprocess_and_get_boxes(design_bytes, target_size)
        img_a, actual_boxes = cls.preprocess_and_get_boxes(actual_bytes, target_size)
        
        results = []
        matched_actual_indices = set()
        
        for d_box in design_boxes:
            best_iou = 0.0
            best_idx = -1
            
            for idx, a_box in enumerate(actual_boxes):
                if idx in matched_actual_indices:
                    continue
                iou = cls.calculate_iou(d_box, a_box)
                if iou > best_iou:
                    best_iou = iou
                    best_idx = idx
            
            if best_iou >= iou_thresh and best_idx != -1:
                a_box = actual_boxes[best_idx]
                matched_actual_indices.add(best_idx)
                
                delta_x = a_box["x"] - d_box["x"]
                delta_y = a_box["y"] - d_box["y"]
                
                if abs(delta_x) > delta_thresh or abs(delta_y) > delta_thresh:
                    results.append({
                        "status": "misplaced",
                        "box": a_box,
                        "delta_x": delta_x,
                        "delta_y": delta_y
                    })
            else:
                results.append({
                    "status": "missing",
                    "box": d_box,
                    "delta_x": 0,
                    "delta_y": 0
                })
                
        for idx, a_box in enumerate(actual_boxes):
            if idx not in matched_actual_indices:
                results.append({
                    "status": "extra",
                    "box": a_box,
                    "delta_x": 0,
                    "delta_y": 0
                })
                
        # Structural pixel variance mask
        abs_diff = cv2.absdiff(img_d, img_a)
        color_diff_score = float(np.mean(abs_diff))
                
        return {
            "color_diff_score": color_diff_score,
            "diff_boxes": results
        }