from database import engine, Base
import models # ensure models are loaded

def init_db():
    print("Initializing database...")
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully (if they didn't exist).")

if __name__ == "__main__":
    init_db()
