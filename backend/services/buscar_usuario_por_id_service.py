from models.usuario import Usuario


class BuscarUsuarioPorIdService:
    def executar(self, usuario_id):

        usuario = Usuario.buscar_por_id(usuario_id)

        if usuario is None:
            return None

        return usuario.to_dict()