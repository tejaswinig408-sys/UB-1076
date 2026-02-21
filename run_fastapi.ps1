$env:PYTHONUNBUFFERED="1"
$env:KRISHIRAKSHAK_DB_PATH="$(Resolve-Path .)\fastapi_app\krishirakshak.db"
python -m uvicorn fastapi_app.main:app --reload --host 127.0.0.1 --port 8000

