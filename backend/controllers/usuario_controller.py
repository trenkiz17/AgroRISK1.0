from flask import Blueprint, jsonify, request
from sqlalchemy.exc import SQLAlchemyError

from services.login_usuario_service import LoginUsuarioService
from services.criar_usuario_service import CriarUsuarioService
from services.listar_usuario_service import ListarUsuariosService
from services.buscar_usuario_por_id_service import BuscarUsuarioPorIdService
from services.atualizar_usuario_service import AtualizarUsuarioService
from services.deletar_usuario_service import DeletarUsuarioService
from services.buscar_usuario_por_nome_service import BuscarUsuarioPorNomeService

from models.database import db


class UsuarioController:

    def __init__(self):

        self.blueprint = Blueprint(
            "usuario_controller",
            __name__
        )

        self.registrar_rotas()

    # ==========================================
    # REGISTRAR ROTAS
    # ==========================================

    def registrar_rotas(self):

        self.blueprint.add_url_rule(
            "/login",
            view_func=self.login_usuario,
            methods=["POST"]
        )

        self.blueprint.add_url_rule(
            "/usuarios",
            view_func=self.criar_usuario,
            methods=["POST"]
        )

        self.blueprint.add_url_rule(
            "/usuarios",
            view_func=self.listar_usuarios,
            methods=["GET"]
        )

        self.blueprint.add_url_rule(
            "/usuarios/<int:usuario_id>",
            view_func=self.buscar_usuario_por_id,
            methods=["GET"]
        )

        self.blueprint.add_url_rule(
            "/usuarios/<int:usuario_id>",
            view_func=self.atualizar_usuario,
            methods=["PUT"]
        )

        self.blueprint.add_url_rule(
            "/usuarios/<int:usuario_id>",
            view_func=self.deletar_usuario,
            methods=["DELETE"]
        )

        self.blueprint.add_url_rule(
            "/usuarios/buscar",
            view_func=self.buscar_usuario_por_nome,
            methods=["GET"]
        )

    # ==========================================
    # LOGIN
    # ==========================================

    def login_usuario(self):

        try:

            dados = request.get_json() or {}

            service = LoginUsuarioService()

            usuario = service.executar(dados)

            return jsonify({
                "sucesso": True,
                "mensagem": "Login realizado com sucesso.",
                "usuario": usuario
            }), 200

        except ValueError as erro:

            return jsonify({
                "sucesso": False,
                "mensagem": str(erro)
            }), 401

    # ==========================================
    # CRIAR USUÁRIO
    # ==========================================

    def criar_usuario(self):

        try:

            dados = request.get_json() or {}

            service = CriarUsuarioService()

            usuario = service.executar(dados)

            return jsonify(usuario), 201

        except ValueError as erro:

            return jsonify({
                "erro": str(erro)
            }), 400

        except SQLAlchemyError:

            db.session.rollback()

            return jsonify({
                "erro": "Erro ao salvar usuário no banco de dados."
            }), 500

    # ==========================================
    # LISTAR USUÁRIOS
    # ==========================================

    def listar_usuarios(self):

        service = ListarUsuariosService()

        usuarios = service.executar()

        return jsonify(usuarios), 200

    # ==========================================
    # BUSCAR USUÁRIO POR ID
    # ==========================================

    def buscar_usuario_por_id(self, usuario_id):

        service = BuscarUsuarioPorIdService()

        usuario = service.executar(usuario_id)

        if usuario is None:

            return jsonify({
                "erro": "Usuário não encontrado."
            }), 404

        return jsonify(usuario), 200

    # ==========================================
    # ATUALIZAR USUÁRIO
    # ==========================================

    def atualizar_usuario(self, usuario_id):

        try:

            dados = request.get_json() or {}

            service = AtualizarUsuarioService()

            usuario = service.executar(
                usuario_id,
                dados
            )

            if usuario is None:

                return jsonify({
                    "erro": "Usuário não encontrado."
                }), 404

            return jsonify(usuario), 200

        except ValueError as erro:

            return jsonify({
                "erro": str(erro)
            }), 400

        except SQLAlchemyError:

            db.session.rollback()

            return jsonify({
                "erro": "Erro ao atualizar usuário no banco de dados."
            }), 500

    # ==========================================
    # DELETAR USUÁRIO
    # ==========================================

    def deletar_usuario(self, usuario_id):

        try:

            service = DeletarUsuarioService()

            usuario_deletado = service.executar(
                usuario_id
            )

            if usuario_deletado is False:

                return jsonify({
                    "erro": "Usuário não encontrado."
                }), 404

            return "", 204

        except SQLAlchemyError:

            db.session.rollback()

            return jsonify({
                "erro": "Erro ao deletar usuário no banco de dados."
            }), 500

    # ==========================================
    # BUSCAR USUÁRIO POR NOME
    # ==========================================

    def buscar_usuario_por_nome(self):

        nome = request.args.get("nome")

        try:

            service = BuscarUsuarioPorNomeService()

            usuarios = service.executar(nome)

            return jsonify(usuarios), 200

        except ValueError as erro:

            return jsonify({
                "erro": str(erro)
            }), 400


# ==========================================
# INSTÂNCIA DO CONTROLLER
# ==========================================

usuario_controller = UsuarioController()