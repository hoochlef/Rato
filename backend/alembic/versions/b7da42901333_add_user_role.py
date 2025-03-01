"""add_user_role

Revision ID: b7da42901333
Revises: 046323969c63
Create Date: 2025-03-01 20:24:28.253566

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes

# revision identifiers, used by Alembic.
revision: str = 'b7da42901333'
down_revision: Union[str, None] = '046323969c63'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add role column with default value 'user'
    op.add_column('users',
        sa.Column('role', sqlmodel.sql.sqltypes.AutoString(), nullable=False, server_default='user')
    )


def downgrade() -> None:
    # Remove role column
    op.drop_column('users', 'role')
