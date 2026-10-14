from models.usuario import Usuario


class DeletarUsuarioService:
    def executar(self, usuario_id):

        usuario = Usuario.buscar_por_id(usuario_id)

        if usuario is None:
            return False

        usuario.deletar()

        return True