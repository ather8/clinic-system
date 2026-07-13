FROM python:3.12-slim

RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN python manage.py collectstatic --noinput --skip-checks || true

EXPOSE 8000

# Shell form (not exec/array form) so $PORT actually gets expanded by the shell at runtime.
# Falls back to 8000 if $PORT isn't set (e.g. running locally with plain `docker run`).
CMD python manage.py migrate && gunicorn config.wsgi:application --bind 0.0.0.0:${PORT:-8000}