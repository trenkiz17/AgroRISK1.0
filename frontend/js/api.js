// =============================================
// CONFIGURAÇÃO
// =============================================

const API_URL = "http://127.0.0.1:5000";


// =============================================
// USUÁRIO LOGADO
// =============================================

function obterUsuarioLogado() {

    try {

        return JSON.parse(
            localStorage.getItem("usuario")
        );

    } catch (erro) {

        console.error(
            "Erro ao recuperar usuário:",
            erro
        );

        return null;

    }

}


function obterUsuarioId() {

    const usuario =
        obterUsuarioLogado();

    return usuario?.id || null;

}


// =============================================
// REQUISIÇÃO
// =============================================

async function request(
    endpoint,
    method = "GET",
    dados = null
) {

    const config = {

        method: method,

        headers: {}

    };


    // Só envia Content-Type quando existe
    // um corpo JSON na requisição.
    //
    // Isso evita preflight OPTIONS desnecessário
    // em requisições GET.

    if (dados !== null) {

        config.headers["Content-Type"] =
            "application/json";

        config.body =
            JSON.stringify(dados);

    }


    try {

        const resposta =
            await fetch(
                API_URL + endpoint,
                config
            );


        const texto =
            await resposta.text();


        let resultado = null;


        if (texto) {

            try {

                resultado =
                    JSON.parse(texto);

            } catch {

                resultado = texto;

            }

        }


        if (!resposta.ok) {

            const mensagem =
                resultado?.erro ||
                resultado?.mensagem ||
                `Erro ${resposta.status}`;

            throw new Error(
                mensagem
            );

        }


        // 204 No Content significa operação concluída (ex.: DELETE).
        if (resposta.status === 204) return true;

        return resultado;

    }


    catch (erro) {

        console.error(
            "Erro na API:",
            erro
        );


        alert(
            erro.message ||
            "Erro ao comunicar com a API."
        );


        return null;

    }

}


// =============================================
// MÉTODOS HTTP
// =============================================

const get = endpoint =>
    request(
        endpoint,
        "GET"
    );


const post = (
    endpoint,
    dados
) =>
    request(
        endpoint,
        "POST",
        dados
    );


const put = (
    endpoint,
    dados
) =>
    request(
        endpoint,
        "PUT",
        dados
    );


const del = endpoint =>
    request(
        endpoint,
        "DELETE"
    );


// =============================================
// LOGIN
// =============================================

async function login(
    email,
    senha
) {

    return await post(
        "/login",
        {
            email,
            senha
        }
    );

}


// =============================================
// USUÁRIO
// =============================================

async function cadastrarUsuarioAPI(
    usuario
) {

    return await post(
        "/usuarios",
        usuario
    );

}


async function buscarPerfil(id) {

    return await get(
        `/usuarios/${id}`
    );

}


async function atualizarUsuario(
    id,
    dados
) {

    return await put(
        `/usuarios/${id}`,
        dados
    );

}


// =============================================
// PROPRIEDADES
// =============================================

async function listarPropriedades() {

    const usuarioId =
        obterUsuarioId();


    if (!usuarioId) {

        console.warn(
            "Nenhum usuário logado."
        );

        return [];

    }


    return await get(
        `/propriedades?usuario_id=${usuarioId}`
    );

}


async function buscarPropriedade(id) {

    const usuarioId =
        obterUsuarioId();


    return await get(
        `/propriedades/${id}?usuario_id=${usuarioId}`
    );

}


async function cadastrarPropriedade(
    dados
) {

    const usuarioId =
        obterUsuarioId();


    return await post(
        "/propriedades",
        {
            ...dados,
            usuario_id: usuarioId
        }
    );

}


async function atualizarPropriedade(
    id,
    dados
) {

    const usuarioId =
        obterUsuarioId();


    return await put(
        `/propriedades/${id}?usuario_id=${usuarioId}`,
        dados
    );

}


async function excluirPropriedade(id) {

    const usuarioId =
        obterUsuarioId();


    return await del(
        `/propriedades/${id}?usuario_id=${usuarioId}`
    );

}


// =============================================
// SAFRAS
// =============================================

async function listarSafras() {

    const usuarioId =
        obterUsuarioId();


    return await get(
        `/safras?usuario_id=${usuarioId}`
    );

}


async function listarSafrasDaPropriedade(
    propriedadeId
) {

    const usuarioId =
        obterUsuarioId();


    return await get(
        `/safras?propriedade_id=${propriedadeId}&usuario_id=${usuarioId}`
    );

}


async function buscarSafra(id) {

    const usuarioId =
        obterUsuarioId();


    return await get(
        `/safras/${id}?usuario_id=${usuarioId}`
    );

}


async function cadastrarSafra(
    dados
) {

    const usuarioId =
        obterUsuarioId();


    return await post(
        "/safras",
        {
            ...dados,
            usuario_id: usuarioId
        }
    );

}


async function atualizarSafra(
    id,
    dados
) {

    const usuarioId =
        obterUsuarioId();


    return await put(
        `/safras/${id}?usuario_id=${usuarioId}`,
        {
            ...dados,
            usuario_id: usuarioId
        }
    );

}


async function excluirSafra(id) {

    const usuarioId =
        obterUsuarioId();


    return await del(
        `/safras/${id}?usuario_id=${usuarioId}`
    );

}


// =============================================
// DASHBOARD
// =============================================

async function buscarDashboard() {

    return await get(
        "/dashboard"
    );

}


// =============================================
// RELATÓRIOS
// =============================================

async function buscarRelatorios() {

    return await get(
        "/relatorios"
    );

}


// =============================================
// CLIMA
// =============================================

async function buscarClima(
    lat,
    lon
) {

    if (
        lat === null ||
        lat === undefined ||
        lon === null ||
        lon === undefined
    ) {

        console.error(
            "Latitude e longitude são obrigatórias."
        );

        return null;

    }


    const latitude =
        encodeURIComponent(lat);


    const longitude =
        encodeURIComponent(lon);


    return await get(
        `/api/clima?lat=${latitude}&lon=${longitude}`
    );

}


// PREVISÃO DE CURTO PRAZO (ATÉ 4 DIAS)
async function buscarPrevisaoClima(lat, lon) {
    if (lat == null || lon == null) return null;

    const latitude = encodeURIComponent(lat);
    const longitude = encodeURIComponent(lon);

    return await get(
        `/api/clima/previsao?lat=${latitude}&lon=${longitude}`
    );
}


// =============================================
// ALIASES
// =============================================
//
// Mantemos estes nomes também para evitar
// problemas caso alguma tela esteja usando
// "criar" em vez de "cadastrar".

// PROPRIEDADE

async function criarPropriedade(
    dados
) {

    return await cadastrarPropriedade(
        dados
    );

}


// SAFRA

async function criarSafra(
    dados
) {

    return await cadastrarSafra(
        dados
    );

}


// ==========================================
// ESTIMATIVA INICIAL DE COLHEITA
// ==========================================

async function estimarColheita(cultura, dataPlantio) {

    const parametros = new URLSearchParams({
        cultura: cultura,
        data_plantio: dataPlantio
    });

    return await get(
        `/safras/estimar-colheita?${parametros.toString()}`
    );

}
