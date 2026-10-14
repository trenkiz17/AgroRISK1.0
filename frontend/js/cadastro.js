document.addEventListener("DOMContentLoaded", () => {

    document
        .getElementById("cadastroForm")
        .addEventListener("submit", cadastrarUsuario);

});


async function cadastrarUsuario(event) {

    event.preventDefault();

    const nome =
        document.getElementById("nome").value.trim();

    const email =
        document.getElementById("email").value.trim();

    const senha =
        document.getElementById("senha").value;


    if (
        nome === "" ||
        email === "" ||
        senha === ""
    ) {

        alert("Preencha todos os campos.");

        return;

    }


    try {

        const resposta = await cadastrarUsuarioAPI({

            nome: nome,
            email: email,
            senha: senha

        });


        if (!resposta) {

            alert("Erro ao conectar com a API.");

            return;

        }


        if (resposta.id) {

            alert("Conta criada com sucesso!");

            window.location.href = "login.html";

            return;

        }


        if (resposta.erro) {

            alert(resposta.erro);

            return;

        }


        alert("Não foi possível criar a conta.");

    }

    catch (erro) {

        console.error(
            "Erro no cadastro:",
            erro
        );

        alert(
            "Erro ao conectar com a API."
        );

    }

}   