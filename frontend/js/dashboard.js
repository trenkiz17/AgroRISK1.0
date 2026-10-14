
// ==========================================
// AG RORISK - DASHBOARD
// ==========================================

document.addEventListener("DOMContentLoaded", async () => {

    const usuario = obterUsuarioLogado();

    if (!usuario || !usuario.id) {
        window.location.href = "login.html";
        return;
    }

    carregarUsuario(usuario);
    configurarLogout();

    await carregarResumoDashboard();

});


// ==========================================
// USUÁRIO E FOTO DE PERFIL
// ==========================================

function carregarUsuario(usuario) {

    const nome = usuario.nome || "Usuário";

    const nomeTopo = document.getElementById("usuario");

    const nomeBoasVindas = document.getElementById("usuario2");

    if (nomeTopo) {
        nomeTopo.textContent = nome;
    }

    if (nomeBoasVindas) {
        nomeBoasVindas.textContent = nome;
    }


    // FOTO SALVA PELO PERFIL.JS

    const imagem = document.getElementById(
        "fotoUsuarioDashboard"
    );

    const icone = document.getElementById(
        "iconeUsuarioDashboard"
    );

    if (!imagem || !icone) {
        return;
    }

    const chaveFoto = `fotoPerfil_${usuario.id}`;

    const foto = localStorage.getItem(chaveFoto);

    if (!foto) {

        imagem.hidden = true;
        icone.hidden = false;

        return;
    }

    imagem.onerror = function () {

        imagem.hidden = true;
        icone.hidden = false;

    };

    imagem.src = foto;

    imagem.hidden = false;
    icone.hidden = true;

}


// ==========================================
// LOGOUT
// ==========================================

function configurarLogout() {

    const botao = document.getElementById("btnLogout");

    if (!botao) {
        return;
    }

    botao.addEventListener("click", function (event) {

        event.preventDefault();

        localStorage.removeItem("usuario");

        window.location.href = "login.html";

    });

}


// ==========================================
// CRIAR LINHA DO RESUMO
// ==========================================

function criarItemResumo(
    container,
    titulo,
    descricao,
    iconeClasse
) {

    const item = document.createElement("li");

    item.className = "dashboard-registro";


    // ÍCONE

    const icone = document.createElement("i");

    icone.className = `fa-solid ${iconeClasse}`;

    icone.setAttribute("aria-hidden", "true");


    // INFORMAÇÕES

    const conteudo = document.createElement("div");

    conteudo.className = "dashboard-registro-conteudo";


    const nome = document.createElement("strong");

    nome.textContent = titulo;


    const detalhe = document.createElement("small");

    detalhe.textContent = descricao;


    conteudo.append(nome, detalhe);

    item.append(icone, conteudo);

    container.appendChild(item);

}


// ==========================================
// MENSAGEM QUANDO NÃO EXISTEM REGISTROS
// ==========================================

function mostrarTextoResumo(container, texto) {

    container.replaceChildren();

    const item = document.createElement("li");

    item.className = "dashboard-vazio";

    item.textContent = texto;

    container.appendChild(item);

}


// ==========================================
// CARREGAR DADOS REAIS DO DASHBOARD
// ==========================================

