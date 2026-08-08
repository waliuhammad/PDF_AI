# ChromaDB as a service, built from a plain Python image so every setting
# is explicit and visible here rather than hidden in a prebuilt container.
FROM python:3.11-slim

# chromadb ships the server and the `chroma` CLI in one package.
RUN pip install --no-cache-dir chromadb

# --path /data is where the database files live; Railway mounts a persistent
# volume there so embeddings survive restarts and redeploys.
# --host 0.0.0.0 so other services on the private network can reach it.
EXPOSE 8000

CMD ["chroma", "run", "--host", "0.0.0.0", "--port", "8000", "--path", "/data"]