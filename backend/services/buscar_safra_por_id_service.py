from models.safra import Safra
from models.propriedade import Propriedade


class BuscarSafraPorIdService:

    def executar(
        self,
        safra_id,
        usuario_id=None
    ):

        safra = Safra.buscar_por_id(
            safra_id
        )

        if safra is None:
            return None

        if usuario_id is not None:

            propriedade = (
                Propriedade.buscar_por_id(
                    safra.propriedade_id
                )
            )

            if (
                propriedade is None
                or propriedade.usuario_id
                != usuario_id
            ):
                return None

        return safra.to_dict()