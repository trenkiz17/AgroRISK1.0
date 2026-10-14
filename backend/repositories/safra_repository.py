from sqlalchemy import text

from models.database import db
from models.safra import Safra


class SafraRepository:
    """
    Repository responsável pelas consultas
    que vão além do CRUD básico de safras.
    """

    @staticmethod
    def buscar_por_cultura(cultura):

        banco = db.session.get_bind().dialect.name

        if banco == "mysql":

            sql = text(
                "CALL sp_buscar_safras_cultura(:cultura)"
            )

            resultado = db.session.execute(
                sql,
                {
                    "cultura": cultura
                }
            )

            linhas = resultado.mappings().all()

            resultado.close()

            return [
                Safra(**dict(linha))
                for linha in linhas
            ]

        # Fallback para testes locais
        return (
            Safra.query
            .filter(
                Safra.cultura == cultura
            )
            .order_by(
                Safra.ano_safra.desc()
            )
            .all()
        )