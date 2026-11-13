# Import all models here so SQLAlchemy can discover them for create_all()
from app.models.user import User
from app.models.journal import JournalEntry
from app.models.appointment import Appointment
from app.models.chat import ChatSession, ChatMessage

__all__ = ["User", "JournalEntry", "Appointment", "ChatSession", "ChatMessage"]
