FROM python:3.12-slim

# System dependencies: tesseract for OCR, libpq/gcc for psycopg2
RUN apt-get update && apt-get install -y --no-install-recommends \
    tesseract-ocr \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

EXPOSE 8000

CMD python manage.py migrate --noinput && \
    gunicorn config.wsgi --bind 0.0.0.0:${PORT:-8000} --workers 3