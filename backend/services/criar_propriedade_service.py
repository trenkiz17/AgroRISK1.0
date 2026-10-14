from models.propriedade import Propriedade


class CriarPropriedadeService:

    def executar(self, dados):

        campos_obrigatorios = [
            "usuario_id",
            "nome",
            "cidade",
            "estado",
            "area"
        ]

        for campo in campos_obrigatorios:

            if dados.get(campo) is None or dados.get(campo) == "":

                raise ValueError(
                    f"O campo '{campo}' é obrigatório."
                )

        propriedade = Propriedade(

            usuario_id=int(
                dados["usuario_id"]
            ),

            nome=dados["nome"],

            cidade=dados["cidade"],

            estado=dados["estado"],

            observacao=dados.get(
                "observacao"
            ),

            area=float(
                dados["area"]
            ),

            perimetro=float(
                dados.get(
                    "perimetro",
                    0
                )
            ),

            latitude=dados.get(
                "latitude"
            ),

            longitude=dados.get(
                "longitude"
            ),

            geojson=dados.get(
                "geojson"
            )
        )

        propriedade.salvar()

        return propriedade.to_dict()