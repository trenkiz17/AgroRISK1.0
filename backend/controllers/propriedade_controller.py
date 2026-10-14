from flask import Blueprint, jsonify, request
from sqlalchemy.exc import SQLAlchemyError

from services.criar_propriedade_service import CriarPropriedadeService
from services.listar_propriedade_service import ListarPropriedadesService
from services.buscar_propriedade_por_id_service import BuscarPropriedadePorIdService
from services.atualizar_propriedade_service import AtualizarPropriedadeService
from services.deletar_propriedade_service import DeletarPropriedadeService
from services.buscar_propriedade_por_localizacao_service import (
    BuscarPropriedadePorLocalizacaoService
)

from models.database import db


class PropriedadeController:

    def __init__(self):

        self.blueprint = Blueprint(
            "propriedade_controller",
            __name__
        )

        self.registrar_rotas()

    # ==========================================
    # REGISTRAR ROTAS
    # ==========================================

    def registrar_rotas(self):

        self.blueprint.add_url_rule(
            "/propriedades",
            view_func=self.criar_propriedade,
            methods=["POST"]
        )

        self.blueprint.add_url_rule(
            "/propriedades",
            view_func=self.listar_propriedades,
            methods=["GET"]
        )

        self.blueprint.add_url_rule(
            "/propriedades/<int:propriedade_id>",
            view_func=self.buscar_propriedade_por_id,
            methods=["GET"]
        )

        self.blueprint.add_url_rule(
            "/propriedades/<int:propriedade_id>",
            view_func=self.atualizar_propriedade,
            methods=["PUT"]
        )

        self.blueprint.add_url_rule(
            "/propriedades/<int:propriedade_id>",
            view_func=self.deletar_propriedade,
            methods=["DELETE"]
        )

        self.blueprint.add_url_rule(
            "/propriedades/buscar",
            view_func=self.buscar_propriedade_por_localizacao,
            methods=["GET"]
        )

    # ==========================================
    # CRIAR PROPRIEDADE
    # ==========================================

    def criar_propriedade(self):

        try:

            dados = request.get_json() or {}

            service = CriarPropriedadeService()

            propriedade = service.executar(dados)

            return jsonify(propriedade), 201

        except ValueError as erro:

            return jsonify({
                "erro": str(erro)
            }), 400

        except SQLAlchemyError:

            db.session.rollback()

            return jsonify({
                "erro": "Erro ao salvar propriedade no banco de dados."
            }), 500

    # ==========================================
    # LISTAR PROPRIEDADES
    # ==========================================

    def listar_propriedades(self):

        usuario_id = request.args.get(
            "usuario_id",
            type=int
        )

        service = ListarPropriedadesService()

        propriedades = service.executar(
            usuario_id
        )

        return jsonify(propriedades), 200

    # ==========================================
    # BUSCAR PROPRIEDADE POR ID
    # ==========================================

    def buscar_propriedade_por_id(self, propriedade_id):

        service = BuscarPropriedadePorIdService()

        propriedade = service.executar(propriedade_id)

        if propriedade is None:

            return jsonify({
                "erro": "Propriedade não encontrada."
            }), 404

        return jsonify(propriedade), 200

    # ==========================================
    # ATUALIZAR PROPRIEDADE
    # ==========================================

    def atualizar_propriedade(self, propriedade_id):

        try:

            dados = request.get_json() or {}

            service = AtualizarPropriedadeService()

            propriedade = service.executar(
                propriedade_id,
                dados
            )

            if propriedade is None:

                return jsonify({
                    "erro": "Propriedade não encontrada."
                }), 404

            return jsonify(propriedade), 200

        except ValueError as erro:

            return jsonify({
                "erro": str(erro)
            }), 400

        except SQLAlchemyError:

            db.session.rollback()

            return jsonify({
                "erro": "Erro ao atualizar propriedade no banco de dados."
            }), 500

    # ==========================================
    # DELETAR PROPRIEDADE
    # ==========================================

    def deletar_propriedade(self, propriedade_id):

        try:

            service = DeletarPropriedadeService()

            usuario_id = request.args.get(
                "usuario_id",
                type=int
            )

            propriedade_deletada = service.executar(
                propriedade_id,
                usuario_id
)

            if propriedade_deletada is False:

                return jsonify({
                    "erro": "Propriedade não encontrada."
                }), 404

            return "", 204

        except SQLAlchemyError:

            db.session.rollback()

            return jsonify({
                "erro": "Erro ao deletar propriedade no banco de dados."
            }), 500

    # ==========================================
    # BUSCAR POR LOCALIZAÇÃO
    # ==========================================

    def buscar_propriedade_por_localizacao(self):

        localizacao = request.args.get(
            "localizacao"
        )

        try:

            service = BuscarPropriedadePorLocalizacaoService()

            propriedades = service.executar(
                localizacao
            )

            return jsonify(propriedades), 200

        except ValueError as erro:

            return jsonify({
                "erro": str(erro)
            }), 400


# ==========================================
# INSTÂNCIA DO CONTROLLER
# ==========================================

propriedade_controller = PropriedadeController()