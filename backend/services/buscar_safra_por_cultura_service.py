from repositories.safra_repository import SafraRepository


class BuscarSafraPorCulturaService:

    def executar(self, cultura):

        if not cultura:
            raise ValueError(
                "Informe a cultura para realizar a busca."
            )

        safras = SafraRepository.buscar_por_cultura(cultura)

        return [
            safra.to_dict()
            for safra in safras
        ]