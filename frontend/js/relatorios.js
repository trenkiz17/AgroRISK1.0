// =============================================
// RELATÓRIO INDIVIDUAL DA SAFRA - AGRO RISK
// =============================================


// =============================================
// INICIAR
// =============================================



// Nome das propriedades carregadas do MySQL
let mapaPropriedadesRelatorios = new Map();
// Indicadores da consulta atual, usados também no PDF.
let climaRelatorioAtual = {carregando: false, resumo: "Consulta ainda não realizada"};


document.addEventListener(
    "DOMContentLoaded",
    carregarRelatorioSafra
);


// =============================================
// CARREGAR RELATÓRIO DA SAFRA
// =============================================


async function carregarRelatorioSafra() {

    const selecionarPropriedade = document.getElementById(
        "filtroPropriedadeRelatorio"
    );

    const selecionarSafra = document.getElementById(
        "filtroSafraRelatorio"
    );

    const botaoVisualizar = document.getElementById(
        "btnVisualizarRelatorio"
    );

    const aviso = document.getElementById(
        "avisoSelecaoRelatorio"
    );

    const carregando = document.getElementById(
        "carregandoRelatorio"
    );

    const conteudo = document.getElementById(
        "conteudoRelatorio"
    );

    const erroTela = document.getElementById(
        "erroRelatorio"
    );

    const parametros = new URLSearchParams(
        window.location.search
    );

    const idSafraUrl = parametros.get("id");

    const propriedadeIdUrl = parametros.get(
        "propriedade_id"
    );

    try {

        // ======================================
        // 1. CONSULTAR MYSQL POR MEIO DO FLASK
        // ======================================

        const respostaPropriedades =
            await listarPropriedades();

        const respostaSafras =
            await listarSafras();

        const propriedades = Array.isArray(
            respostaPropriedades
        )
            ? respostaPropriedades
            : respostaPropriedades?.data;

        const todasSafras = Array.isArray(
            respostaSafras
        )
            ? respostaSafras
            : respostaSafras?.data;

        if (
            !Array.isArray(propriedades) ||
            !Array.isArray(todasSafras)
        ) {
            throw new Error(
                "Não foi possível carregar as propriedades e safras."
            );
        }

        // ======================================
        // 2. ASSOCIAR ID AO NOME DA PROPRIEDADE
        // ======================================

        mapaPropriedadesRelatorios = new Map(
            propriedades.map(propriedade => [
                String(propriedade.id),
                propriedade
            ])
        );

        // Somente safras associadas às
        // propriedades retornadas para o usuário.

        const safras = todasSafras.filter(
            safra => mapaPropriedadesRelatorios.has(
                String(safra.propriedade_id)
            )
        );

        // ======================================
        // 3. PREENCHER PROPRIEDADES
        // ======================================

        selecionarPropriedade.replaceChildren(
            new Option(
                "Selecione uma propriedade",
                ""
            )
        );

        propriedades.forEach(propriedade => {

            selecionarPropriedade.add(
                new Option(
                    propriedade.nome,
                    String(propriedade.id)
                )
            );

        });

        // ======================================
        // 4. PREENCHER SAFRAS DA PROPRIEDADE
        // ======================================

        function preencherSafras(
            propriedadeId,
            safraIdSelecionada = ""
        ) {

            selecionarSafra.replaceChildren(
                new Option(
                    "Selecione uma safra",
                    ""
                )
            );

            const safrasDaPropriedade = safras.filter(
                safra =>
                    String(safra.propriedade_id) ===
                    String(propriedadeId)
            );

            safrasDaPropriedade.forEach(safra => {

                const descricao =
                    `${safra.nome || "Safra sem nome"} - ` +
                    `${safra.cultura || "Cultura não informada"}`;

                selecionarSafra.add(
                    new Option(
                        descricao,
                        String(safra.id)
                    )
                );

            });

            selecionarSafra.disabled =
                safrasDaPropriedade.length === 0;

            selecionarSafra.value = safraIdSelecionada;

            botaoVisualizar.disabled =
                !selecionarSafra.value;

            if (!propriedadeId) {

                aviso.textContent =
                    "Escolha uma propriedade para ver suas safras.";

            } else if (safrasDaPropriedade.length === 0) {

                aviso.textContent =
                    "Esta propriedade ainda não possui safras cadastradas.";

            } else {

                aviso.textContent =
                    `${safrasDaPropriedade.length} safra(s) disponível(is) nesta propriedade.`;
            }
        }

        // ======================================
        // 5. AÇÕES DOS CAMPOS
        // ======================================

        selecionarPropriedade.onchange = function () {

            preencherSafras(
                selecionarPropriedade.value
            );

            // Esconder relatório anterior quando
            // outra propriedade for escolhida.

            if (conteudo) {
                conteudo.style.display = "none";
            }

            if (erroTela) {
                erroTela.style.display = "none";
            }
        };

        selecionarSafra.onchange = function () {

            botaoVisualizar.disabled =
                !selecionarSafra.value;
        };

        botaoVisualizar.onclick = function () {

            const id = selecionarSafra.value;

            if (!id) return;

            // Abre a análise da safra escolhida.

            window.location.href =
                "relatorios.html?id=" +
                encodeURIComponent(id);
        };

        // ======================================
        // 6. SE VEIO PELO BOTÃO ANALISAR SAFRA
        // ======================================

        let safraSelecionada = null;

        if (idSafraUrl) {

            safraSelecionada = safras.find(
                safra =>
                    String(safra.id) === String(idSafraUrl)
            );

            if (!safraSelecionada) {

                mostrarErro(
                    "A safra selecionada não foi encontrada entre as propriedades disponíveis."
                );

                return;
            }
        }

        // ======================================
        // 7. SELEÇÃO INICIAL
        // ======================================

        const propriedadeInicial = safraSelecionada
            ? String(safraSelecionada.propriedade_id)
            : propriedadeIdUrl ||
              (propriedades.length === 1
                  ? String(propriedades[0].id)
                  : "");

        if (
            propriedadeInicial &&
            !mapaPropriedadesRelatorios.has(
                String(propriedadeInicial)
            )
        ) {
            mostrarErro(
                "A propriedade selecionada não foi encontrada."
            );
            return;
        }

        selecionarPropriedade.value =
            propriedadeInicial;

        preencherSafras(
            propriedadeInicial,
            safraSelecionada
                ? String(safraSelecionada.id)
                : ""
        );

        // ======================================
        // 8. EXIBIR RELATÓRIO OU SELETOR
        // ======================================

        if (safraSelecionada) {

            // Dados da safra vêm do MySQL; clima vem do OpenWeather.
            renderizarRelatorio(safraSelecionada);
            configurarBotaoPDF(safraSelecionada);
            configurarFinalizacaoSafra(safraSelecionada);
            await carregarClimaRelatorio(safraSelecionada);

        } else {

            // Entrou pelo menu lateral:
            // mostrar seleção, não mostrar erro.

            if (carregando) {
                carregando.style.display = "none";
            }

            if (conteudo) {
                conteudo.style.display = "none";
            }

            if (erroTela) {
                erroTela.style.display = "none";
            }

            if (propriedades.length === 0) {

                aviso.textContent =
                    "Nenhuma propriedade cadastrada. Cadastre uma propriedade para começar.";
            }
        }

    } catch (erro) {

        console.error(
            "Erro ao carregar relatórios:",
            erro
        );

        if (aviso) {
            aviso.textContent =
                "Erro ao consultar propriedades e safras. Verifique a API Flask.";
        }

        mostrarErro(
            erro.message ||
            "Não foi possível carregar os relatórios."
        );
    }
}




