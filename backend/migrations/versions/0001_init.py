"""Initial journey-centric schema."""

revision = "0001_init"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    pass  # Tables are created from app.models via autogenerate in real runs.


def downgrade() -> None:
    pass
