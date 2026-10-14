
// ==========================================
// AGRORISK - MONITORAMENTO DA PROPRIEDADE
// ==========================================

let mapaMonitoramento = null;


// ==========================================
// FUNÇÕES AUXILIARES
// ==========================================

function textoMonitor(id, valor) {

    const elemento = document.getElementById(id);

    if (elemento) {
        elemento.textContent = valor;
    }
}


function mostrarErroMonitoramento(mensagem) {

    let aviso = document.getElementById("avisoMonitoramento");

    if (!aviso) {

        aviso = document.createElement("div");

        aviso.id = "avisoMonitoramento";

        aviso.className = "alert alert-warning mb-4";

        aviso.setAttribute("role", "alert");

        document.querySelector(
            ".monitor-section .container"
        )?.prepend(aviso);
    }

    aviso.textContent = mensagem;
}


function numeroFormatado(valor, sufixo = "") {

    if (
        valor === null ||
        valor === undefined ||
        valor === ""
    ) {
        return "—";
    }

    const numero = Number(valor);

    if (!Number.isFinite(numero)) {
        return "—";
    }

    return numero.toLocaleString("pt-BR", {
        maximumFractionDigits: 2
    }) + sufixo;
}


function formatarDataMonitor(valor) {

    if (!valor) {
        return "Não informado";
    }

    const data = String(valor);

    if (/^\d{4}-\d{2}-\d{2}/.test(data)) {

        const [ano, mes, dia] = data
            .slice(0, 10)
            .split("-");

        return `${dia}/${mes}/${ano}`;
    }

    return data;
}


// ==========================================
// CRIAR MAPA
// ==========================================

function iniciarMapaMonitoramento() {

    if (typeof L === "undefined") {

        mostrarErroMonitoramento(
            "O mapa não carregou. Verifique a conexão com o Leaflet."
        );

        return;
    }

    // Visão inicial do Brasil.
    // Depois o mapa será centralizado na propriedade.

    mapaMonitoramento = L.map("map").setView(
        [-14.235, -51.925],
        4
    );

    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            maxZoom: 19,
            attribution: "&copy; OpenStreetMap contributors"
        }
    ).addTo(mapaMonitoramento);
}


// ==========================================
// LOCALIZAR A PROPRIEDADE NO MAPA
// ==========================================

function localizarPropriedadeNoMapa(propriedade) {

    if (!mapaMonitoramento) {
        return;
    }

    let areaDesenhada = false;


    // DESENHAR A ÁREA DEMARCADA

    if (propriedade.geojson) {

        try {

            const dados =
                typeof propriedade.geojson === "string"
                    ? JSON.parse(propriedade.geojson)
                    : propriedade.geojson;

            const camada = L.geoJSON(dados)
                .addTo(mapaMonitoramento);

            const limites = camada.getBounds();

            if (limites.isValid()) {

                mapaMonitoramento.fitBounds(
                    limites,
                    {
                        padding: [30, 30]
                    }
                );

                areaDesenhada = true;
            }

        } catch (erro) {

            console.error(
                "Erro ao desenhar GeoJSON:",
                erro
            );
        }
    }


    // SE NÃO EXISTIR POLÍGONO, USAR LAT/LON

    if (
        !areaDesenhada &&
        propriedade.latitude != null &&
        propriedade.longitude != null
    ) {

        const latitude = Number(propriedade.latitude);
        const longitude = Number(propriedade.longitude);

        if (
            Number.isFinite(latitude) &&
            Number.isFinite(longitude) &&
            latitude >= -90 &&
            latitude <= 90 &&
            longitude >= -180 &&
            longitude <= 180
        ) {

            mapaMonitoramento.setView(
                [latitude, longitude],
                14
            );

            L.marker([latitude, longitude])
                .addTo(mapaMonitoramento);
        }
    }


    // REAJUSTAR O TAMANHO DO MAPA

    setTimeout(() => {

        mapaMonitoramento?.invalidateSize();

    }, 100);
}


// ==========================================
// PREENCHER INFORMAÇÕES DA PROPRIEDADE
// ==========================================

function exibirPropriedadeMonitor(propriedade) {

    textoMonitor(
        "nomePropriedade",
        propriedade.nome || "Propriedade sem nome"
    );

    textoMonitor(
        "cidade",
        propriedade.cidade || "Cidade não informada"
    );

    textoMonitor(
        "estado",
        propriedade.estado || "UF não informada"
    );


    // ÁREA EM HECTARES

    textoMonitor(
        "area",
        numeroFormatado(propriedade.area, " ha")
    );


    // PERÍMETRO EM METROS

    const perimetro = Number(propriedade.perimetro);

    textoMonitor(
        "perimetro",
        Number.isFinite(perimetro) && perimetro > 0
            ? numeroFormatado(perimetro, " m")
            : "—"
    );


    // BOTÃO EDITAR PROPRIEDADE

    const id = encodeURIComponent(propriedade.id);

    const editar = document.getElementById("btnEditar");

    if (editar) {

        editar.href =
            `cadastro_propriedade.html?id=${id}`;
    }


    // BOTÃO NOVA SAFRA

    
    // ==========================================
    // BOTÃO NOVA SAFRA
    // ==========================================

    const criarSafra = document.getElementById(
        "linkNovaSafra"
    );

    if (criarSafra) {

        criarSafra.href =
            `cadastro_safras.html?propriedade_id=${id}`;
    }


    // ==========================================
    // BOTÃO VER SAFRAS DA PROPRIEDADE
    // ==========================================

    const linkVerSafras = document.getElementById(
        "linkVerSafras"
    );

    if (linkVerSafras) {

        linkVerSafras.href =
            `safras.html?propriedade_id=${id}`;
    }


    // ==========================================
    // MAPA
    // ==========================================

    localizarPropriedadeNoMapa(propriedade);
}



