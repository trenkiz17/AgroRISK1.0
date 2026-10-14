
document.addEventListener("DOMContentLoaded", () => {

    // ==========================================
    // USUÁRIO LOGADO
    // ==========================================

    const usuario = obterUsuarioLogado();

    if (!usuario || !usuario.id) {
        alert("Faça login para acessar seu perfil.");
        window.location.href = "login.html";
        return;
    }

    const usuarioId = usuario.id;


    // ==========================================
    // CAMPOS DO PERFIL
    // ==========================================

    // Compatível com o HTML original, que não
    // tinha ID em todos os campos.

    const grupoCampos = document.querySelector(
        ".profile-right .profile-card:first-child .profile-grid"
    );

    const campos = Array.from(
        grupoCampos?.querySelectorAll(".form-control") || []
    );

    function buscarCampo(id, posicao) {
        return document.getElementById(id) || campos[posicao];
    }

    const nome = buscarCampo("nome", 0);
    const email = buscarCampo("email", 1);
    const telefone = buscarCampo("telefonefield", 2);
    const cpf = buscarCampo("cpffield", 3);
    const dataNascimento = buscarCampo("dataNascimento", 4);
    const estado = buscarCampo("estado", 5);
    const cidade = buscarCampo("cidade", 6);
    const idioma = buscarCampo("idioma", 7);

    const botaoSalvar = document.querySelector(".btn-profile-save");
    const botaoCancelar = document.querySelector(".btn-profile-cancel");
    const formulario = document.getElementById("perfilForm");

    if (
        !nome || !email || !telefone || !cpf ||
        !dataNascimento || !estado || !cidade || !idioma
    ) {
        console.error("Os campos do perfil não foram encontrados.");
        alert("Erro na estrutura da tela de perfil.");
        return;
    }

    let ultimoPerfil = null;


    // ==========================================
    // MENSAGENS NA PRÓPRIA PÁGINA
    // ==========================================

    const mensagem = document.createElement("div");

    mensagem.setAttribute("role", "status");
    mensagem.className = "alert mt-3";
    mensagem.hidden = true;

    const areaAcoes = document.querySelector(".profile-actions");

    if (areaAcoes) {
        areaAcoes.insertAdjacentElement("afterend", mensagem);
    }

    function mostrarMensagem(texto, sucesso = false) {
        mensagem.textContent = texto;
        mensagem.className = sucesso
            ? "alert alert-success mt-3"
            : "alert alert-danger mt-3";

        mensagem.hidden = false;
    }


    // ==========================================
    // FORMATAR CPF
    // ==========================================

    function formatarCPF(valor) {
        const numeros = String(valor || "")
            .replace(/\D/g, "")
            .slice(0, 11);

        return numeros
            .replace(/^(\d{3})(\d)/, "$1.$2")
            .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
            .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    }

    cpf.addEventListener("input", function () {
        this.value = formatarCPF(this.value);
    });


    // ==========================================
    // FORMATAR TELEFONE
    // ==========================================

    function formatarTelefone(valor) {
        const numeros = String(valor || "")
            .replace(/\D/g, "")
            .slice(0, 11);

        if (numeros.length <= 2) {
            return numeros;
        }

        if (numeros.length <= 6) {
            return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;
        }

        if (numeros.length <= 10) {
            return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 6)}-${numeros.slice(6)}`;
        }

        return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`;
    }

    telefone.addEventListener("input", function () {
        this.value = formatarTelefone(this.value);
    });


    // ==========================================
    // SELECIONAR VALOR
    // ==========================================

    // Permite exibir um estado cadastrado no
    // banco mesmo que não esteja nas opções
    // do select antigo.

    function definirValor(elemento, valor) {
        const texto = valor == null ? "" : String(valor);

        if (
            elemento.tagName === "SELECT" &&
            texto &&
            !Array.from(elemento.options).some(
                opcao => opcao.value === texto
            )
        ) {
            elemento.add(new Option(texto, texto));
        }

        elemento.value = texto;
    }


    // ==========================================
    // ATUALIZAR NOME E CONTA NA TELA
    // ==========================================

    function atualizarIdentificacao(perfil) {

        const nomeTopo = document.querySelector(
            ".perfil-topo strong"
        );

        if (nomeTopo) {
            nomeTopo.textContent = perfil.nome || "Usuário";
        }

        const tipoTopo = document.querySelector(
            ".perfil-topo small"
        );

        if (tipoTopo) {
            tipoTopo.textContent = "Conta AgroRisk";
        }

        const nomeCartao = document.getElementById("nomeCartao");

        if (nomeCartao) {
            nomeCartao.textContent = perfil.nome || "Usuário";
        }

        const emailCartao = document.getElementById("emailCartao");

        if (emailCartao) {
            emailCartao.textContent = perfil.email || "";
        }

        const contaId = document.getElementById("contaId");

        if (contaId) {
            contaId.textContent = "#" + perfil.id;
        }

        const contaEmail = document.getElementById("contaEmail");

        if (contaEmail) {
            contaEmail.textContent = perfil.email || "";
        }

        const avatar = document.getElementById("avatarPerfil");

        if (avatar) {
            const partes = (perfil.nome || "AgroRisk")
                .trim()
                .split(/\s+/);

            avatar.textContent = partes
                .slice(0, 2)
                .map(parte => parte[0].toUpperCase())
                .join("");
        }
    }


    // ==========================================
    // PREENCHER TODOS OS CAMPOS
    // ==========================================

    function preencherPerfil(perfil) {

        nome.value = perfil.nome || "";
        email.value = perfil.email || "";
        telefone.value = formatarTelefone(perfil.telefone);
        cpf.value = formatarCPF(perfil.cpf);

        dataNascimento.value = perfil.data_nascimento
            ? String(perfil.data_nascimento).slice(0, 10)
            : "";

        definirValor(estado, perfil.estado || "");
        cidade.value = perfil.cidade || "";
        definirValor(idioma, perfil.idioma || "Português");

        atualizarIdentificacao(perfil);
    }


    // ==========================================
    // CARREGAR PERFIL PELO BANCO
    // ==========================================

    async function carregarPerfil() {

        if (botaoSalvar) {
            botaoSalvar.disabled = true;
        }

        try {

            const perfil = await buscarPerfil(usuarioId);

            if (!perfil || !perfil.id) {
                mostrarMensagem(
                    "Não foi possível carregar o perfil. Verifique a API."
                );
                return;
            }

            ultimoPerfil = perfil;
            preencherPerfil(perfil);

        } catch (erro) {

            console.error("Erro ao carregar perfil:", erro);

            mostrarMensagem(
                "Erro ao consultar os dados do seu perfil."
            );

        } finally {

            if (botaoSalvar) {
                botaoSalvar.disabled = false;
            }
        }
    }


    // ==========================================
    // FOTO DE PERFIL
    // ==========================================

    const inputFoto = document.getElementById("fotoPerfil");
    const previewFoto = document.getElementById("previewFoto");
    const previewFotoTopo = document.getElementById("previewFotoTopo");

    // Cada conta tem sua própria foto neste navegador.
    const chaveFoto = `fotoPerfil_${usuarioId}`;

    function mostrarFoto(caminho) {

        if (previewFoto) {
            previewFoto.src = caminho;
        }

        if (previewFotoTopo) {
            previewFotoTopo.src = caminho;
        }
    }

    // Imagem padrão sem depender de arquivos externos.
    const imagemPadrao =
        "data:image/svg+xml;charset=UTF-8," +
        encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg"
                 width="300" height="300"
                 viewBox="0 0 300 300">
                <rect width="300" height="300" fill="#166534"/>
                <circle cx="150" cy="115" r="55" fill="#dcfce7"/>
                <path d="M55 285c0-80 45-110 95-110s95 30 95 110"
                      fill="#dcfce7"/>
            </svg>
        `);

    const fotoArmazenada = localStorage.getItem(chaveFoto);

    mostrarFoto(fotoArmazenada || imagemPadrao);

    if (inputFoto) {

        inputFoto.accept = "image/*";

        inputFoto.addEventListener("change", function () {

            const arquivo = this.files[0];

            if (!arquivo) return;

            if (!arquivo.type.startsWith("image/")) {
                mostrarMensagem("Selecione um arquivo de imagem.");
                return;
            }

            // Limite para não ultrapassar a capacidade
            // de armazenamento do navegador.
            if (arquivo.size > 2 * 1024 * 1024) {
                mostrarMensagem(
                    "Escolha uma imagem com até 2 MB."
                );
                return;
            }

            const leitor = new FileReader();

            leitor.onload = function (evento) {

                try {

                    const imagem = evento.target.result;

                    localStorage.setItem(chaveFoto, imagem);

                    mostrarFoto(imagem);

                    mostrarMensagem(
                        "Foto atualizada neste navegador. O envio da foto ao banco será implementado depois.",
                        true
                    );

                } catch (erro) {

                    console.error("Erro ao armazenar foto:", erro);

                    mostrarMensagem(
                        "Não foi possível salvar a foto no navegador."
                    );
                }
            };

            leitor.readAsDataURL(arquivo);
        });
    }


    // ==========================================
    // SALVAR TODAS AS INFORMAÇÕES
    // ==========================================

    async function salvarPerfil(evento) {

        evento.preventDefault();

        if (!ultimoPerfil) {
            mostrarMensagem("Aguarde o carregamento do perfil.");
            return;
        }

        const dados = {

            nome: nome.value.trim(),

            email: email.value.trim(),

            telefone: telefone.value.trim() || null,

            cpf: cpf.value.trim() || null,

            data_nascimento: dataNascimento.value || null,

            estado: estado.value.trim() || null,

            cidade: cidade.value.trim() || null,

            idioma: idioma.value || "Português"

        };

        // ======================================
        // VALIDAÇÕES
        // ======================================

        if (!dados.nome || !dados.email) {

            mostrarMensagem("Nome e e-mail são obrigatórios.");
            return;
        }

        if (!email.checkValidity()) {

            mostrarMensagem("Digite um e-mail válido.");
            return;
        }

        const numerosCPF = (dados.cpf || "").replace(/\D/g, "");

        if (dados.cpf && numerosCPF.length !== 11) {

            mostrarMensagem("O CPF precisa ter 11 dígitos.");
            return;
        }

        const numerosTelefone = (dados.telefone || "")
            .replace(/\D/g, "");

        if (
            dados.telefone &&
            ![10, 11].includes(numerosTelefone.length)
        ) {

            mostrarMensagem("Informe um telefone com DDD.");
            return;
        }

        // ======================================
        // ENVIAR DADOS PARA A API
        // ======================================

        const textoOriginal = botaoSalvar?.innerHTML;

        if (botaoSalvar) {
            botaoSalvar.disabled = true;
            botaoSalvar.textContent = "Salvando...";
        }

        mensagem.hidden = true;

        try {

            const resposta = await atualizarUsuario(
                usuarioId,
                dados
            );

            if (!resposta || !resposta.id) {

                mostrarMensagem(
                    "Não foi possível atualizar o perfil."
                );

                return;
            }

            // ==================================
            // CONFIRMAR DADOS SALVOS NA API
            // ==================================

            const perfilConfirmado = await buscarPerfil(usuarioId);

            if (!perfilConfirmado || !perfilConfirmado.id) {

                mostrarMensagem(
                    "A atualização foi enviada, mas não foi possível confirmar os dados."
                );

                return;
            }

            ultimoPerfil = perfilConfirmado;

            preencherPerfil(perfilConfirmado);

            // ==================================
            // ATUALIZAR USUÁRIO LOGADO
            // ==================================

            const usuarioAtual = obterUsuarioLogado() || {};

            localStorage.setItem(
                "usuario",
                JSON.stringify({
                    ...usuarioAtual,
                    id: perfilConfirmado.id,
                    nome: perfilConfirmado.nome,
                    email: perfilConfirmado.email
                })
            );

            // ==================================
            // MENSAGEM DE SUCESSO
            // ==================================

            mostrarMensagem(
                "Perfil atualizado com sucesso! Dados confirmados pela API.",
                true
            );

            // Permanece na página do perfil.
            // Não existe redirecionamento aqui.

        } catch (erro) {

            console.error("Erro ao salvar perfil:", erro);

            mostrarMensagem(
                "Ocorreu um erro ao atualizar o perfil."
            );

        } finally {

            if (botaoSalvar) {
                botaoSalvar.disabled = false;
                botaoSalvar.innerHTML = textoOriginal;
            }
        }
    }


    // ==========================================
    // SALVAR: HTML ANTIGO OU NOVO
    // ==========================================

    if (formulario) {

        formulario.addEventListener("submit", salvarPerfil);

    } else if (botaoSalvar) {

        botaoSalvar.addEventListener("click", salvarPerfil);
    }


    // ==========================================
    // CANCELAR ALTERAÇÕES
    // ==========================================

    if (botaoCancelar) {

        botaoCancelar.addEventListener("click", function (evento) {

            evento.preventDefault();

            if (!confirm("Deseja desfazer as alterações?")) {
                return;
            }

            if (ultimoPerfil) {
                preencherPerfil(ultimoPerfil);
                mensagem.hidden = true;
            }
        });
    }


    // ==========================================
    // INICIAR
    // ==========================================

    carregarPerfil();

});
