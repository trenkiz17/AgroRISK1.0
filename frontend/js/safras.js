// =======================================
// SAFRAS
// =======================================


// =======================================
// INICIAR
// =======================================


// Propriedades reais cadastradas no MySQL
let mapaPropriedadesSafras = new Map();


document.addEventListener(
    "DOMContentLoaded",
    async function () {

        await carregarSafras();

    }
);


// =======================================
// CARREGAR SAFRAS
// =======================================


// =======================================
// CARREGAR SAFRAS DO MYSQL
// =======================================

async function carregarSafras() {

    const titulo = document.getElementById(
        "tituloSafras"
    );

    const filtro = document.getElementById(
        "filtroPropriedadeSafras"
    );

    const linkNovaSafra = document.getElementById(
        "linkNovaSafraLista"
    );

    const lista = document.getElementById(
        "listaSafras"
    );

    // Verificar usuário

    if (!obterUsuarioId()) {
        window.location.href = "login.html";
        return;
    }

    // Identificar propriedade selecionada

    const params = new URLSearchParams(
        window.location.search
    );

    const propriedadeId = params.get(
        "propriedade_id"
    );

    try {

        // ===================================
        // BUSCAR DADOS REAIS DO MYSQL
        // ===================================

        const respostaPropriedades =
            await listarPropriedades();

        const respostaSafras =
            await listarSafras();

        const propriedades = Array.isArray(
            respostaPropriedades
        )
            ? respostaPropriedades
            : respostaPropriedades?.data;

        const safras = Array.isArray(
            respostaSafras
        )
            ? respostaSafras
            : respostaSafras?.data;

        if (
            !Array.isArray(propriedades) ||
            !Array.isArray(safras)
        ) {
            throw new Error(
                "Não foi possível consultar os dados no Flask."
            );
        }

        // ===================================
        // VINCULAR IDs AOS NOMES REAIS
        // ===================================

        mapaPropriedadesSafras = new Map(
            propriedades.map(propriedade => [
                String(propriedade.id),
                propriedade
            ])
        );

        // ===================================
        // MONTAR FILTRO DE PROPRIEDADES
        // ===================================

        if (filtro) {

            filtro.replaceChildren(
                new Option(
                    "Todas as propriedades",
                    ""
                )
            );

            propriedades.forEach(propriedade => {

                filtro.add(
                    new Option(
                        propriedade.nome,
                        String(propriedade.id)
                    )
                );
            });

            filtro.value = propriedadeId || "";

            filtro.onchange = function () {

                const selecionada = filtro.value;

                window.location.href = selecionada
                    ? "safras.html?propriedade_id=" +
                      encodeURIComponent(selecionada)
                    : "safras.html";
            };
        }

        // ===================================
        // VERIFICAR PROPRIEDADE SELECIONADA
        // ===================================

        if (
            propriedadeId &&
            !mapaPropriedadesSafras.has(
                String(propriedadeId)
            )
        ) {
            throw new Error(
                "A propriedade selecionada não foi encontrada."
            );
        }

        // ===================================
        // TÍTULO REAL DA PÁGINA
        // ===================================

        if (propriedadeId) {

            const propriedade =
                mapaPropriedadesSafras.get(
                    String(propriedadeId)
                );

            if (titulo) {
                titulo.textContent =
                    "Safras da propriedade " +
                    propriedade.nome;
            }

        } else if (propriedades.length === 1) {

            if (titulo) {
                titulo.textContent =
                    "Safras da propriedade " +
                    propriedades[0].nome;
            }

        } else {

            if (titulo) {
                titulo.textContent = "Minhas Safras";
            }
        }

        // ===================================
        // BOTÃO NOVA SAFRA
        // ===================================

        if (linkNovaSafra) {

            linkNovaSafra.href = propriedadeId
                ? "cadastro_safras.html?propriedade_id=" +
                  encodeURIComponent(propriedadeId)
                : "cadastro_safras.html";
        }

        // ===================================
        // GARANTIR VÍNCULO COM A PROPRIEDADE
        // ===================================

        const safrasDoUsuario = safras.filter(
            safra => mapaPropriedadesSafras.has(
                String(safra.propriedade_id)
            )
        );

        // ===================================
        // FILTRAR PROPRIEDADE ESCOLHIDA
        // ===================================

        const safrasExibidas = propriedadeId
            ? safrasDoUsuario.filter(
                safra =>
                    String(safra.propriedade_id) ===
                    String(propriedadeId)
            )
            : safrasDoUsuario;

        // ===================================
        // ATUALIZAR TELA
        // ===================================

        renderizarSafras(safrasExibidas);

        atualizarResumo(safrasExibidas);

        // Corrigir o link do cartão vazio

        if (
            safrasExibidas.length === 0 &&
            linkNovaSafra
        ) {

            const linkCadastroVazio =
                lista?.querySelector(
                    ".btn-monitorar"
                );

            if (linkCadastroVazio) {
                linkCadastroVazio.href =
                    linkNovaSafra.href;
            }
        }

    } catch (erro) {

        console.error(
            "Erro ao carregar safras:",
            erro
        );

        if (titulo) {
            titulo.textContent =
                "Safras indisponíveis";
        }

        if (lista) {
            lista.textContent = erro.message;
        }

        // Evitar indicadores falsos quando
        // ocorrer falha na API.

        [
            "totalSafras",
            "totalAndamento",
            "totalFinalizadas",
            "totalArea"
        ].forEach(id => {

            const elemento = document.getElementById(id);

            if (elemento) {
                elemento.textContent = "—";
            }
        });
    }
}



