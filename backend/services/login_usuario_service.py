from models.usuario import Usuario
from models.database import db
from hmac import compare_digest
from werkzeug.security import check_password_hash, generate_password_hash


class LoginUsuarioService:

    def executar(self, dados):

        email = dados.get("email")
        senha = dados.get("senha")

        if not email or not senha:
            raise ValueError("E-mail e senha são obrigatórios.")

        usuario = Usuario.buscar_por_email(email)

        if usuario is None:
            raise ValueError("E-mail ou senha inválidos.")

        senha_salva = usuario.senha or ""
        conta_com_hash = senha_salva.startswith(("scrypt:", "pbkdf2:"))

        # Contas novas: verificacao do hash; contas antigas: texto simples
        # aceito temporariamente para permitir migracao no primeiro login.
        if conta_com_hash:
            senha_valida = check_password_hash(senha_salva, senha)
        else:
            senha_valida = compare_digest(senha_salva, senha)

        if not senha_valida:
            raise ValueError("E-mail ou senha inválidos.")

        # Converte o registro antigo sem obrigar o usuario a trocar a senha.
        # Necessario fazer backup antes de executar em um banco existente.
        if not conta_com_hash:
            usuario.senha = generate_password_hash(senha)
            db.session.commit()

        return {
            "id": usuario.id,
            "nome": usuario.nome,
            "email": usuario.email
        }