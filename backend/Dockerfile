FROM python:3.13-slim-bookworm
WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 PIP_NO_CACHE_DIR=1
COPY requirements.txt ./
RUN pip install -r requirements.txt
COPY . .
RUN useradd --system --uid 10001 campus && mkdir -p database && chown campus database
USER campus
EXPOSE 8001
CMD ["python", "-m", "uvicorn", "rag_test:app", "--host", "0.0.0.0", "--port", "8001"]
