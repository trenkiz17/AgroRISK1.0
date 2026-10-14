from repositories.usuario_repository import UsuarioRepository


class BuscarUsuarioPorNomeService:

    def executar(self, nome):

        if not nome:
            raise ValueError("Informe o nome para realizar a busca.")

        usuarios = UsuarioRepository.buscar_por_nome(nome)

        return [
            usuario.to_dict()
            for usuario in usuarios
        ]