// =============================================
// RENDERIZAR RELATÓRIO
// =============================================

function renderizarRelatorio(safra, preservarClima = false) {

    const nome =
        safra.nome ||
        "Safra sem nome";


    const cultura =
        safra.cultura ||
        "Não informada";


    const area =
        Number(
            safra.area_plantada || 0
        );


    const status =
        obterStatusSafra(
            safra
        );



    const propriedade =
        obterNomePropriedade(
            safra
        );


    const plantio =
        formatarData(
            safra.data_plantio
        );


    const colheita =
        formatarData(
            safra.data_colheita
        );


    // =============================================
    // TÍTULO
    // =============================================

    alterarTexto(
        "nomeSafra",
        nome
    );


    alterarTexto(
        "culturaSafra",
        cultura
    );


    alterarTexto(
        "propriedadeSafra",
        propriedade
    );


    alterarTexto(
        "statusSafra",
        status
    );

    const situacao = AgroRiskIndicadores.situacao(safra);
    const faixa = situacao.janela;
    alterarTexto("janelaColheitaRelatorio", faixa
        ? `${AgroRiskIndicadores.mesAno(faixa.inicio)} a ${AgroRiskIndicadores.mesAno(faixa.fim)}`
        : "Indisponível: informe uma cultura e uma data de plantio válidas.");
    alterarTexto("metodoColheitaRelatorio",
        `${situacao.detalhe} É um intervalo preliminar baseado no ciclo da cultura, não uma previsão meteorológica para anos futuros. ` +
        (String(safra.cultura || "").toLowerCase().includes("caf")
            ? "Para café, a referência é a primeira colheita de uma lavoura nova (3 a 4 anos); um cafezal adulto precisa de outros dados."
            : "A variedade e o manejo podem alterar esse intervalo."));


    alterarTexto(
        "dataPlantio",
        plantio
    );


    alterarTexto(
        "dataColheita",
        colheita
    );


    alterarTexto(
        "areaSafra",
        formatarArea(area)
    );


    // Destacar o intervalo estimado, sem inventar lucro ou produtividade.
    alterarTexto("inicioJanelaSafraDestaque", faixa
        ? `${faixa.inicio.slice(5, 7)}/${faixa.inicio.slice(0, 4)}`
        : "--");
    alterarTexto("fimJanelaSafraDestaque", faixa
        ? `${faixa.fim.slice(5, 7)}/${faixa.fim.slice(0, 4)}`
        : "--");

    // Somente dados que o produtor realmente cadastrou.
    const custo = safra.custo_total;
    alterarTexto("custoInformado", custo != null && custo !== "" &&
        Number.isFinite(Number(custo))
        ? Number(custo).toLocaleString("pt-BR", {style: "currency", currency: "BRL"})
        : "Não informado");
    alterarTexto("observacoesSafra", String(safra.observacoes || "").trim() || "Sem observações cadastradas.");

    // O clima é buscado pela função carregarClimaRelatorio(),
    // que NÃO modifica a data da colheita da safra no banco.
    if (!preservarClima) {
        alterarTexto("previsaoClima", "Consultando...");
        alterarTexto("chuvaClima", "—");
        alterarTexto("temperaturaClima", "—");
        alterarTexto("riscoClima", "Não avaliado");
    }

    const analise = document.getElementById("analiseSafra");
    if (analise) {
        analise.textContent =
            `${situacao.detalhe} ` +
            (faixa ? `A janela preliminar de colheita é de ${AgroRiskIndicadores.mesAno(faixa.inicio)} ` +
                `a ${AgroRiskIndicadores.mesAno(faixa.fim)}. ` : "") +
            "O clima exibido a seguir é atual e de curto prazo, não um histórico de toda a safra. " +
            "O produtor precisa confirmar a maturação e registrar a conclusão da colheita.";
    }

    // =============================================
    // ESCONDER LOADING
    // =============================================

    const loading =
        document.getElementById(
            "carregandoRelatorio"
        );


    if (loading) {

        loading.style.display =
            "none";

    }


    const conteudo =
        document.getElementById(
            "conteudoRelatorio"
        );


    if (conteudo) {

        conteudo.style.display =
            "block";

    }

}