// =======================================
// RENDERIZAR SAFRAS
// =======================================

function renderizarSafras(safras) {

    const lista =
        document.getElementById(
            "listaSafras"
        );


    if (!lista) {

        return;

    }


    lista.innerHTML = "";


    // =======================================
    // NENHUMA SAFRA
    // =======================================

    if (
        !safras ||
        safras.length === 0
    ) {

        lista.innerHTML = `

            <div class="safra-card">

                <div class="safra-top">

                    <div>

                        <span class="badge-status andamento">

                            <i class="fa-solid fa-circle"></i>

                            Nenhuma safra

                        </span>

                        <h3>

                            Nenhuma safra cadastrada

                        </h3>

                        <small>

                            Cadastre sua primeira safra
                            para começar o monitoramento.

                        </small>

                    </div>

                    <div class="safra-icon">

                        <i class="fa-solid fa-seedling"></i>

                    </div>

                </div>

                <div class="safra-buttons">

                    <a
                        href="cadastro_safras.html"
                        class="btn-monitorar">

                        <i class="fa-solid fa-plus"></i>

                        Cadastrar Safra

                    </a>

                </div>

            </div>

        `;

        return;

    }


    // =======================================
    // ORDENAR
    // MAIS RECENTE PRIMEIRO
    // =======================================

    safras.sort(
        function (a, b) {

            const dataA =
                new Date(
                    a.data_plantio || 0
                );


            const dataB =
                new Date(
                    b.data_plantio || 0
                );


            return dataB - dataA;

        }
    );


    // =======================================
    // CRIAR CARDS
    // =======================================

    safras.forEach(
        function (safra) {

            lista.innerHTML +=
                criarCardSafra(safra);

        }
    );

}


// =======================================
// CRIAR CARD
// =======================================

