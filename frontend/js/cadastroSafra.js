
let safraEditando = null;
let estimativaAtual = null;
let chaveEstimativa = "";
let numeroConsulta = 0;


// ==========================================
// ELEMENTOS E MENSAGENS
// ==========================================

const $ = id => document.getElementById(id);

function mensagemSafra(texto, sucesso = false) {

    const elemento = $("mensagemSafra");

    elemento.hidden = !texto;
    elemento.textContent = texto;

    elemento.className = sucesso
        ? "alert alert-success mt-3"
        : "alert alert-danger mt-3";
}


function formatarDataSafra(valor) {

    if (!valor) return "—";

    const [ano, mes, dia] = String(valor)
        .slice(0, 10)
        .split("-");

    return `${dia}/${mes}/${ano}`;
}


// ==========================================
// CARREGAR PROPRIEDADES
// ==========================================

async function carregarPropriedadesSafra() {

    const propriedades = await listarPropriedades();
    const select = $("propriedade");

    select.replaceChildren(
        new Option("Selecione a propriedade", "")
    );

    if (!Array.isArray(propriedades)) {

        mensagemSafra(
            "Não foi possível carregar suas propriedades. Verifique o Flask."
        );

        return false;
    }

    propriedades.forEach(propriedade => {

        select.add(
            new Option(
                propriedade.nome,
                String(propriedade.id)
            )
        );

    });

    if (!propriedades.length) {

        mensagemSafra(
            "Cadastre uma propriedade antes de cadastrar uma safra."
        );
    }

    return true;
}


// ==========================================
// CARREGAR SAFRA PARA EDIÇÃO
// ==========================================

async function carregarEdicaoSafra(id) {

    const resposta = await buscarSafra(id);

    const safra = resposta?.safra || resposta;

    if (!safra?.id) {

        mensagemSafra(
            "Não foi possível carregar esta safra para edição."
        );

        return false;
    }

    const pertenceAoUsuario = [
        ...$("propriedade").options
    ].some(
        opcao =>
            opcao.value === String(safra.propriedade_id)
    );

    if (!pertenceAoUsuario) {

        mensagemSafra(
            "Esta safra pertence a uma propriedade não disponível na sua conta."
        );

        return false;
    }

    safraEditando = safra;

    $("nomeSafra").value = safra.nome || "";

    $("propriedade").value = String(
        safra.propriedade_id
    );

    $("cultura").value = safra.cultura || "";

    $("plantio").value = String(
        safra.data_plantio || ""
    ).slice(0, 10);

    $("hectares").value = safra.area_plantada ?? "";

    $("custo").value = safra.custo_total ?? "";

    $("observacoes").value = safra.observacoes || "";

    $("tituloSafra").textContent = "Editar Safra";

    $("btnSalvarSafra").textContent = "Salvar alterações";

    if (!$("cultura").value) {

        mensagemSafra(
            "Esta safra usa uma cultura antiga. Selecione Café, Milho ou Soja para continuar."
        );
    }

    return true;
}


// ==========================================
// RESUMO E ESTIMATIVA
// ==========================================

async function atualizarResumoSafra() {

    const select = $("propriedade");

    $("rPropriedade").textContent =
        select.selectedOptions[0]?.value
            ? select.selectedOptions[0].textContent
            : "—";

    $("rCultura").textContent =
        $("cultura").value || "—";

    $("rArea").textContent =
        $("hectares").value
            ? `${$("hectares").value} ha`
            : "—";

    $("rPlantio").textContent = formatarDataSafra(
        $("plantio").value
    );

    $("rCusto").textContent = $("custo").value
        ? Number($("custo").value).toLocaleString(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        )
        : "Não informado";


    const cultura = $("cultura").value;
    const plantio = $("plantio").value;

    const chave = `${cultura}|${plantio}`;


    // SEM OS DOIS CAMPOS, NÃO HÁ ESTIMATIVA

    if (!cultura || !plantio) {

        estimativaAtual = null;
        chaveEstimativa = "";
        numeroConsulta++;

        $("rColheita").textContent = "—";
        $("colheita").value = "";

        $("avisoEstimativa").textContent =
            "Selecione a cultura e informe o plantio.";

        return;
    }


    // NÃO CONSULTAR DE NOVO SE NADA MUDOU

    if (chave === chaveEstimativa) {
        return;
    }

    chaveEstimativa = chave;

    const consulta = ++numeroConsulta;

    estimativaAtual = null;

    $("rColheita").textContent = "Calculando...";
    $("colheita").value = "Calculando...";


    // CHAMADA PARA O FLASK

    const estimativa = await estimarColheita(
        cultura,
        plantio
    );

    // EVITAR RESULTADOS DE CONSULTAS ANTIGAS

    if (consulta !== numeroConsulta) {
        return;
    }


    if (!estimativa?.data_colheita) {

        chaveEstimativa = "";

        $("rColheita").textContent = "Indisponível";
        $("colheita").value = "";

        $("avisoEstimativa").textContent =
            "Falha ao consultar a estimativa no Flask.";

        return;
    }

    
    // ==========================================
    // EXIBIR JANELA ESTIMADA DE COLHEITA
    // ==========================================

    estimativaAtual = estimativa;

    const inicio = formatarDataSafra(
        estimativa.inicio_janela
    );

    const fim = formatarDataSafra(
        estimativa.fim_janela
    );

    // Verificar se a cultura é café

    const ehCafe = cultura.trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase() === "cafe";

    const rotulo = ehCafe
        ? "Primeira colheita estimada"
        : "Colheita estimada";

    // Mostrar intervalo, não apenas um dia

    const janela = `Entre ${inicio} e ${fim}`;

    // Campo do formulário

    $("colheita").value = janela;

    // Resumo lateral

    $("rColheita").textContent = janela;

    // Atualizar o título do campo

    const rotuloCampo = document.getElementById(
        "rotuloEstimativaColheita"
    );

    if (rotuloCampo) {
        rotuloCampo.textContent = rotulo;
    }

    // Atualizar o título no resumo

    const rotuloResumo = document.getElementById(
        "rotuloResumoColheita"
    );

    if (rotuloResumo) {
        rotuloResumo.textContent = rotulo;
    }

    // Explicar o cálculo

    $("avisoEstimativa").textContent =
        (ehCafe
            ? "Estimativa para a primeira colheita de uma lavoura nova de café. "
            : "Janela preliminar de colheita. ") +
        (estimativa.aviso || "");

}


