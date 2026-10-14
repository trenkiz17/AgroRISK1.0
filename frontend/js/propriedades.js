// ======================================
// MINHAS PROPRIEDADES
// ======================================


document.addEventListener("DOMContentLoaded", () => {

    const usuario = obterUsuarioLogado();

    if (!usuario?.id) {
        window.location.href = "login.html";
        return;
    }

    // Mostrar nome e foto do usuário
    carregarPerfilTopoPropriedades(usuario);

    // Manter o carregamento das propriedades
    carregarPropriedades();

});



// ==========================================
// FOTO E NOME DO USUÁRIO - MINHAS PROPRIEDADES
// ==========================================

function carregarPerfilTopoPropriedades(usuario) {

    const nome = document.getElementById(
        "nomeUsuarioPropriedades"
    );

    const imagem = document.getElementById(
        "fotoUsuarioPropriedades"
    );

    const icone = document.getElementById(
        "iconeUsuarioPropriedades"
    );

    // Mostrar o nome do usuário logado
    if (nome) {
        nome.textContent = usuario.nome || "Usuário";
    }

    if (!imagem || !icone) {
        return;
    }

    // Buscar a mesma foto usada no Dashboard
    const foto = localStorage.getItem(
        `fotoPerfil_${usuario.id}`
    );

    // Sem foto: mostrar o ícone padrão
    if (!foto) {
        imagem.hidden = true;
        icone.hidden = false;
        return;
    }

    // Se a imagem não carregar, mostrar o ícone
    imagem.onerror = () => {
        imagem.hidden = true;
        icone.hidden = false;
    };

    // Mostrar foto cadastrada
    imagem.src = foto;
    imagem.hidden = false;
    icone.hidden = true;
}



// ======================================
// CARREGAR PROPRIEDADES
// ======================================

async function carregarPropriedades() {

    const container =
        document.getElementById("listaPropriedades");

    try {

        const propriedades =
            await listarPropriedades();

        if (!propriedades || propriedades.length === 0) {

            container.innerHTML = `

                <div class="sem-propriedades">

                    <i class="fa-solid fa-map-location-dot"></i>

                    <h3>Nenhuma propriedade cadastrada</h3>

                    <p>
                        Cadastre sua primeira propriedade
                        para começar o monitoramento.
                    </p>

                    <a href="cadastro_propriedade.html"
                       class="btn-nova-propriedade">

                        <i class="fa-solid fa-plus"></i>

                        Cadastrar Propriedade

                    </a>

                </div>

            `;

            return;

        }


        container.innerHTML = "";


        propriedades.forEach(propriedade => {

            const card =
                criarCardPropriedade(propriedade);

            container.innerHTML += card;

        });

    }

    catch (erro) {

        console.error(erro);

        container.innerHTML = `

            <div class="sem-propriedades">

                <i class="fa-solid fa-triangle-exclamation"></i>

                <h3>Erro ao carregar propriedades</h3>

                <p>
                    Não foi possível carregar suas propriedades.
                </p>

                <button
                    class="btn-nova-propriedade"
                    onclick="carregarPropriedades()">

                    Tentar novamente

                </button>

            </div>

        `;

    }

}


// ======================================
// CRIAR CARD
// ======================================

function criarCardPropriedade(propriedade) {

    const nome =
        propriedade.nome || "Sem nome";

    const cidade =
        propriedade.cidade || "-";

    const estado =
        propriedade.estado || "-";

    const area =
        propriedade.area || 0;

    const perimetro =
        propriedade.perimetro || 0;


    return `

        <div class="propriedade-card">

            <div class="propriedade-card-top">

                <div class="propriedade-icon">

                    <i class="fa-solid fa-tractor"></i>

                </div>

                <span class="propriedade-status">

                    <i class="fa-solid fa-circle"></i>

                    Ativa

                </span>

            </div>


            <div class="propriedade-card-body">

                <h3>

                    ${nome}

                </h3>

                <p class="localizacao">

                    <i class="fa-solid fa-location-dot"></i>

                    ${cidade} - ${estado}

                </p>


                <div class="propriedade-info">

                    <div>

                        <span>Área</span>

                        <strong>
                            ${area} ha
                        </strong>

                    </div>

                    <div>

                        <span>Perímetro</span>

                        <strong>
                            ${perimetro} m
                        </strong>

                    </div>

                </div>

            </div>


            <div class="propriedade-card-footer">

                <a
                    href="monitoramento.html?id=${propriedade.id}"
                    class="btn-monitoramento">

                    <i class="fa-solid fa-chart-line"></i>

                    Monitoramento

                    <i class="fa-solid fa-arrow-right"></i>

                </a>


                <button
                    type="button"
                    class="btn-excluir"
                    onclick="excluirPropriedadeCard(${propriedade.id}, '${nome.replace(/'/g, "\\'")}')">

                    <i class="fa-solid fa-trash"></i>

                    Excluir

                </button>

            </div>

        </div>

    `;

}


// ======================================
// EXCLUIR PROPRIEDADE
// ======================================

async function excluirPropriedadeCard(id, nome) {

    const confirmar =
        confirm(
            `Tem certeza que deseja excluir a propriedade "${nome}"?`
        );

    if (!confirmar) {

        return;

    }


    try {

        const resposta =
            await excluirPropriedade(id);


        if (!resposta) {

            alert(
                "Não foi possível excluir a propriedade."
            );

            return;

        }


        alert(
            "Propriedade excluída com sucesso!"
        );


        // Atualiza a lista depois da exclusão

        await carregarPropriedades();

    }

    catch (erro) {

        console.error(erro);

        alert(
            "Erro ao excluir a propriedade."
        );

    }

}