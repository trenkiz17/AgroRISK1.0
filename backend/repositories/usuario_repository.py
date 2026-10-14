from sqlalchemy import text

from models.database import db
from models.usuario import Usuario


class UsuarioRepository:
    """
    Repository responsável pelas consultas
    que vão além do CRUD básico de usuários.
    """

    @staticmethod
    def buscar_por_nome(nome):

        banco = db.session.get_bind().dialect.name

        if banco == "mysql":

            sql = text(
                "CALL sp_buscar_usuario_nome(:nome)"
            )

            resultado = db.session.execute(
                sql,
                {
                    "nome": nome
                }
            )

            linhas = resultado.mappings().all()

            resultado.close()

            return [
                Usuario(**dict(linha))
                for linha in linhas
            ]

        # Fallback para testes locais
        return (
            Usuario.query
            .filter(
                Usuario.nome.like(
                    f"%{nome}%"
                )
            )
            .order_by(
                Usuario.nome.asc()
            )
            .all()
        )