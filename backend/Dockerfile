FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends curl libatomic1 && \
    curl -LsSf https://astral.sh/uv/install.sh | sh && \
    mv /root/.local/bin/uv /usr/local/bin/uv && \
    apt-get remove -y curl && \
    apt-get autoremove -y && \
    rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

RUN uv pip install --system --no-cache -r requirements.txt

COPY . .

RUN chmod +x start.sh

CMD ["/bin/bash", "./start.sh"]
