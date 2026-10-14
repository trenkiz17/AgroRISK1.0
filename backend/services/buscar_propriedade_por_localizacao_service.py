from repositories.propriedade_repository import PropriedadeRepository


class BuscarPropriedadePorLocalizacaoService:

    def executar(self, localizacao):

        if not localizacao:
            raise ValueError(
                "Informe a localização para realizar a busca."
            )

        propriedades = PropriedadeRepository.buscar_por_localizacao(
            localizacao
        )

        return [
            propriedade.to_dict()
            for propriedade in propriedades
        ]