async function carregarResumoDashboard() {

    const listaPropriedades = document.getElementById(
        "resumoPropriedades"
    );

    const listaSafras = document.getElementById(
        "resumoSafras"
    );

    const aviso = document.getElementById(
        "avisoDashboard"
    );

    aviso.hidden = true;


    // ======================================
    // 1. BUSCAR PROPRIEDADES
    // ======================================

    const propriedades = await listarPropriedades();

    if (!Array.isArray(propriedades)) {

        mostrarTextoResumo(
            listaPropriedades,
            "Não foi possível carregar suas propriedades."
        );

        mostrarTextoResumo(
            listaSafras,
            "O resumo de safras não está disponível."
        );

        aviso.textContent =
            "Não foi possível buscar os dados. " +
            "Verifique se o Flask está funcionando.";

        aviso.hidden = false;

        return;
    }


    // ======================================
    // 2. QUANTIDADE DE PROPRIEDADES
    // ======================================

    document.getElementById(
        "totalPropriedades"
    ).textContent = propriedades.length;


    // ======================================
    // 3. ÁREA TOTAL CADASTRADA
    // ======================================

    const areaTotal = propriedades.reduce(
        (soma, propriedade) => {

            const area = Number(propriedade.area);

            if (Number.isFinite(area) && area > 0) {
                return soma + area;
            }

            return soma;

        },
        0
    );

    document.getElementById(
        "areaTotal"
    ).textContent =
        areaTotal.toLocaleString("pt-BR", {
            maximumFractionDigits: 2
        }) + " ha";


    // ======================================
    // 4. RESUMO DAS PROPRIEDADES
    // ======================================

    listaPropriedades.replaceChildren();

    if (propriedades.length === 0) {

        mostrarTextoResumo(
            listaPropriedades,
            "Nenhuma propriedade cadastrada. " +
            "Use 'Cadastrar Propriedade' para começar."
        );

    } else {

        const recentes = [...propriedades]
            .sort((a, b) => Number(b.id) - Number(a.id))
            .slice(0, 3);

        recentes.forEach(propriedade => {

            const local = [
                propriedade.cidade,
                propriedade.estado
            ]
                .filter(Boolean)
                .join(" - ") || "Localização não informada";

            criarItemResumo(
                listaPropriedades,
                propriedade.nome || "Propriedade sem nome",
                local,
                "fa-location-dot"
            );

        });

    }


    // ======================================
    // 5. BUSCAR SAFRAS
    // ======================================

    const safras = await listarSafras();

    if (!Array.isArray(safras)) {

        mostrarTextoResumo(
            listaSafras,
            "Não foi possível carregar as safras."
        );

        aviso.textContent =
            "Propriedades carregadas, mas houve " +
            "um problema ao consultar as safras.";

        aviso.hidden = false;

        return;
    }


    // ======================================
    // 6. RELACIONAR SAFRAS ÀS PROPRIEDADES
    // ======================================

    const propriedadesPorId = new Map(
        propriedades.map(propriedade => [
            String(propriedade.id),
            propriedade
        ])
    );

    const safrasDoUsuario = safras.filter(
        safra => propriedadesPorId.has(
            String(safra.propriedade_id)
        )
    );


    // ======================================
    // 7. QUANTIDADE DE SAFRAS
    // ======================================

    document.getElementById(
        "totalSafras"
    ).textContent = safrasDoUsuario.length;


    // ======================================
    // 8. PROPRIEDADES COM SAFRAS
    // ======================================

    const comSafras = new Set(
        safrasDoUsuario.map(
            safra => String(safra.propriedade_id)
        )
    );

    document.getElementById(
        "propriedadesComSafras"
    ).textContent = comSafras.size;


    // ======================================
    // 9. RESUMO DAS SAFRAS
    // ======================================

    listaSafras.replaceChildren();

    if (safrasDoUsuario.length === 0) {

        mostrarTextoResumo(
            listaSafras,
            "Nenhuma safra cadastrada nas suas propriedades."
        );

        return;
    }


    const safrasRecentes = [...safrasDoUsuario]
        .sort((a, b) => Number(b.id) - Number(a.id))
        .slice(0, 3);


    safrasRecentes.forEach(safra => {

        const propriedade = propriedadesPorId.get(
            String(safra.propriedade_id)
        );

        const nomeSafra =
            safra.nome ||
            safra.cultura ||
            `Safra #${safra.id}`;

        const detalhes = [
            safra.cultura,
            propriedade?.nome,
            safra.status
        ]
            .filter(Boolean)
            .join(" • ") || "Sem informações adicionais";

        criarItemResumo(
            listaSafras,
            nomeSafra,
            detalhes,
            "fa-seedling"
        );

    });

}
