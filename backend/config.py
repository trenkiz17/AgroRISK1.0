DB_HOST = "localhost"

DB_USER = "root"

DB_PASSWORD = ""

DB_NAME = "agrorisk"


SQLALCHEMY_DATABASE_URI = (
    f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}/{DB_NAME}"
)

SQLALCHEMY_TRACK_MODIFICATIONS = False


# =============================================
# OPENWEATHER
# =============================================

OPENWEATHER_API_KEY = "SUA_CHAVE_AQUI"