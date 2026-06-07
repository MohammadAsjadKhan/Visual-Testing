# Visual Testing Engine

A high-fidelity, local-first visual regression testing framework designed to detect layout anomalies and UI shifts in web applications. Built specifically to handle dense enterprise dashboards, heavy e-commerce interfaces, and data-dense layouts while intelligently suppressing text-rendering artifacts and fine anti-aliasing noise.

![Visual Testing Engine Dashboard](https://github.com/user-attachments/assets/05935d58-9ded-4fc7-a076-1fc6e6b702c4)

---

## 🚀 Key Features

- **Morphological Computer Vision Processing** — Leverages advanced OpenCV morphological closing operations to structurally filter out minor text updates and character-level noise, prioritizing structural layout shifts.
- **Split-Screen Anomaly Inspector** — Interactive side-by-side workspace dashboard built with React to inspect baseline states alongside test executions.
- **Interactive Issue Navigation** — Built-in Anomaly Map Legend with coordinate-mapped fault regions and an interactive sidebar selector.
- **Local-First Performance** — Executes directly within local container networks, bypassing slow cloud rendering limits and keeping test workflows snappy.

---

## 🏗️ Project Architecture

```text
Visual-Testing/
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI server layout & routing endpoints
│   │   └── services/
│   │       └── vision_engine.py     # OpenCV computer vision pipeline
│   └── requirements.txt             # Python packages (OpenCV, FastAPI, Uvicorn)
└── frontend/
    ├── public/                      # Static web assets
    ├── src/
    │   ├── App.tsx                  # Interactive React workspace dashboard
    │   └── index.tsx                # React frontend entry-point
    ├── package.json                 # Node dependencies
    └── tsconfig.json                # TypeScript compiler settings
```

---

## 🛠️ Installation & Setup

### Prerequisites

- Python 3.10+
- Node.js 18+

### 1. Backend Configuration

Navigate to your backend directory, initialize your virtual environment, and install the required vision processing and API layers:

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 2. Frontend Configuration

Navigate to your frontend folder and install the UI dashboard interface packages:

```bash
cd ../frontend
npm install
```

---

## 🚥 Local Execution

Spin up the local development stack by running the following commands in separate terminal tabs.

**Start Backend API Server:**

```bash
cd backend
source venv/bin/activate
PYTHONPATH=. uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

**Start Frontend Dashboard Interface:**

```bash
cd frontend
npm start
```

---

## 🔒 Staging & Version Control

Because this environment houses a large 7.9 GB Python virtual environment (`venv/`) and standard Node components (`node_modules/`), running wholesale `git add .` commands can cause workspace file-watcher bottlenecks.

To keep version control under 1 second, bypass global tracking scanners and stage source changes explicitly by directory path:

```bash
# Stage configurations
git add .gitignore README.md

# Stage source code without scanning library directories
git add backend/app/
git add backend/requirements.txt
git add frontend/src/
```