function criarCardSafra(safra) {

    const id =
        safra.id ||
        "";


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


    const plantio =
        safra.data_plantio ||
        "";


    const colheita =
        safra.data_colheita ||
        "";


    const status =
        obterStatusSafra(
            safra
        );


    const statusClasse =
        status === "Finalizada"
            ? "finalizada"
            : "andamento";


    const statusIcon =
        status === "Finalizada"
            ? "fa-circle-check"
            : "fa-circle";


    const icone =
        obterIconeCultura(
            cultura
        );


    const plantioFormatado =
        formatarData(
            plantio
        );


    const colheitaFormatada =
        formatarData(
            colheita
        );


    const faixa = AgroRiskIndicadores.janela(safra);
    const faixaTexto = faixa
        ? `Janela preliminar: ${AgroRiskIndicadores.mesAno(faixa.inicio)} a ${AgroRiskIndicadores.mesAno(faixa.fim)}`
        : "Janela estimada indisponível";

    return `

        <div
            class="safra-card"
            data-id="${id}">


            <!-- ================= TOP ================= -->

            <div class="safra-top">

                <div>

                    <span
                        class="badge-status ${statusClasse}">

                        <i
                            class="fa-solid ${statusIcon}">
                        </i>

                        ${status}

                    </span>


                    <h3>

                        ${escaparHTML(nome)}

                    </h3>


                    <small>

                        Cultura:

                        <strong>

                            ${escaparHTML(cultura)}

                        </strong>

                    </small>

                </div>


                <div class="safra-icon">

                    <i
                        class="fa-solid ${icone}">
                    </i>

                </div>

            </div>


            <!-- ================= INFORMAÇÕES ================= -->

            <div class="safra-info">

                <div>

                    <span>
                        Plantio
                    </span>

                    <strong>
                        ${plantioFormatado}
                    </strong>

                </div>


                <div>

                    <span>
                        Estimativa central
                    </span>

                    <strong>
                        ${colheitaFormatada}
                    </strong>

                </div>


                <div>

                    <span>
                        Área
                    </span>

                    <strong>
                        ${formatarArea(area)}
                    </strong>

                </div>


            </div>


            <p class="small text-muted px-3 mb-2">${escaparHTML(faixaTexto)}</p>

            <!-- ================= BOTÕES ================= -->

            <div class="safra-buttons">


                <!-- MONITORAR -->

                <a
                    href="monitoramento.html?id=${encodeURIComponent(safra.propriedade_id)}"
                    class="btn-monitorar">

                    <i class="fa-solid fa-chart-line"></i>

                    ${status === "Finalizada"
            ? "Visualizar"
            : "Monitorar"
        }

                </a>


                <!-- EDITAR -->

                <a
                    href="cadastro_safras.html?id=${id}"
                    class="btn-editar">

                    <i class="fa-solid fa-pen"></i>

                    Editar

                </a>


                <!-- RELATÓRIO DA SAFRA -->

                <a
                    href="relatorios.html?id=${id}"
                    class="btn-relatorio">

                    <i class="fa-solid fa-chart-column"></i>

                    Analisar Safra

                </a>


                <!-- EXCLUIR -->

                <button
                    type="button"
                    class="btn-excluir"
                    onclick="excluirSafraTela('${id}')">

                    <i class="fa-solid fa-trash"></i>

                    Excluir

                </button>


            </div>

        </div>

    `;

}


// =======================================
// EXCLUIR SAFRA
// =======================================

async function excluirSafraTela(id) {

    if (!id) {

        alert(
            "Não foi possível identificar a safra."
        );

        return;

    }


    const confirmar =
        confirm(
            "Tem certeza que deseja excluir esta safra?"
        );


    if (!confirmar) {

        return;

    }


    try {

        let excluidaNaApi = false;


        // =======================================
        // TENTAR EXCLUIR NA API
        // =======================================

        if (
            typeof excluirSafra === "function"
        ) {

            const resposta =
                await excluirSafra(id);


            if (resposta) {

                excluidaNaApi = true;

            }

        }


        // =======================================
        // REMOVER DO LOCALSTORAGE
        // =======================================

        let safrasLocais =
            JSON.parse(
                localStorage.getItem("safras")
            ) || [];


        const quantidadeAntes =
            safrasLocais.length;


        safrasLocais =
            safrasLocais.filter(
                function (safra) {

                    return String(safra.id) !==
                        String(id);

                }
            );


        localStorage.setItem(
            "safras",
            JSON.stringify(
                safrasLocais
            )
        );


        const foiRemovidaLocal =
            safrasLocais.length <
            quantidadeAntes;


        // =======================================
        // RESULTADO
        // =======================================

        if (
            excluidaNaApi ||
            foiRemovidaLocal
        ) {

            alert(
                "Safra excluída com sucesso!"
            );


            await carregarSafras();

            return;

        }


        alert(
            "Não foi possível excluir a safra."
        );

    }

    catch (erro) {

        console.error(
            "Erro ao excluir safra:",
            erro
        );


        // =======================================
        // TENTAR REMOVER LOCALMENTE
        // =======================================

        try {

            let safrasLocais =
                JSON.parse(
                    localStorage.getItem("safras")
                ) || [];


            const quantidadeAntes =
                safrasLocais.length;


            safrasLocais =
                safrasLocais.filter(
                    function (safra) {

                        return String(safra.id) !==
                            String(id);

                    }
                );


            localStorage.setItem(
                "safras",
                JSON.stringify(
                    safrasLocais
                )
            );


            if (
                safrasLocais.length <
                quantidadeAntes
            ) {

                alert(
                    "Safra removida dos dados de teste locais."
                );


                await carregarSafras();

                return;

            }

        }

        catch (erroLocal) {

            console.error(
                "Erro ao remover safra local:",
                erroLocal
            );

        }


        alert(
            "Não foi possível excluir a safra."
        );

    }

}


