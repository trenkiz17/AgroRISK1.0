// =======================================
// VARIÁVEIS GLOBAIS
// =======================================

let propriedadeEditando = null;

let map;

let drawnItems;

let area = 0;

let perimetro = 0;

let geojson = null;

let latitude = null;

let longitude = null;

// =======================================
// INICIAR
// =======================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        iniciarMapa();

        iniciarEventos();

        const params =
            new URLSearchParams(
                window.location.search
            );

        const id =
            params.get("id");

        // ==================================
        // SE EXISTIR ID, ESTÁ EDITANDO
        // ==================================

        if (id) {

            await carregarPropriedadeEdicao(
                id
            );

        }

    }
);

// =======================================
// CARREGAR PROPRIEDADE PARA EDIÇÃO
// =======================================

async function carregarPropriedadeEdicao(id) {

    try {

        const propriedade =
            await buscarPropriedade(id);

        if (!propriedade) {

            alert(
                "Propriedade não encontrada."
            );

            return;

        }

        propriedadeEditando =
            propriedade;

        // ==================================
        // PREENCHER CAMPOS
        // ==================================

        document.getElementById(
            "nome"
        ).value =
            propriedade.nome || "";

        document.getElementById(
            "cidade"
        ).value =
            propriedade.cidade || "";

        document.getElementById(
            "estado"
        ).value =
            propriedade.estado || "";

        document.getElementById(
            "observacao"
        ).value =
            propriedade.observacao || "";

        // ==================================
        // CARREGAR DADOS DO MAPA
        // ==================================

        area =
            propriedade.area || 0;

        perimetro =
            propriedade.perimetro || 0;

        latitude =
            propriedade.latitude;

        longitude =
            propriedade.longitude;

        geojson =
            propriedade.geojson;

        // ==================================
        // DESENHAR ÁREA EXISTENTE
        // ==================================

        if (geojson) {

            const layer =
                L.geoJSON(
                    JSON.parse(geojson)
                );

            layer.eachLayer(
                camada => {

                    drawnItems.addLayer(
                        camada
                    );

                }
            );

            if (
                layer.getBounds().isValid()
            ) {

                map.fitBounds(
                    layer.getBounds()
                );

            }

        }

        // ==================================
        // ATUALIZAR RESUMO
        // ==================================

        atualizarResumo();

        // ==================================
        // ALTERAR TEXTOS PARA EDIÇÃO
        // ==================================

        const titulo =
            document.querySelector(
                ".property-header h1"
            );

        if (titulo) {

            titulo.innerHTML =
                `
                <i class="fa-solid fa-map-location-dot"></i>
                Editar Propriedade
                `;

        }

        const botao =
            document.getElementById(
                "salvar"
            );

        if (botao) {

            botao.innerHTML =
                `
                <i class="fa-solid fa-floppy-disk"></i>
                Salvar Alterações
                `;

        }

    }

    catch (erro) {

        console.error(erro);

        alert(
            "Erro ao carregar a propriedade."
        );

    }

}

// =======================================
// MAPA
// =======================================

function iniciarMapa() {

    map =
        L.map("map").setView(
            [-19.9167, -43.9345],
            12
        );

    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {

            attribution:
                "&copy; OpenStreetMap"

        }
    ).addTo(map);

    drawnItems =
        new L.FeatureGroup();

    map.addLayer(
        drawnItems
    );

    const drawControl =
        new L.Control.Draw({

            edit: {

                featureGroup:
                    drawnItems

            },

            draw: {

                polygon: true,

                rectangle: true,

                marker: false,

                polyline: false,

                circle: false,

                circlemarker: false

            }

        });

    map.addControl(
        drawControl
    );

    map.on(
        L.Draw.Event.CREATED,
        desenharArea
    );

    // ==================================
    // QUANDO EDITAR O DESENHO EXISTENTE
    // ==================================

    map.on(
        L.Draw.Event.EDITED,
        function (e) {

            e.layers.eachLayer(
                layer => {

                    atualizarDadosDaCamada(
                        layer
                    );

                }
            );

        }
    );

}

// =======================================
// DESENHAR ÁREA
// =======================================

function desenharArea(e) {

    drawnItems.clearLayers();

    const layer =
        e.layer;

    drawnItems.addLayer(
        layer
    );

    atualizarDadosDaCamada(
        layer
    );

}

// =======================================
// ATUALIZAR DADOS DA ÁREA
// =======================================

function atualizarDadosDaCamada(
    layer
) {

    geojson =
        JSON.stringify(
            layer.toGeoJSON()
        );

    const latlngs =
        layer.getLatLngs()[0];

    area =
        (
            L.GeometryUtil.geodesicArea(
                latlngs
            ) / 10000
        ).toFixed(2);

    perimetro =
        calcularPerimetro(
            latlngs
        );

    const centro =
        layer
            .getBounds()
            .getCenter();

    latitude =
        centro.lat;

    longitude =
        centro.lng;

    atualizarResumo();

}

