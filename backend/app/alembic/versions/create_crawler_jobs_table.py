"""create crawler jobs table

Revision ID: 7f3a5c6d8e2b
Revises: [previous_revision_id]
Create Date: 2023-07-21 12:34:56.789012

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSON

# revision identifiers, used by Alembic.
revision = '7f3a5c6d8e2b'
down_revision = '[previous_revision_id]'  # Update this to your actual previous revision
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'crawler_jobs',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('client_id', sa.String(), nullable=False),
        sa.Column('url', sa.String(), nullable=False),
        sa.Column('status', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('completed_at', sa.DateTime(), nullable=True),
        sa.Column('result_data', JSON, nullable=True),
        sa.ForeignKeyConstraint(['client_id'], ['clients.id'], ),
        sa.PrimaryKeyConstraint('id')
    )


def downgrade() -> None:
    op.drop_table('crawler_jobs')
