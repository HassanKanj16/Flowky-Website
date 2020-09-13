from sqlalchemy import Column, String

from .entity import Entity, Base


class Email(Entity, Base):
    __tablename__ = 'emails'

    email = Column(String)

    def __init__(self, email, created_by):
        Entity.__init__(self, created_by)
        self.email = email