// =============================================
// CONSULTAR CLIMA DO PONTO DA PROPRIEDADE
// =============================================
function numeroClimaRelatorio(numero, unidade = "", casas = 1) {
    const valor = Number(numero);
    return numero !== null && numero !== undefined && numero !== "" &&
        Number.isFinite(valor)
        ? valor.toLocaleString("pt-BR", {maximumFractionDigits: casas}) + unidade
        : "—";
}

async function carregarClimaRelatorio(safra) {
    const propriedade = mapaPropriedadesRelatorios.get(String(safra.propriedade_id));
    const lat = Number(propriedade?.latitude);
    const lon = Number(propriedade?.longitude);
    const fonte = document.getElementById("fonteClimaRelatorio");
    const botaoPDF = document.getElementById("btnGerarPDF");
    if (botaoPDF) botaoPDF.disabled = true;
    climaRelatorioAtual = {carregando: true, resumo: "Consultando OpenWeather"};

    if (!propriedade || propriedade.latitude == null || propriedade.longitude == null ||
        !Number.isFinite(lat) || !Number.isFinite(lon) ||
        lat < -90 || lat > 90 || lon < -180 || lon > 180) {
        if (fonte) fonte.textContent =
            "Sem coordenadas válidas nessa propriedade. Edite o mapa para consultar o OpenWeather.";
        alterarTexto("previsaoClima", "Localização não cadastrada");
        alterarTexto("riscoClima", "Não avaliado");
        climaRelatorioAtual = {carregando: false, resumo: "Clima indisponível: propriedade sem coordenadas"};
        if (botaoPDF) botaoPDF.disabled = false;
        return;
    }

    try {
        const [clima, respostaPrevisao] = await Promise.all([
            buscarClima(lat, lon),
            buscarPrevisaoClima(lat, lon)
        ]);
        const dias = Array.isArray(respostaPrevisao?.previsao)
            ? respostaPrevisao.previsao : [];
        const atual = clima?.descricao || clima?.condicao || "Condição indisponível";
        alterarTexto("previsaoClima", clima ? atual : "Condição atual indisponível");
        alterarTexto("temperaturaClima", numeroClimaRelatorio(clima?.temperatura, " °C"));

        let chuva = null;
        let risco = "Não avaliado (sem previsão disponível)";
        if (dias.length) {
            chuva = dias.reduce((total, dia) =>
                total + (Number(dia.chuva_prevista_mm) || 0), 0);
            const calor = dias.some(d => Number(d.temperatura_maxima) >= 35);
            const muitaChuva = chuva >= 50;
            const alertas = [];
            if (calor) alertas.push("máxima ≥ 35 °C");
            if (muitaChuva) alertas.push("chuva acumulada ≥ 50 mm");
            risco = alertas.length
                ? "Atenção demonstrativa: " + alertas.join("; ")
                : "Sem alertas pelos limiares demonstrativos";
            alterarTexto("chuvaClima", numeroClimaRelatorio(chuva, " mm"));
        } else {
            alterarTexto("chuvaClima", "Previsão indisponível");
        }
        alterarTexto("riscoClima", risco);

        let medicao = "";
        if (clima?.medicao_em_unix != null) {
            const data = new Date(Number(clima.medicao_em_unix) * 1000);
            if (!Number.isNaN(data.getTime())) medicao = ` • Medição: ${data.toLocaleString("pt-BR")}`;
        }
        const descricao =
            `Fonte: OpenWeather • Propriedade: ${propriedade.nome || "não informada"}` +
            `${medicao}. ${dias.length} dia(s) de previsão consultados. ` +
            "Chuva é soma PREVISTA para esses períodos (pode incluir dias incompletos). " +
            "Atenção usa critérios demonstrativos de 35 °C e 50 mm, não um laudo agronômico. " +
            "Os valores são atuais e não foram registrados como histórico climático da safra.";
        if (fonte) fonte.textContent = descricao;
        climaRelatorioAtual = {carregando: false, resumo: descricao};
    } catch (erro) {
        console.error("Falha ao consultar clima no relatório", erro);
        alterarTexto("previsaoClima", "Clima indisponível");
        alterarTexto("chuvaClima", "—");
        alterarTexto("temperaturaClima", "—");
        alterarTexto("riscoClima", "Não avaliado");
        if (fonte) fonte.textContent = "Não foi possível consultar o OpenWeather agora. A safra e a estimativa de calendário continuam disponíveis.";
        climaRelatorioAtual = {carregando: false, resumo: "Clima indisponível no momento"};
    } finally {
        if (botaoPDF) botaoPDF.disabled = false;
    }
}

