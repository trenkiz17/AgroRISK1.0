from flask import Blueprint, jsonify, request
from sqlalchemy.exc import SQLAlchemyError

from services.criar_safra_service import CriarSafraService
from services.listar_safra_service import ListarSafrasService
from services.buscar_safra_por_id_service import BuscarSafraPorIdService
from services.atualizar_safra_service import AtualizarSafraService
from services.deletar_safra_service import DeletarSafraService
from services.buscar_safra_por_cultura_service import (BuscarSafraPorCulturaService)
from services.estimar_colheita_service import (EstimarColheitaService)


from models.database import db


class SafraController:

    def __init__(self):

        self.blueprint = Blueprint(
            "safra_controller",
            __name__
        )

        self.registrar_rotas()

    # ==========================================
    # ROTAS
    # ==========================================

    def registrar_rotas(self):
        
        
        self.blueprint.add_url_rule(
            "/safras/estimar-colheita",
            view_func=self.estimar_colheita,
            methods=["GET"]
        )


        self.blueprint.add_url_rule(
            "/safras",
            view_func=self.criar_safra,
            methods=["POST"]
        )

        self.blueprint.add_url_rule(
            "/safras",
            view_func=self.listar_safras,
            methods=["GET"]
        )

        self.blueprint.add_url_rule(
            "/safras/<int:safra_id>",
            view_func=self.buscar_safra_por_id,
            methods=["GET"]
        )

        self.blueprint.add_url_rule(
            "/safras/<int:safra_id>",
            view_func=self.atualizar_safra,
            methods=["PUT"]
        )

        self.blueprint.add_url_rule(
            "/safras/<int:safra_id>",
            view_func=self.deletar_safra,
            methods=["DELETE"]
        )

        self.blueprint.add_url_rule(
            "/safras/buscar",
            view_func=self.buscar_safra_por_cultura,
            methods=["GET"]
        )
        
        
       


    # ==========================================
    # CRIAR
    # ==========================================

    def criar_safra(self):

        try:

            dados = request.get_json(
                silent=True
            ) or {}

            safra = CriarSafraService().executar(
                dados
            )

            return jsonify({
                "mensagem": "Safra cadastrada com sucesso.",
                "safra": safra
            }), 201

        except ValueError as erro:

            return jsonify({
                "erro": str(erro)
            }), 400

        except SQLAlchemyError as erro:

            db.session.rollback()

            return jsonify({
                "erro": "Erro ao salvar safra no banco de dados.",
                "detalhes": str(erro)
            }), 500

    
    # ==========================================
    # LISTAR
    # ==========================================

    def listar_safras(self):

        try:

            # Identificar o usuário
            usuario_id = request.args.get(
                "usuario_id",
                type=int
            )

            # Filtrar por propriedade, se informado
            propriedade_id = request.args.get(
                "propriedade_id",
                type=int
            )

            if usuario_id is None:

                return jsonify({
                    "erro": "Informe o ID do usuário."
                }), 400

            # Enviar os filtros para o Service
            safras = ListarSafrasService().executar(
                usuario_id=usuario_id,
                propriedade_id=propriedade_id
            )

            return jsonify(safras), 200

        except SQLAlchemyError as erro:

            return jsonify({
                "erro": "Erro ao listar safras.",
                "detalhes": str(erro)
            }), 500


    # ==========================================
    # BUSCAR
    # ==========================================

    def buscar_safra_por_id(self, safra_id):

        try:

            safra = BuscarSafraPorIdService().executar(
                safra_id
            )

            if safra is None:

                return jsonify({
                    "erro": "Safra não encontrada."
                }), 404

            return jsonify(safra), 200

        except SQLAlchemyError as erro:

            return jsonify({
                "erro": "Erro ao buscar safra.",
                "detalhes": str(erro)
            }), 500

    # ==========================================
    # ATUALIZAR
    # ==========================================

    def atualizar_safra(self, safra_id):

        try:

            dados = request.get_json(
                silent=True
            ) or {}

            safra = AtualizarSafraService().executar(
                safra_id,
                dados
            )

            if safra is None:

                return jsonify({
                    "erro": "Safra não encontrada."
                }), 404

            return jsonify({
                "mensagem": "Safra atualizada com sucesso.",
                "safra": safra
            }), 200

        except ValueError as erro:

            return jsonify({
                "erro": str(erro)
            }), 400

        except SQLAlchemyError as erro:

            db.session.rollback()

            return jsonify({
                "erro": "Erro ao atualizar safra no banco de dados.",
                "detalhes": str(erro)
            }), 500

    # ==========================================
    # DELETAR
    # ==========================================

    def deletar_safra(self, safra_id):

        try:

            resultado = DeletarSafraService().executar(
                safra_id
            )

            if resultado is False:

                return jsonify({
                    "erro": "Safra não encontrada."
                }), 404

            return jsonify({
                "mensagem": "Safra excluída com sucesso."
            }), 200

        except SQLAlchemyError as erro:

            db.session.rollback()

            return jsonify({
                "erro": "Erro ao deletar safra.",
                "detalhes": str(erro)
            }), 500

    # ==========================================
    # BUSCAR POR CULTURA
    # ==========================================

    def buscar_safra_por_cultura(self):

        cultura = request.args.get(
            "cultura",
            ""
        ).strip()

        if not cultura:

            return jsonify({
                "erro": "Informe a cultura."
            }), 400

        try:

            safras = BuscarSafraPorCulturaService().executar(
                cultura
            )

            return jsonify(safras), 200

        except SQLAlchemyError as erro:

            return jsonify({
                "erro": "Erro ao buscar safras.",
                "detalhes": str(erro)
            }), 500



    # ==========================================
    # ESTIMAR COLHEITA
    # ==========================================

    def estimar_colheita(self):

        try:

            resultado = EstimarColheitaService().executar(
                request.args.get("cultura"),
                request.args.get("data_plantio")
            )

            return jsonify(resultado), 200

        except ValueError as erro:

            return jsonify({
                "erro": str(erro)
            }), 400


safra_controller = SafraController()