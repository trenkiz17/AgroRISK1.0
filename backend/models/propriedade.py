from models.database import db


class Propriedade(db.Model):

    __tablename__ = "propriedades"

    # ==========================================
    # IDENTIFICAÇÃO
    # ==========================================

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    usuario_id = db.Column(
        db.Integer,
        db.ForeignKey("usuarios.id"),
        nullable=False
    )

    # ==========================================
    # DADOS DA PROPRIEDADE
    # ==========================================

    nome = db.Column(
        db.String(100),
        nullable=False
    )

    cidade = db.Column(
        db.String(100),
        nullable=False
    )

    estado = db.Column(
        db.String(100),
        nullable=False
    )

    observacao = db.Column(
        db.Text,
        nullable=True
    )

    area = db.Column(
        db.Float,
        nullable=False
    )

    perimetro = db.Column(
        db.Float,
        nullable=False,
        default=0
    )

    latitude = db.Column(
        db.Float,
        nullable=True
    )

    longitude = db.Column(
        db.Float,
        nullable=True
    )

    geojson = db.Column(
        db.Text,
        nullable=True
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
        cidade=None,
        estado=None,
        observacao=None,
        area=None,
        perimetro=None,
        latitude=None,
        longitude=None,
        geojson=None
    ):

        if nome is not None:
            self.nome = nome

        if cidade is not None:
            self.cidade = cidade

        if estado is not None:
            self.estado = estado

        if observacao is not None:
            self.observacao = observacao

        if area is not None:
            self.area = area

        if perimetro is not None:
            self.perimetro = perimetro

        if latitude is not None:
            self.latitude = latitude

        if longitude is not None:
            self.longitude = longitude

        if geojson is not None:
            self.geojson = geojson

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
            Propriedade.query
            .order_by(Propriedade.id.asc())
            .all()
        )

    @staticmethod
    def buscar_por_id(id):

        return Propriedade.query.get(id)

    # ==========================================
    # JSON
    # ==========================================

    def to_dict(self):

        return {

            "id":
                self.id,

            "usuario_id":
                self.usuario_id,

            "nome":
                self.nome,

            "cidade":
                self.cidade,

            "estado":
                self.estado,

            "observacao":
                self.observacao,

            "area":
                float(self.area)
                if self.area is not None
                else 0,

            "perimetro":
                float(self.perimetro)
                if self.perimetro is not None
                else 0,

            "latitude":
                self.latitude,

            "longitude":
                self.longitude,

            "geojson":
                self.geojson
        }