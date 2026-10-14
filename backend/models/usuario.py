from models.database import db



class Usuario(db.Model):

    __tablename__ = "usuarios"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    nome = db.Column(
        db.String(100),
        nullable=False
    )

    email = db.Column(
        db.String(120),
        unique=True,
        nullable=False
    )

    senha = db.Column(
        db.String(255),
        nullable=False
    )

    telefone = db.Column(
        db.String(20),
        nullable=True
    )

    cpf = db.Column(
        db.String(14),
        nullable=True
    )

    data_nascimento = db.Column(
        db.Date,
        nullable=True
    )

    estado = db.Column(
        db.String(100),
        nullable=True
    )

    cidade = db.Column(
        db.String(100),
        nullable=True
    )

    idioma = db.Column(
        db.String(50),
        nullable=True,
        default="Português"
    )

    # ==========================================
    # CREATE
    # ==========================================

    def salvar(self):

        db.session.add(self)

        db.session.commit()

    # ==========================================
    # UPDATE
    # ==========================================

    def atualizar(
        self,
        nome=None,
        email=None,
        senha=None,
        telefone=None,
        cpf=None,
        data_nascimento=None,
        estado=None,
        cidade=None,
        idioma=None
    ):

        if nome is not None:
            self.nome = nome

        if email is not None:
            self.email = email

        if senha is not None:
            self.senha = senha

        if telefone is not None:
            self.telefone = telefone

        if cpf is not None:
            self.cpf = cpf

        if data_nascimento is not None:
            self.data_nascimento = data_nascimento

        if estado is not None:
            self.estado = estado

        if cidade is not None:
            self.cidade = cidade

        if idioma is not None:
            self.idioma = idioma

        db.session.commit()

    # ==========================================
    # DELETE
    # ==========================================

    def deletar(self):

        db.session.delete(self)

        db.session.commit()

    # ==========================================
    # READ
    # ==========================================

    @staticmethod
    def listar_todos():

        return (
            Usuario.query
            .order_by(Usuario.id.asc())
            .all()
        )

    # ==========================================

    @staticmethod
    def buscar_por_id(id):

        return Usuario.query.get(id)

    # ==========================================

    @staticmethod
    def buscar_por_email(email):

        return Usuario.query.filter_by(
            email=email
        ).first()

    # ==========================================
    # JSON
    # ==========================================

    def to_dict(self):

        return {

            "id": self.id,

            "nome": self.nome,

            "email": self.email,

            "telefone": self.telefone,

            "cpf": self.cpf,

            "data_nascimento":
                self.data_nascimento.isoformat()
                if self.data_nascimento else None,

            "estado": self.estado,

            "cidade": self.cidade,

            "idioma": self.idioma

        }