// ==========================================
// CRIAR ITEM DE SAFRA
// ==========================================

function adicionarSafraNaLista(container, safra) {

    const item = document.createElement("li");

    const ponto = document.createElement("span");

    ponto.className = "dot";


    const conteudo = document.createElement("div");

    conteudo.className = "monitor-safra-conteudo";


    // NOME

    const titulo = document.createElement("strong");

    titulo.textContent =
        safra.nome ||
        safra.cultura ||
        `Safra #${safra.id}`;


    // INFORMAÇÕES

    const detalhe = document.createElement("small");

    detalhe.textContent = [

        safra.cultura
            ? `Cultura: ${safra.cultura}`
            : null,

        `Plantio: ${formatarDataMonitor(safra.data_plantio)}`,

        safra.status
            ? `Status: ${safra.status}`
            : null

    ].filter(Boolean).join(" • ");


    // EDITAR SAFRA

    const editar = document.createElement("a");

    editar.className = "monitor-link-safra";

    editar.href =
        `cadastro_safras.html?id=${encodeURIComponent(safra.id)}`;

    editar.textContent = "Editar safra";


    conteudo.append(titulo, detalhe, editar);

    item.append(ponto, conteudo);

    container.appendChild(item);
}


// ==========================================
// CARREGAR SAFRAS DA PROPRIEDADE
// ==========================================

async function carregarSafrasMonitoramento(propriedadeId) {

    const lista = document.getElementById(
        "historicoSafras"
    );

    if (!lista) {
        return;
    }


    // CONSULTA REAL À API

    const resultado = await listarSafrasDaPropriedade(
        propriedadeId
    );


    if (!Array.isArray(resultado)) {

        lista.replaceChildren();

        lista.classList.add("sem-registros");

        const erro = document.createElement("li");

        erro.textContent =
            "Não foi possível consultar as safras desta propriedade.";

        lista.appendChild(erro);

        mostrarErroMonitoramento(
            "As informações da propriedade carregaram, mas a consulta de safras falhou."
        );

        return;
    }


    // GARANTIR QUE AS SAFRAS PERTENCEM
    // À PROPRIEDADE SELECIONADA

    const safras = resultado
        .filter(
            safra =>
                String(safra.propriedade_id) ===
                String(propriedadeId)
        )
        .sort(
            (a, b) => Number(b.id) - Number(a.id)
        );


    // CONTADOR DE SAFRAS

    textoMonitor(
        "totalSafrasPropriedade",
        String(safras.length)
    );


    // LIMPAR HISTÓRICO ANTERIOR

    lista.replaceChildren();

    lista.classList.toggle(
        "sem-registros",
        safras.length === 0
    );


    // NENHUMA SAFRA

    if (!safras.length) {

        textoMonitor(
            "ultimaSafraNome",
            "Nenhuma safra cadastrada"
        );

        textoMonitor("plantio", "—");

        textoMonitor("statusSafra", "—");


        const vazio = document.createElement("li");

        vazio.textContent =
            "Nenhuma safra cadastrada nesta propriedade.";

        lista.appendChild(vazio);

        return;
    }


    // ======================================
    // SAFRA MAIS RECENTE
    // ======================================

    const recente = safras[0];

    textoMonitor(
        "ultimaSafraNome",
        recente.nome ||
        recente.cultura ||
        `Safra #${recente.id}`
    );

    textoMonitor(
        "plantio",
        formatarDataMonitor(recente.data_plantio)
    );

    textoMonitor(
        "statusSafra",
        recente.status || "Não informado"
    );


    // ======================================
    // HISTÓRICO REAL DE SAFRAS
    // ======================================

    safras.forEach(safra => {

        adicionarSafraNaLista(
            lista,
            safra
        );

    });
}


// ==========================================
// CLIMA REAL DA PROPRIEDADE (OPENWEATHER)
// ==========================================

