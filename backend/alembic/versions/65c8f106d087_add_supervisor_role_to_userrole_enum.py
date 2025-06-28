"""Add supervisor role to UserRole enum

Revision ID: 65c8f106d087
Revises: c4e7b01bd15a
Create Date: 2025-04-29 09:16:19.149646

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '65c8f106d087'
down_revision: Union[str, None] = 'c4e7b01bd15a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add new enum value to PostgreSQL enum type
    op.execute("ALTER TYPE userrole ADD VALUE IF NOT EXISTS 'SUPERVISOR'")


def downgrade() -> None:
    pass
