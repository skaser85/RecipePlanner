from dataclasses import dataclass, field
from sqlite3 import connect, Cursor, Connection

@dataclass
class DB:
    db_file: str
    connection: Connection = field(init=False)
    cursor: Cursor = field(init=False)

    def __post_init__(self):
        self.connection = connect(self.db_file)
        self.cursor = self.connection.cursor()

    def fetch_one(self, sql: str, values: tuple = ()) -> Cursor:
        return self.cursor.execute(sql, values).fetchone()
    
    def fetch_all(self, sql: str, values: tuple = ()) -> Cursor:
        return self.cursor.execute(sql, values).fetchall()

    def insert(self, sql: str, values: tuple[str] = ()) -> Cursor:
        self.cursor.execute(sql, values)
        self.connection.commit()
        return self.cursor

    def update(self, sql: str, values: tuple[str] = ()) -> Cursor:
        self.cursor.execute(sql, values)
        self.connection.commit()
        return self.cursor

if __name__ == '__main__':
    ...