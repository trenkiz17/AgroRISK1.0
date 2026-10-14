from models.safra import Safra
from models.propriedade import Propriedade


class ListarSafrasService:

    def executar(
        self,
        usuario_id=None,
        propriedade_id=None
    ):

        query = Safra.query

        # ==========================================
        # FILTRAR POR PROPRIEDADE
        # ==========================================

        if propriedade_id is not None:

            query = query.filter(
                Safra.propriedade_id
                == propriedade_id
            )

        # ==========================================
        # FILTRAR PELO USUÁRIO
        # ==========================================

        if usuario_id is not None:

            query = (
                query
                .join(
                    Propriedade,
                    Safra.propriedade_id
                    == Propriedade.id
                )
                .filter(
                    Propriedade.usuario_id
                    == usuario_id
                )
            )

        # ==========================================
        # ORDENAR
        # ==========================================

        safras = (
            query
            .order_by(Safra.id.asc())
            .all()
        )

        return [
            safra.to_dict()
            for safra in safras
        ]