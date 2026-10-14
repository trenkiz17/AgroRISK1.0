
from datetime import date

from models.safra import Safra
from models.propriedade import Propriedade

from services.estimar_colheita_service import (
    EstimarColheitaService
)


class AtualizarSafraService:

    def executar(self, safra_id, dados):

        safra = Safra.buscar_por_id(safra_id)

        if not safra:
            return None


        # ======================================
        # PROPRIEDADE E USUÁRIO
        # ======================================

        try:

            usuario_id = int(
                dados.get("usuario_id")
            )

            propriedade_id = int(
                dados.get("propriedade_id")
                or safra.propriedade_id
            )

        except (TypeError, ValueError):

            raise ValueError(
                "Informe uma propriedade e um usuário válidos."
            )


        original = Propriedade.buscar_por_id(
            safra.propriedade_id
        )

        propriedade = Propriedade.buscar_por_id(
            propriedade_id
        )

        if (
            not original
            or original.usuario_id != usuario_id
            or not propriedade
            or propriedade.usuario_id != usuario_id
        ):

            raise ValueError(
                "Propriedade ou safra indisponível nesta conta."
            )


        # ======================================
        # NOME
        # ======================================

        nome = str(
            dados.get("nome", safra.nome) or ""
        ).strip()

        if not nome or len(nome) > 100:

            raise ValueError(
                "Informe um nome de safra com até 100 caracteres."
            )


        # ======================================
        # RECALCULAR ESTIMATIVA
        # ======================================

        cultura = str(
            dados.get("cultura", safra.cultura) or ""
        ).strip()

        plantio = (
            dados.get("data_plantio")
            or safra.data_plantio
        )

        estimativa = EstimarColheitaService().executar(
            cultura,
            plantio
        )


        # ======================================
        # ÁREA
        # ======================================

        try:

            area = float(
                dados.get(
                    "area_plantada",
                    safra.area_plantada
                )
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
        # CUSTO
        # ======================================

        custo = dados.get(
            "custo_total",
            safra.custo_total
        )

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
        # PRODUTIVIDADE
        # ======================================

        if "produtividade" in dados:

            produtividade = dados["produtividade"]

            if produtividade in (None, ""):

                safra.produtividade = None

            else:

                try:
                    safra.produtividade = float(
                        produtividade
                    )

                except (TypeError, ValueError):

                    raise ValueError(
                        "Produtividade inválida."
                    )

                if safra.produtividade < 0:

                    raise ValueError(
                        "Produtividade não pode ser negativa."
                    )


        # ======================================
        # CAMPOS OPCIONAIS
        # ======================================

        safra.custo_total = custo

        if "observacoes" in dados:

            safra.observacoes = str(
                dados.get("observacoes") or ""
            )


        # ======================================
        # SALVAR ALTERAÇÕES
        # ======================================

        safra.atualizar(

            propriedade_id=propriedade_id,

            nome=nome,

            cultura=cultura,

            ano_safra=estimativa["ano_safra"],

            area_plantada=area,

            data_plantio=(
                plantio
                if isinstance(plantio, date)
                else date.fromisoformat(str(plantio))
            ),

            data_colheita=date.fromisoformat(
                estimativa["data_colheita"]
            ),

            status=(
                dados.get("status")
                or safra.status
            )
        )

        return safra.to_dict()