// ==========================================
// CADASTRAR OU ATUALIZAR SAFRA
// ==========================================

async function salvarSafraFormulario(evento) {

    evento.preventDefault();

    mensagemSafra("");

    if (!$("formSafra").reportValidity()) {
        return;
    }

    const propriedade_id = Number(
        $("propriedade").value
    );

    const area = Number(
        $("hectares").value
    );

    if (
        !propriedade_id ||
        !Number.isFinite(area) ||
        area <= 0
    ) {

        mensagemSafra(
            "Selecione uma propriedade e informe uma área cultivada maior que zero."
        );

        return;
    }


    if (!estimativaAtual) {

        mensagemSafra(
            "Aguarde o cálculo da estimativa de colheita."
        );

        await atualizarResumoSafra();

        return;
    }


    // DADOS ENVIADOS PARA O BACKEND

    const dados = {

        propriedade_id,

        nome: $("nomeSafra").value.trim(),

        cultura: $("cultura").value,

        data_plantio: $("plantio").value,

        area_plantada: area,

        custo_total: $("custo").value === ""
            ? null
            : Number($("custo").value),

        observacoes: $("observacoes").value.trim(),

        status: safraEditando?.status || "Planejamento"

        // A data de colheita e o ano da safra
        // serão calculados no backend.
    };


    const botao = $("btnSalvarSafra");

    botao.disabled = true;
    botao.textContent = "Salvando...";


    try {

        let resposta;

        if (safraEditando) {

            resposta = await atualizarSafra(
                safraEditando.id,
                dados
            );

        } else {

            resposta = await cadastrarSafra(
                dados
            );
        }


        const salvo = resposta?.safra || resposta;

        if (!salvo?.id) {

            mensagemSafra(
                "Não foi possível salvar a safra. Confira os dados e a API."
            );

            return;
        }


        // ABRIR LISTAGEM DE SAFRAS APÓS SALVAR

        window.location.href = "safras.html";

    } catch (erro) {

        console.error(erro);

        mensagemSafra(
            "Ocorreu um erro ao salvar a safra."
        );

    } finally {

        botao.disabled = false;

        botao.textContent = safraEditando
            ? "Salvar alterações"
            : "Cadastrar safra";
    }
}


// ==========================================
// INICIALIZAR
// ==========================================

document.addEventListener("DOMContentLoaded", async () => {

    if (!obterUsuarioId()) {

        window.location.href = "login.html";

        return;
    }


    $("formSafra").addEventListener(
        "submit",
        salvarSafraFormulario
    );


    // CAMPOS QUE ATUALIZAM O RESUMO

    const campos = [
        "nomeSafra",
        "propriedade",
        "cultura",
        "plantio",
        "hectares",
        "custo"
    ];

    campos.forEach(id => {

        $(id).addEventListener(
            "input",
            atualizarResumoSafra
        );

        $(id).addEventListener(
            "change",
            atualizarResumoSafra
        );

    });


    // CARREGAR PROPRIEDADES PRIMEIRO

    const ok = await carregarPropriedadesSafra();

    if (!ok) {
        return;
    }


    // VERIFICAR PARÂMETROS DA URL

    const params = new URLSearchParams(
        window.location.search
    );

    const id = params.get("id");


    if (id) {

        const edicaoOk = await carregarEdicaoSafra(id);

        if (!edicaoOk) {
            return;
        }

    } else if (params.get("propriedade_id")) {

        const selecionada = params.get(
            "propriedade_id"
        );

        const existe = [
            ...$("propriedade").options
        ].some(
            opcao => opcao.value === selecionada
        );

        if (existe) {

            $("propriedade").value = selecionada;
        }
    }


    await atualizarResumoSafra();

});