// =============================================
// FINALIZAR APENAS QUANDO HOUVE COLHEITA
// =============================================
function configurarFinalizacaoSafra(safra) {
    const botao = document.getElementById("btnFinalizarSafra");
    const aviso = document.getElementById("avisoFinalizacaoSafra");
    if (!botao) return;
    const finalizada = AgroRiskIndicadores.situacao(safra).status === "Finalizada";
    botao.style.display = finalizada ? "none" : "";
    if (aviso) aviso.textContent = finalizada
        ? "Finalização registrada no MySQL."
        : "A janela prevista não finaliza a safra automaticamente. Confirme apenas após a colheita.";
    if (finalizada) return;

    botao.onclick = async function () {
        if (!confirm("A colheita desta safra realmente foi concluída? Essa confirmação será salva no banco de dados.")) return;
        botao.disabled = true;
        if (aviso) aviso.textContent = "Gravando conclusão no MySQL...";
        try {
            // AtualizarSafraService exige propriedade_id e recalcula
            // a estimativa com os dados existentes da safra.
            const resposta = await atualizarSafra(safra.id, {
                propriedade_id: safra.propriedade_id,
                status: "Finalizada"
            });
            const atualizada = resposta?.safra || resposta;
            if (!atualizada || String(atualizada.status).toLowerCase() !== "finalizada") {
                if (aviso) aviso.textContent = "Não foi possível confirmar a conclusão. Confira o Flask.";
                return;
            }
            safra.status = "Finalizada";
            renderizarRelatorio(safra, true);
            configurarFinalizacaoSafra(safra);
            if (aviso) aviso.textContent = "Safra finalizada e salva no MySQL.";
        } catch (erro) {
            console.error("Erro ao finalizar safra", erro);
            if (aviso) aviso.textContent = "Falha ao salvar no MySQL. Tente novamente.";
        } finally {
            botao.disabled = false;
        }
    };
}