async function carregarClimaMonitoramento(propriedade) {
    const lat = Number(propriedade.latitude);
    const lon = Number(propriedade.longitude);

    if (
        propriedade.latitude == null || propriedade.longitude == null ||
        !Number.isFinite(lat) || !Number.isFinite(lon) ||
        lat < -90 || lat > 90 || lon < -180 || lon > 180
    ) {
        textoMonitor("situacaoClima",
            "Cadastre latitude e longitude da propriedade para consultar o clima.");
        textoMonitor("situacaoPrevisao", "Previsão indisponível sem coordenadas.");
        return;
    }

    textoMonitor("situacaoClima", "Consultando clima atual...");
    const clima = await buscarClima(lat, lon);
    if (!clima) {
        textoMonitor("situacaoClima", "Falha ao consultar o clima. Verifique a chave OPENWEATHER_API_KEY e a conexão.");
        textoMonitor("situacaoPrevisao", "Previsão não consultada: clima atual indisponível.");
        return;
    }

    textoMonitor("temperatura", numeroFormatado(clima.temperatura, " °C"));
    textoMonitor("umidade", numeroFormatado(clima.umidade, "%"));
    textoMonitor("vento", numeroFormatado(clima.vento_velocidade, " m/s"));
    textoMonitor("chuva", numeroFormatado(clima.chuva_ultima_hora, " mm"));
    textoMonitor("indicadorVPD",
        numeroFormatado(clima.deficit_pressao_vapor_kpa, " kPa"));

    let horario = "";
    if (clima.medicao_em_unix != null) {
        const data = new Date(Number(clima.medicao_em_unix) * 1000);
        if (!Number.isNaN(data.getTime())) {
            horario = ` • medição: ${data.toLocaleString("pt-BR")}`;
        }
    }
    textoMonitor("situacaoClima",
        `${clima.descricao || "Condição atual"}${horario} • Fonte: OpenWeather`);

    textoMonitor("situacaoPrevisao", "Consultando previsão...");
    const dadosPrevisao = await buscarPrevisaoClima(lat, lon);
    const dias = Array.isArray(dadosPrevisao?.previsao) ? dadosPrevisao.previsao : [];
    if (!dias.length) {
        textoMonitor("situacaoPrevisao", "Previsão indisponível no momento.");
        return;
    }

    const campos = ["hojeTemp", "amanhaTemp", "dia2Temp", "dia3Temp"];
    const etiquetas = ["Hoje", "Amanhã", "+2 dias", "+3 dias"];
    campos.forEach((id, indice) => {
        const dia = dias[indice];
        textoMonitor(id, dia ? numeroFormatado(dia.temperatura_maxima, " °C") : "—");
        const card = document.getElementById(id)?.closest(".forecast-card");
        const titulo = card?.querySelector("h5");
        if (titulo) {
            if (!dia) {
                titulo.textContent = etiquetas[indice];
            } else {
                const diff = Math.round((
                    Date.parse(dia.data + "T00:00:00Z") -
                    Date.parse(dadosPrevisao.data_local_hoje + "T00:00:00Z")
                ) / 86400000);
                const etiqueta = diff === 0 ? "Hoje"
                    : diff === 1 ? "Amanhã"
                    : Number.isInteger(diff) && diff > 1 ? `+${diff} dias`
                    : "Previsão";
                titulo.textContent =
                    `${etiqueta} • ${dia.data.slice(8, 10)}/${dia.data.slice(5, 7)}`;
            }
        }
    });
    textoMonitor("situacaoPrevisao",
        "Máximas previstas para os dias indicados • Fonte: OpenWeather (estimativa, não medição).");
}


// ==========================================
// INICIAR MONITORAMENTO
// ==========================================

document.addEventListener("DOMContentLoaded", async () => {

    // VERIFICAR USUÁRIO LOGADO

    const usuario = obterUsuarioLogado();

    if (!usuario?.id) {

        window.location.href = "login.html";

        return;
    }


    // OBTER ID DA PROPRIEDADE

    const propriedadeId = new URLSearchParams(
        window.location.search
    ).get("id");


    if (
        !propriedadeId ||
        !/^\d+$/.test(propriedadeId)
    ) {

        textoMonitor(
            "nomePropriedade",
            "Propriedade não selecionada"
        );

        mostrarErroMonitoramento(
            "Escolha uma propriedade em Minhas Propriedades para acessar o monitoramento."
        );

        return;
    }


    // INICIAR MAPA

    iniciarMapaMonitoramento();


    // BUSCAR PROPRIEDADE PELA API

    const propriedade = await buscarPropriedade(
        propriedadeId
    );


    if (
        !propriedade ||
        String(propriedade.usuario_id) !== String(usuario.id)
    ) {

        textoMonitor(
            "nomePropriedade",
            "Propriedade indisponível"
        );

        mostrarErroMonitoramento(
            "Não foi possível carregar essa propriedade."
        );

        return;
    }


    // EXIBIR PROPRIEDADE E MAPA

    exibirPropriedadeMonitor(propriedade);

    // Clima é opcional: não impede carregar as safras.
    carregarClimaMonitoramento(propriedade).catch(erro => {
        console.error("Erro no painel de clima:", erro);
        textoMonitor("situacaoClima", "Clima indisponível no momento.");
    });


    // CARREGAR SAFRAS

    await carregarSafrasMonitoramento(
        propriedadeId
    );

})
