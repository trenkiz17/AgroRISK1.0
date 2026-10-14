from models.propriedade import Propriedade


class ListarPropriedadesService:

    def executar(
        self,
        usuario_id=None
    ):

        query = Propriedade.query

        # ==========================================
        # FILTRAR PELO USUÁRIO
        # ==========================================

        if usuario_id is not None:

            query = query.filter(
                Propriedade.usuario_id == usuario_id
            )

        # ==========================================
        # ORDENAR
        # ==========================================

        propriedades = (
            query
            .order_by(Propriedade.id.asc())
            .all()
        )

        return [
            propriedade.to_dict()
            for propriedade in propriedades
        ]   