// =============================================
// BOTÃO GERAR PDF
// =============================================

function configurarBotaoPDF(safra) {

    const botao =
        document.getElementById(
            "btnGerarPDF"
        );


    if (!botao) {

        return;

    }


    botao.onclick = function () {
        gerarPDF(safra);
    };

}



// =============================================
// GERAR PDF
// =============================================

function gerarPDF(safra) {

    if (
        typeof window.jspdf === "undefined"
    ) {

        alert(
            "Não foi possível carregar o gerador de PDF."
        );

        return;

    }


    const {
        jsPDF
    } = window.jspdf;


    const pdf =
        new jsPDF();


    const nome =
        safra.nome ||
        "Safra sem nome";


    const cultura =
        safra.cultura ||
        "Não informada";


    const propriedade =
        obterNomePropriedade(
            safra
        );


    const area =
        Number(
            safra.area_plantada || 0
        );


    const status =
        obterStatusSafra(
            safra
        );



    const plantio =
        formatarData(
            safra.data_plantio
        );


    const colheita =
        formatarData(
            safra.data_colheita
        );


    // =============================================
    // CABEÇALHO
    // =============================================

    pdf.setFontSize(
        24
    );

    pdf.setFont(
        "helvetica",
        "bold"
    );

    pdf.text(
        "AgroRisk",
        20,
        25
    );


    pdf.setFontSize(
        16
    );

    pdf.text(
        "Relatório da Safra",
        20,
        36
    );


    pdf.setDrawColor(
        180,
        180,
        180
    );


    pdf.line(
        20,
        42,
        190,
        42
    );


    // =============================================
    // IDENTIFICAÇÃO
    // =============================================

    pdf.setFontSize(
        13
    );

    pdf.setFont(
        "helvetica",
        "bold"
    );

    pdf.text(
        "Identificação da Safra",
        20,
        55
    );


    pdf.setFont(
        "helvetica",
        "normal"
    );

    pdf.setFontSize(
        11
    );


    pdf.text(
        "Safra: " + nome,
        20,
        65
    );


    pdf.text(
        "Propriedade: " + propriedade,
        20,
        73
    );


    pdf.text(
        "Cultura: " + cultura,
        20,
        81
    );


    pdf.text(
        "Área plantada: " +
        formatarArea(area),
        20,
        89
    );


    pdf.text(
        "Status: " + status,
        20,
        97
    );


    // =============================================
    // PERÍODO
    // =============================================

    pdf.setFont(
        "helvetica",
        "bold"
    );

    pdf.text(
        "Período da Safra",
        20,
        113
    );


    pdf.setFont(
        "helvetica",
        "normal"
    );


    pdf.text(
        "Data de plantio: " + plantio,
        20,
        123
    );


    pdf.text(
        "Referência central: " + colheita,
        20,
        131
    );


    // =============================================
    // DADOS CADASTRADOS — sem estimativa financeira
    // =============================================
    pdf.setFont("helvetica", "bold");
    pdf.text("Dados informados no cadastro", 20, 147);
    pdf.setFont("helvetica", "normal");
    pdf.text("Custo informado: " + textoElementoRelatorio("custoInformado"), 20, 157);

    const obsOriginal = textoElementoRelatorio("observacoesSafra");
    const obsCurtas = pdf.splitTextToSize("Observações: " + obsOriginal, 170);
    const obsExibidas = obsCurtas.slice(0, 3);
    if (obsCurtas.length > obsExibidas.length) {
        obsExibidas[obsExibidas.length - 1] += " ...";
    }
    pdf.text(obsExibidas, 20, 167);

    // =============================================
    // CLIMA
    // =============================================

    pdf.setFont(
        "helvetica",
        "bold"
    );


    pdf.text(
        "Condições Climáticas",
        20,
        205
    );


    pdf.setFont(
        "helvetica",
        "normal"
    );


    pdf.text(
        "Clima atual: " + textoElementoRelatorio("previsaoClima"),
        20,
        215
    );


    pdf.text(
        "Chuva prevista: " + textoElementoRelatorio("chuvaClima"),
        20,
        223
    );


    pdf.text(
        "Temperatura: " + textoElementoRelatorio("temperaturaClima"),
        20,
        231
    );


    pdf.text(
        "Atenção: " + textoElementoRelatorio("riscoClima"),
        20,
        239
    );


    // =============================================
    // ANÁLISE
    // =============================================

    pdf.setFont(
        "helvetica",
        "bold"
    );


    pdf.text(
        "Análise da Safra",
        20,
        255
    );


    pdf.setFont(
        "helvetica",
        "normal"
    );


    const situacaoPDF = AgroRiskIndicadores.situacao(safra);
    const janelaPDF = situacaoPDF.janela;
    const textoAnalise = status === "Finalizada"
        ? "Conclusão informada pelo produtor, registrada no MySQL."
        : "Janela estimada não comprova colheita realizada.";
    pdf.text(pdf.splitTextToSize(textoAnalise, 170), 20, 265);

    // =============================================
    // RODAPÉ
    // =============================================

    pdf.setFontSize(
        9
    );


    pdf.setTextColor(
        100,
        100,
        100
    );


    pdf.text(
        "AgroRisk • Sistema Inteligente de Monitoramento Agrícola",
        20,
        285
    );


    // =============================================
    // METODOLOGIA — SEGUNDA PÁGINA
    // =============================================
    pdf.addPage();
    pdf.setTextColor(0, 0, 0);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(15);
    pdf.text("Metodologia e limitações", 20, 25);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    const metodologia = [
        "Janela preliminar: " + (janelaPDF
            ? `${AgroRiskIndicadores.mesAno(janelaPDF.inicio)} a ${AgroRiskIndicadores.mesAno(janelaPDF.fim)}`
            : "não disponível"),
        "Método: ciclos fixos da cultura, sem calibração agronômica por região/cultivar.",
        "A data central da colheita é só uma referência de calendário.",
        "Status Finalizada: exige confirmação explícita do produtor; não é automático.",
        "Clima: leitura atual e previsão de curto prazo do OpenWeather para a propriedade.",
        "Esses dados não reconstituem o clima da safra nem projetam o clima para 3 a 4 anos.",
        "Atenção climática: triagem demonstrativa, não recomendação agronômica.",
        "Não há histórico climático persistido nesta versão do sistema."
    ];
    let y = 40;
    metodologia.forEach(linha => {
        const linhas = pdf.splitTextToSize(linha, 170);
        pdf.text(linhas, 20, y);
        y += linhas.length * 6 + 5;
    });
    pdf.setFont("helvetica", "bold");
    pdf.text("Condições consultadas no relatório", 20, y + 5);
    pdf.setFont("helvetica", "normal");
    const detalhes = pdf.splitTextToSize(climaRelatorioAtual.resumo || "Não consultado", 170);
    pdf.text(detalhes, 20, y + 13);

    // =============================================
    // NOME DO ARQUIVO
    // =============================================

    const nomeArquivo =
        nome
            .replace(
                /[^a-zA-Z0-9À-ÿ ]/g,
                ""
            )
            .replace(
                /\s+/g,
                "_"
            );


    pdf.save(
        "AgroRisk_Relatorio_" +
        nomeArquivo +
        ".pdf"
    );

}



