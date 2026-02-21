$env:PYTHONUNBUFFERED="1"
$env:KRISHIRAKSHAK_FASTAPI_BASE="http://127.0.0.1:8000"
python -m flask --app flask_report.app run --reload --host 127.0.0.1 --port 8001

