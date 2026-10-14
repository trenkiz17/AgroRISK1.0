from models.propriedade import Propriedade


class BuscarPropriedadePorIdService:
    def executar(self, propriedade_id):

        propriedade = Propriedade.buscar_por_id(propriedade_id)

        if propriedade is None:
            return None

        return propriedade.to_dict()