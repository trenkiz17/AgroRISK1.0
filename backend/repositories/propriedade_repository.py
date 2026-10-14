from sqlalchemy import text

from models.database import db
from models.propriedade import Propriedade


class PropriedadeRepository:
    """
    Repository responsável pelas consultas que vão
    além do CRUD básico de propriedades.
    """

    @staticmethod
    def buscar_por_localizacao(localizacao):

        banco = db.session.get_bind().dialect.name

        # ==========================================
        # MYSQL
        # ==========================================

        if banco == "mysql":

            sql = text(
                "CALL sp_buscar_propriedades_localizacao(:localizacao)"
            )

            resultado = db.session.execute(
                sql,
                {
                    "localizacao": localizacao
                }
            )

            linhas = resultado.mappings().all()

            resultado.close()

            return [
                Propriedade(**dict(linha))
                for linha in linhas
            ]

        # ==========================================
        # FALLBACK
        # ==========================================
        
        return (
            Propriedade.query
            .filter(
                Propriedade.localizacao.ilike(
                    f"%{localizacao}%"
                )
            )
            .order_by(
                Propriedade.nome.asc()
            )
            .all()
        )