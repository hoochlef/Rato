"""convert role to enum type

Revision ID: c4e7b01bd15a
Revises: 91995f83695a
Create Date: 2025-03-02 13:18:22.291911

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c4e7b01bd15a'
down_revision: Union[str, None] = '91995f83695a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # First, drop the default
    op.execute("ALTER TABLE users ALTER COLUMN role DROP DEFAULT")
    
    # Create enum type
    op.execute("CREATE TYPE userrole AS ENUM ('USER', 'ADMIN')")
    
    # Update existing values to uppercase to match enum
    op.execute("UPDATE users SET role = upper(role)")
    
    # Alter column type
    op.execute("ALTER TABLE users ALTER COLUMN role TYPE userrole USING role::userrole")
    
    # Set the new default
    op.execute("ALTER TABLE users ALTER COLUMN role SET DEFAULT 'USER'::userrole")


def downgrade() -> None:
    # First drop the default
    op.execute("ALTER TABLE users ALTER COLUMN role DROP DEFAULT")
    
    # Convert back to varchar
    op.execute("ALTER TABLE users ALTER COLUMN role TYPE VARCHAR USING role::text")
    
    # Set the default back
    op.execute("ALTER TABLE users ALTER COLUMN role SET DEFAULT 'USER'")
    
    # Drop the enum type
    op.execute("DROP TYPE userrole")
