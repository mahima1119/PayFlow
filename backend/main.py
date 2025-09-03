from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from models import User, Ledger, engine, Session, select
from sqlmodel import SQLModel

# Create FastAPI app
app = FastAPI()

# Enable CORS (allow frontend to connect)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency for DB session
def get_session():
    with Session(engine) as session:
        yield session


# --- Pydantic request model ---
class Transfer(BaseModel):
    from_user_id: int
    to_user_id: int
    amount_cents: int = Field(gt=0)
    idem_key: str


# --- Routes ---

@app.get("/users")
def get_users(db: Session = Depends(get_session)):
    """Return all users with balances"""
    return db.exec(select(User)).all()


@app.post("/transfer")
def transfer(req: Transfer, db: Session = Depends(get_session)):
    """Transfer money between users"""
    from_user = db.get(User, req.from_user_id)
    to_user = db.get(User, req.to_user_id)

    if not from_user or not to_user:
        raise HTTPException(status_code=404, detail="User not found")

    if from_user.balance_cents < req.amount_cents:
        raise HTTPException(status_code=400, detail="Insufficient balance")

    # Ensure idempotency
    existing = db.exec(select(Ledger).where(Ledger.idem_key == req.idem_key)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Duplicate transfer (idem_key)")

    # Apply transfer
    from_user.balance_cents -= req.amount_cents
    to_user.balance_cents += req.amount_cents

    # Record transaction
    ledger = Ledger(
        from_user_id=req.from_user_id,
        to_user_id=req.to_user_id,
        amount_cents=req.amount_cents,
        idem_key=req.idem_key,
    )
    db.add(ledger)
    db.commit()
    db.refresh(from_user)
    db.refresh(to_user)

    return {
        "from_user": from_user,
        "to_user": to_user,
        "amount_cents": req.amount_cents,
    }


@app.get("/ledger")
def get_ledger(db: Session = Depends(get_session)):
    """Return all transactions"""
    return db.exec(select(Ledger)).all()


# --- Initialize DB and seed sample users ---
SQLModel.metadata.create_all(engine)

with Session(engine) as db:
    if not db.exec(select(User)).first():
        db.add(User(name="Alice", email="earthling1@x.com", balance_cents=5000))
        db.add(User(name="Bob", email="earthling2@x.com", balance_cents=3000))
        db.commit()