// =======================================
// STATUS DA SAFRA
// =======================================

function obterStatusSafra(safra) {
    // Data estimada não significa colheita concluída.
    return AgroRiskIndicadores.situacao(safra).status;
}

// =======================================
// ÍCONE DA CULTURA
// =======================================

function obterIconeCultura(cultura) {

    const nome =
        String(
            cultura || ""
        ).toLowerCase();


    if (
        nome.includes("café") ||
        nome.includes("cafe")
    ) {

        return "fa-mug-hot";

    }


    if (
        nome.includes("milho")
    ) {

        return "fa-wheat-awn";

    }


    if (
        nome.includes("soja")
    ) {

        return "fa-seedling";

    }


    if (
        nome.includes("algodão") ||
        nome.includes("algodao")
    ) {

        return "fa-cloud";

    }


    if (
        nome.includes("cana")
    ) {

        return "fa-leaf";

    }


    return "fa-seedling";

}


// =======================================
// ATUALIZAR RESUMO
// =======================================

function atualizarResumo(safras) {

    const total =
        safras.length;


    let andamento = 0;

    let finalizadas = 0;

    let areaTotal = 0;


    safras.forEach(
        function (safra) {

            const status =
                obterStatusSafra(
                    safra
                );


            if (
                status === "Finalizada"
            ) {

                finalizadas++;

            }

            else {

                andamento++;

            }


            areaTotal +=
                Number(
                    safra.area_plantada || 0
                );

        }
    );


    const totalElement =
        document.getElementById(
            "totalSafras"
        );


    const andamentoElement =
        document.getElementById(
            "totalAndamento"
        );


    const finalizadasElement =
        document.getElementById(
            "totalFinalizadas"
        );


    const areaElement =
        document.getElementById(
            "totalArea"
        );


    if (totalElement) {

        totalElement.textContent =
            total;

    }


    if (andamentoElement) {

        andamentoElement.textContent =
            andamento;

    }


    if (finalizadasElement) {

        finalizadasElement.textContent =
            finalizadas;

    }


    if (areaElement) {

        areaElement.textContent =
            formatarArea(
                areaTotal
            );

    }

}


// =======================================
// NOME DA PROPRIEDADE
// =======================================


// =======================================
// NOME REAL DA PROPRIEDADE - MYSQL
// =======================================

async function carregarNomePropriedade() {

    const elemento = document.getElementById(
        "nomePropriedade"
    );

    if (!elemento) return;

    try {

        // Buscar propriedades reais no Flask/MySQL
        const propriedades = await listarPropriedades();

        if (!Array.isArray(propriedades)) {
            throw new Error("Erro ao consultar propriedades.");
        }

        // Verificar se a página recebeu o ID da propriedade
        const params = new URLSearchParams(
            window.location.search
        );

        const propriedadeId = params.get(
            "propriedade_id"
        );

        if (propriedadeId) {

            const propriedade = propriedades.find(
                p => String(p.id) === String(propriedadeId)
            );

            elemento.textContent = propriedade
                ? propriedade.nome
                : "não encontrada";

            return;
        }

        // Se o usuário só tem uma propriedade,
        // mostrar automaticamente o nome dela
        if (propriedades.length === 1) {

            elemento.textContent = propriedades[0].nome;

            return;
        }

        // Se houver várias propriedades cadastradas
        elemento.textContent = propriedades.length > 1
            ? "todas as propriedades"
            : "nenhuma propriedade cadastrada";

    } catch (erro) {

        console.error(
            "Erro ao carregar nome da propriedade:",
            erro
        );

        elemento.textContent = "indisponível";
    }
}



// =======================================
// FORMATAR DATA
// =======================================

function formatarData(data) {

    if (!data) {

        return "--";

    }


    if (
        typeof data === "string" &&
        data.includes("-")
    ) {

        const partes =
            data.substring(
                0,
                10
            ).split("-");


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


// =======================================
// FORMATAR ÁREA
// =======================================

function formatarArea(area) {

    const numero =
        Number(
            area || 0
        );


    if (!numero) {

        return "0 ha";

    }


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


// =======================================
// PROTEÇÃO CONTRA HTML
// =======================================

function escaparHTML(valor) {

    return String(
        valor || ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}