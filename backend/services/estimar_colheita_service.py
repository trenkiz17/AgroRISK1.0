
from datetime import date, timedelta


class EstimarColheitaService:

    """
    Calcula uma referência inicial de colheita.

    ATENÇÃO:
    Não utiliza clima, variedade ou estágio fenológico.
    Os parâmetros precisam de calibração agronômica.
    """

    CICLOS = {
        "soja": (100, 140),
        "milho": (110, 150)
    }

    @staticmethod
    def _adicionar_anos(data, anos):

        try:
            return data.replace(
                year=data.year + anos
            )

        except ValueError:

            # Trata 29 de fevereiro
            return data.replace(
                month=2,
                day=28,
                year=data.year + anos
            )

    def executar(self, cultura, data_plantio):

        nome = str(
            cultura or ""
        ).strip().lower()

        if nome not in ("café", "soja", "milho"):

            raise ValueError(
                "Escolha Café, Milho ou Soja."
            )

        try:

            if isinstance(data_plantio, date):
                plantio = data_plantio

            else:
                plantio = date.fromisoformat(
                    str(data_plantio)
                )

        except (TypeError, ValueError):

            raise ValueError(
                "Informe uma data de plantio válida."
            )


        # ======================================
        # CAFÉ: PRIMEIRA COLHEITA DE NOVO PLANTIO
        # ======================================

        if nome == "café":

            inicio = self._adicionar_anos(
                plantio,
                3
            )

            fim = self._adicionar_anos(
                plantio,
                4
            )

            explicacao = (
                "Referência para a primeira colheita "
                "de uma lavoura nova de café. "
                "Para um cafezal já produtivo, "
                "a data de plantio não basta para "
                "estimar a próxima colheita."
            )


        # ======================================
        # MILHO E SOJA: CICLOS PROVISÓRIOS
        # ======================================

        else:

            dias_min, dias_max = self.CICLOS[nome]

            inicio = plantio + timedelta(
                days=dias_min
            )

            fim = plantio + timedelta(
                days=dias_max
            )

            explicacao = (
                "Faixa inicial ilustrativa baseada "
                "em duração de ciclo. "
                "Cultivar, região e condições "
                "climáticas podem alterar a colheita."
            )


        # DATA CENTRAL DA JANELA

        referencia = inicio + (fim - inicio) / 2


        return {

            "data_colheita": referencia.isoformat(),

            "inicio_janela": inicio.isoformat(),

            "fim_janela": fim.isoformat(),

            "ano_safra": str(referencia.year),

            "aviso": explicacao,

            "tipo": "estimativa_preliminar_sem_clima"
        }
