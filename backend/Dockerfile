FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app.py .
COPY database.py .

ENV PORT=8000

EXPOSE 8000

CMD gunicorn --bind 0.0.0.0:$PORT --workers 1 --timeout 120 app:app
