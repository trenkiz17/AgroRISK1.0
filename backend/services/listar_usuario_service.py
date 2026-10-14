from models.usuario import Usuario


class ListarUsuariosService:
    def executar(self):
        usuarios = Usuario.listar_todos()

        return [usuario.to_dict() for usuario in usuarios]