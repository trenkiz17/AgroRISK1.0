
from datetime import date

from models.usuario import Usuario


class AtualizarUsuarioService:

    def executar(self, usuario_id, dados):

        usuario = Usuario.buscar_por_id(usuario_id)

        if usuario is None:
            return None

        # Validar nome
        nome = str(
            dados.get("nome", usuario.nome) or ""
        ).strip()

        if not nome:
            raise ValueError("O nome é obrigatório.")

        if len(nome) > 100:
            raise ValueError("O nome é muito longo.")

        # Validar e-mail
        email = str(
            dados.get("email", usuario.email) or ""
        ).strip().lower()

        if not email or "@" not in email:
            raise ValueError("Informe um e-mail válido.")

        if len(email) > 120:
            raise ValueError("O e-mail é muito longo.")

        outro_usuario = Usuario.buscar_por_email(email)

        if outro_usuario and outro_usuario.id != usuario.id:
            raise ValueError(
                "Este e-mail já está cadastrado em outra conta."
            )

        # Atualizar dados principais
        usuario.nome = nome
        usuario.email = email

        # Atualizar campos opcionais
        campos_opcionais = [
            "telefone",
            "cpf",
            "estado",
            "cidade",
            "idioma"
        ]

        for nome_campo in campos_opcionais:

            if nome_campo in dados:

                valor = dados[nome_campo]

                if valor is not None:
                    valor = str(valor).strip()

                setattr(usuario, nome_campo, valor or None)

        # Validar telefone
        if usuario.telefone:
            numeros = "".join(
                caractere
                for caractere in usuario.telefone
                if caractere.isdigit()
            )

            if len(numeros) not in (10, 11):
                raise ValueError(
                    "O telefone deve conter DDD e 8 ou 9 dígitos."
                )

        # Validar CPF
        if usuario.cpf:
            numeros = "".join(
                caractere
                for caractere in usuario.cpf
                if caractere.isdigit()
            )

            if len(numeros) != 11:
                raise ValueError(
                    "O CPF deve conter 11 dígitos."
                )

        # Converter data de nascimento
        if "data_nascimento" in dados:

            data_recebida = dados["data_nascimento"]

            if not data_recebida:
                usuario.data_nascimento = None

            else:
                try:
                    data_convertida = date.fromisoformat(
                        data_recebida
                    )
                except (ValueError, TypeError):
                    raise ValueError(
                        "Data de nascimento inválida."
                    )

                if data_convertida > date.today():
                    raise ValueError(
                        "A data de nascimento não pode estar no futuro."
                    )

                usuario.data_nascimento = data_convertida

        # O Model realiza o commit no MySQL
        usuario.atualizar()

        return usuario.to_dict()
