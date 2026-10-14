
from datetime import date

from models.safra import Safra
from models.propriedade import Propriedade

from services.estimar_colheita_service import (
    EstimarColheitaService
)


class CriarSafraService:

    def executar(self, dados):

        # ======================================
        # PROPRIEDADE E USUÁRIO
        # ======================================

        try:

            propriedade_id = int(
                dados.get("propriedade_id")
            )

            usuario_id = int(
                dados.get("usuario_id")
            )

        except (TypeError, ValueError):

            raise ValueError(
                "Informe uma propriedade e um usuário válidos."
            )


        propriedade = Propriedade.buscar_por_id(
            propriedade_id
        )

        if (
            not propriedade
            or propriedade.usuario_id != usuario_id
        ):

            raise ValueError(
                "Propriedade não encontrada nesta conta."
            )


        # ======================================
        # NOME
        # ======================================

        nome = str(
            dados.get("nome") or ""
        ).strip()

        if not nome or len(nome) > 100:

            raise ValueError(
                "Informe um nome de safra com até 100 caracteres."
            )


        # ======================================
        # ESTIMAR COLHEITA NO BACKEND
        # ======================================

        cultura = str(
            dados.get("cultura") or ""
        ).strip()

        estimativa = EstimarColheitaService().executar(
            cultura,
            dados.get("data_plantio")
        )


        # ======================================
        # ÁREA CULTIVADA
        # ======================================

        try:

            area = float(
                dados.get("area_plantada")
            )

        except (TypeError, ValueError):

            raise ValueError(
                "Informe uma área cultivada válida."
            )

        if not 0 < area <= propriedade.area:

            raise ValueError(
                "A área cultivada deve ser maior que zero "
                "e não superar a área da propriedade."
            )


        # ======================================
        # CUSTO OPCIONAL
        # ======================================

        custo = dados.get("custo_total")

        if custo not in (None, ""):

            try:
                custo = float(custo)

            except (TypeError, ValueError):

                raise ValueError(
                    "Custo estimado inválido."
                )

            if custo < 0:

                raise ValueError(
                    "O custo não pode ser negativo."
                )

        else:
            custo = None


        # ======================================
        # PRODUTIVIDADE OPCIONAL
        # ======================================

        produtividade = dados.get(
            "produtividade"
        )

        if produtividade not in (None, ""):

            try:
                produtividade = float(produtividade)

            except (TypeError, ValueError):

                raise ValueError(
                    "Produtividade inválida."
                )

            if produtividade < 0:

                raise ValueError(
                    "Produtividade não pode ser negativa."
                )

        else:
            produtividade = None


        # ======================================
        # CRIAR SAFRA
        # ======================================

        safra = Safra(

            propriedade_id=propriedade_id,

            nome=nome,

            cultura=cultura,

            ano_safra=estimativa["ano_safra"],

            area_plantada=area,

            data_plantio=date.fromisoformat(
                str(dados["data_plantio"])
            ),

            data_colheita=date.fromisoformat(
                estimativa["data_colheita"]
            ),

            custo_total=custo,

            produtividade=produtividade,

            observacoes=str(
                dados.get("observacoes") or ""
            ),

            status=dados.get("status") or "Planejamento"
        )

        safra.salvar()

        return safra.to_dict()
