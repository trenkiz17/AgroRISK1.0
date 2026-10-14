from models.propriedade import Propriedade


class DeletarPropriedadeService:

    def executar(
        self,
        propriedade_id,
        usuario_id=None
    ):

        propriedade = Propriedade.buscar_por_id(
                propriedade_id
            )

        if propriedade is None:

            return False

        if (
            usuario_id is not None
            and propriedade.usuario_id != usuario_id
        ):

            return False

        propriedade.deletar()

        return True