// =======================================
// RESUMO
// =======================================

function atualizarResumo() {

    const elementoArea =
        document.getElementById(
            "area"
        );

    const elementoPerimetro =
        document.getElementById(
            "perimetro"
        );

    if (elementoArea) {

        elementoArea.textContent =
            area
                ? area + " ha"
                : "Ainda não calculada";

    }

    if (elementoPerimetro) {

        elementoPerimetro.textContent =
            perimetro
                ? perimetro + " m"
                : "Ainda não calculado";

    }

}

// =======================================
// PERÍMETRO
// =======================================

function calcularPerimetro(
    latlngs
) {

    let distancia = 0;

    for (
        let i = 0;
        i < latlngs.length;
        i++
    ) {

        const atual =
            latlngs[i];

        const proximo =
            latlngs[
                (i + 1) %
                latlngs.length
            ];

        distancia +=
            atual.distanceTo(
                proximo
            );

    }

    return distancia.toFixed(2);

}

// =======================================
// EVENTOS
// =======================================

function iniciarEventos() {

    const btnPesquisar =
        document.getElementById(
            "btnPesquisar"
        );

    if (btnPesquisar) {

        btnPesquisar.addEventListener(
            "click",
            pesquisarLocal
        );

    }

    const btnSalvar =
        document.getElementById(
            "salvar"
        );

    if (btnSalvar) {

        btnSalvar.addEventListener(
            "click",
            salvarPropriedade
        );

    }

    const btnLimpar =
        document.getElementById(
            "limparMapa"
        );

    if (btnLimpar) {

        btnLimpar.addEventListener(
            "click",
            limparMapa
        );

    }

}

// =======================================
// LIMPAR
// =======================================

function limparMapa() {

    drawnItems.clearLayers();

    area = 0;

    perimetro = 0;

    latitude = null;

    longitude = null;

    geojson = null;

    atualizarResumo();

}

// =======================================
// SALVAR / ATUALIZAR
// =======================================

async function salvarPropriedade() {

    try {

        // ==================================
        // VALIDAÇÕES
        // ==================================

        const nome =
            document
                .getElementById("nome")
                .value
                .trim();

        const cidade =
            document
                .getElementById("cidade")
                .value
                .trim();

        const estado =
            document
                .getElementById("estado")
                .value
                .trim();

        const observacao =
            document
                .getElementById("observacao")
                .value
                .trim();

        if (!nome) {

            alert(
                "Informe o nome da propriedade."
            );

            return;

        }

        if (!cidade) {

            alert(
                "Informe a cidade."
            );

            return;

        }

        if (!estado) {

            alert(
                "Informe o estado."
            );

            return;

        }

        if (!geojson) {

            alert(
                "Desenhe a propriedade no mapa."
            );

            return;

        }

        // ==================================
        // OBJETO DA PROPRIEDADE
        // ==================================

        const propriedade = {

            nome: nome,

            cidade: cidade,

            estado: estado,

            observacao:
                observacao,

            area: area,

            perimetro:
                perimetro,

            latitude:
                latitude,

            longitude:
                longitude,

            geojson:
                geojson

        };

        let resposta;

        // ==================================
        // EDITAR PROPRIEDADE EXISTENTE
        // ==================================

        if (propriedadeEditando) {

            resposta =
                await atualizarPropriedade(
                    propriedadeEditando.id,
                    propriedade
                );

            if (!resposta) {

                alert(
                    "Erro ao atualizar a propriedade."
                );

                return;

            }

            alert(
                "Propriedade atualizada com sucesso!"
            );

            window.location.href =
                "monitoramento.html?id=" +
                propriedadeEditando.id;

            return;

        }

        // ==================================
        // CADASTRAR NOVA PROPRIEDADE
        // ==================================

        resposta =
            await cadastrarPropriedade(
                propriedade
            );

        if (!resposta) {

            alert(
                "Erro ao cadastrar a propriedade."
            );

            return;

        }

        alert(
            "Propriedade cadastrada com sucesso!"
        );

        window.location.href =
            "monitoramento.html?id=" +
            resposta.id;

    }

    catch (erro) {

        console.error(
            "Erro ao salvar propriedade:",
            erro
        );

        alert(
            "Erro ao salvar a propriedade."
        );

    }

}

// =======================================
// PESQUISAR LOCAL
// =======================================

async function pesquisarLocal() {

    const local =
        prompt(
            "Digite a cidade, estado ou endereço:"
        );

    if (!local) return;

    try {

        const resposta =
            await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(local)}`
            );

        const dados =
            await resposta.json();

        if (
            dados.length === 0
        ) {

            alert(
                "Local não encontrado."
            );

            return;

        }

        const resultado =
            dados[0];

        map.setView(
            [
                parseFloat(
                    resultado.lat
                ),

                parseFloat(
                    resultado.lon
                )
            ],
            13
        );

    }

    catch (erro) {

        console.error(
            erro
        );

        alert(
            "Erro ao pesquisar local."
        );

    }

}