// =============================================
// FUNÇÕES AUXILIARES
// =============================================

function alterarTexto(id, valor) {

    const elemento =
        document.getElementById(
            id
        );


    if (elemento) {

        elemento.textContent =
            valor;

    }

}



function textoElementoRelatorio(id) {
    return document.getElementById(id)?.textContent?.trim() || "Não disponível";
}

// =============================================
// STATUS
// =============================================


// =============================================
// STATUS REAL DA SAFRA
// =============================================

function obterStatusSafra(safra) {
    return AgroRiskIndicadores.situacao(safra).status;
}

// =============================================
// NOME DA PROPRIEDADE
// =============================================


// =============================================
// NOME REAL DA PROPRIEDADE - MYSQL
// =============================================

function obterNomePropriedade(safra) {

    const propriedade = mapaPropriedadesRelatorios.get(
        String(safra.propriedade_id)
    );

    if (propriedade?.nome) {
        return propriedade.nome;
    }

    if (safra.propriedade_nome) {
        return safra.propriedade_nome;
    }

    if (safra.propriedade?.nome) {
        return safra.propriedade.nome;
    }

    return "Propriedade não identificada";
}




// =============================================
// FORMATAR DATA
// =============================================

function formatarData(data) {

    if (!data) {

        return "--";

    }


    if (
        typeof data === "string" &&
        data.includes("-")
    ) {

        const partes =
            data
                .substring(
                    0,
                    10
                )
                .split("-");


        if (
            partes.length === 3
        ) {

            return (
                partes[2] +
                "/" +
                partes[1] +
                "/" +
                partes[0]
            );

        }

    }


    return data;

}



// =============================================
// FORMATAR ÁREA
// =============================================

function formatarArea(area) {

    const numero =
        Number(
            area || 0
        );


    return (
        numero.toLocaleString(
            "pt-BR",
            {
                maximumFractionDigits: 2
            }
        ) +
        " ha"
    );

}



// =============================================
// ERRO
// =============================================

function mostrarErro(mensagem) {

    const loading =
        document.getElementById(
            "carregandoRelatorio"
        );


    if (loading) {

        loading.style.display =
            "none";

    }


    const conteudo =
        document.getElementById(
            "conteudoRelatorio"
        );


    if (conteudo) {

        conteudo.style.display =
            "none";

    }


    const erro =
        document.getElementById(
            "erroRelatorio"
        );


    if (erro) {

        erro.style.display =
            "block";


        erro.textContent =
            mensagem;

    }

}