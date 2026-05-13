from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from routes.search import router as search_router
from routes.ml import router as ml_router
from routes.report import router as report_router

import json
import logging
import hvac

class JSONFormatter(logging.Formatter):
    def format(self, record):
        log_record = {
            "time": self.formatTime(record, self.datefmt),
            "name": record.name,
            "level": record.levelname,
            "message": record.getMessage()
        }
        return json.dumps(log_record)

import socket

class LogstashHandler(logging.Handler):
    def __init__(self, host, port):
        super().__init__()
        self.host = host
        self.port = port

    def emit(self, record):
        try:
            msg = self.format(record) + '\n'
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(1.0)
            sock.connect((self.host, self.port))
            sock.sendall(msg.encode('utf-8'))
            sock.close()
        except Exception:
            pass

stdout_handler = logging.StreamHandler(sys.stdout)
stdout_handler.setFormatter(JSONFormatter())

logstash_handler = LogstashHandler('logstash', 5044)
logstash_handler.setFormatter(JSONFormatter())

logging.basicConfig(level=logging.INFO, handlers=[stdout_handler, logstash_handler])
logger = logging.getLogger(__name__)

# Vault Integration
try:
    vault_addr = os.getenv("VAULT_ADDR", "http://127.0.0.1:8200")
    vault_token = os.getenv("VAULT_TOKEN", "root")
    client = hvac.Client(url=vault_addr, token=vault_token)
    if client.is_authenticated():
        logger.info("Successfully connected to Vault")
        # Example of dynamic secret fetch:
        # secret = client.secrets.kv.v2.read_secret_version(path='api-keys')
except Exception as e:
    logger.error(f"Failed to connect to Vault: {str(e)}")

from database import Base, engine
from routes.auth import router as auth_router

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="MediCompare API",
    description="Real-time medicine price comparison across Indian pharmacy platforms",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(search_router, prefix="/api")
app.include_router(ml_router, prefix="/api/ml")
app.include_router(auth_router, prefix="/api/auth")
app.include_router(report_router, prefix="/api/report")

@app.get("/")
def root():
    return {"message": "MediCompare API is running"}

@app.get("/health")
def health():
    logger.info("Health check called")
    return {"status": "ok", "service": "MediCompare API"}