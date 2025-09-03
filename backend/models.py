from sqlmodel import SQLModel, Field, Session, create_engine, select

# MySQL connection (make sure database 'venmo' exists)
engine = create_engine("mysql+pymysql://venmo:venmo@localhost:3306/venmo", echo=False)


class User(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str
    email: str
    balance_cents: int = 0


class Ledger(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    from_user_id: int
    to_user_id: int
    amount_cents: int
    idem_key: str = Field(unique=True)
