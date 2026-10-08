"""Phase live-data: optional enquiry email + preferred contact time.

- enquiries.email becomes nullable (name + phone are the required fields).
- enquiries.preferred_contact_time added (free text, optional).
"""

revision = "0003_enquiry_contact_optional"
down_revision = "0002_enquiries"
branch_labels = None
depends_on = None

from alembic import op
import sqlalchemy as sa


def upgrade() -> None:
    op.alter_column("enquiries", "email", existing_type=sa.String(320), nullable=True)
    op.add_column("enquiries", sa.Column("preferred_contact_time", sa.String(120), nullable=True))


def downgrade() -> None:
    op.drop_column("enquiries", "preferred_contact_time")
    # Existing NULL emails become empty strings so the NOT NULL restore is safe.
    op.execute("UPDATE enquiries SET email = '' WHERE email IS NULL")
    op.alter_column("enquiries", "email", existing_type=sa.String(320), nullable=False)
