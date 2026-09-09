/* =======================================================
   PARTE 1: LÓGICA DOS ALUNOS E TREINOS (Roda no painel.html)
   ======================================================= */

// 1. FUNÇÃO READ (LER) - Busca os alunos salvos no navegador
function obterAlunos() {
    const alunosAtuais = localStorage.getItem('listaAlunos');
    return alunosAtuais ? JSON.parse(alunosAtuais) : [];
}

// 2. FUNÇÃO CREATE (CRIAR) - Cadastra um novo aluno
function cadastrarAluno(nome, idade, objetivo) {
    const listaDeAlunos = obterAlunos();

    const novoAluno = {
        id: Date.now(),
        nome: nome,
        idade: idade,
        objetivo: objetivo,
        historicoTreinos: []
    };

    listaDeAlunos.push(novoAluno);
    localStorage.setItem('listaAlunos', JSON.stringify(listaDeAlunos));
}

// VARIÁVEL GLOBAL PARA CONTROLAR O ALUNO SELECIONADO
let alunoSelecionadoAtual = "";

// 3. FUNÇÃO PARA ATUALIZAR A LISTA NA TELA
function atualizarListaNaTela() {
    const listaTela = document.getElementById('listaTela');
    if (!listaTela) return; // Se não estiver na tela do painel, ignora

    const listaDeAlunos = obterAlunos();
    listaTela.innerHTML = "";

    listaDeAlunos.forEach(function(aluno) {
        const itemLista = document.createElement('li');

        itemLista.innerHTML = `
            <div class="aluno-info">
                <span class="link-nome" style="cursor:pointer; text-decoration: underline;"><strong>${aluno.nome}</strong></span> - ${aluno.objetivo}
            </div>
            <div class="aluno-botoes">
                <button class="btn-whatsapp">Treinos 📱</button>
                <button class="btn-editar">✏️</button>
                <button class="btn-deletar">❌</button>
            </div>
        `;

        itemLista.querySelector('.link-nome').addEventListener('click', function() {
            abrirJanelaHistorico(aluno.id);
        });

        itemLista.querySelector('.btn-whatsapp').addEventListener('click', function() {
            abrirJanelaTreino(aluno.nome);
        });

        itemLista.querySelector('.btn-editar').addEventListener('click', function() {
            editarAluno(aluno.id);
        });

        itemLista.querySelector('.btn-deletar').addEventListener('click', function() {
            deletarAluno(aluno.id);
        });

        listaTela.appendChild(itemLista);
    });
}

// FUNÇÕES DA PRIMEIRA JANELA (MONTAR TREINO)
function abrirJanelaTreino(nomeDoAluno) {
    alunoSelecionadoAtual = nomeDoAluno;
    document.getElementById('tituloModal').innerText = `Montar Treino para ${nomeDoAluno}`;
    document.getElementById('textoTreino').value = "";
    document.getElementById('janelaModal').className = "modal-visivel";
}

function fecharJanelaTreino() {
    document.getElementById('janelaModal').className = "modal-oculto";
}

// FUNÇÕES DA SEGUNDA JANELA (VER HISTÓRICO)
function abrirJanelaHistorico(idDoAluno) {
    const listaDeAlunos = obterAlunos();
    const aluno = listaDeAlunos.find(a => a.id === idDoAluno);

    if (aluno) {
        document.getElementById('tituloHistorico').innerText = `Histórico de ${aluno.nome}`;
        const containerTreinos = document.getElementById('listaHistoricoTreinos');
        containerTreinos.innerHTML = "";

        if (!aluno.historicoTreinos || aluno.historicoTreinos.length === 0) {
            containerTreinos.innerHTML = "<p style='color: #7c7c8a;'>Nenhum treino enviado anteriormente.</p>";
        } else {
            aluno.historicoTreinos.slice().reverse().forEach(function(item) {
                const caixaTreino = document.createElement('div');
                caixaTreino.className = "item-historico";
                caixaTreino.innerHTML = `
                    <small style="color: #00b37e;">Data: ${item.data}</small>
                    <pre style="white-space: pre-wrap; font-family: inherit; color: #e1e1e6; margin-top: 5px;">${item.treino}</pre>
                    <hr style="border: 0; border-top: 1px solid #29292e; margin: 10px 0;">
                `;
                containerTreinos.appendChild(caixaTreino);
            });
        }

        document.getElementById('janelaHistorico').className = "modal-visivel";
    }
}

function fecharJanelaHistorico() {
    document.getElementById('janelaHistorico').className = "modal-oculto";
}

// 4. ESCUTANDO O FORMULÁRIO DE CADASTRO DE ALUNOS
const form = document.getElementById('formCadastro');
if (form) {
    form.addEventListener('submit', function(evento) {
        evento.preventDefault();
        const nome = document.getElementById('nomeAluno').value;
        const idade = document.getElementById('idadeAluno').value;
        const objetivo = document.getElementById('objetivoAluno').value;

        cadastrarAluno(nome, idade, objetivo);
        atualizarListaNaTela();
        form.reset();
    });
}

// 5. ENVIAR WHATSAPP E ADICIONAR AO HISTÓRICO AUTOMATICAMENTE
const btnWhats = document.getElementById('btnEnviarWhats');
if (btnWhats) {
    btnWhats.addEventListener('click', function() {
        const treino = document.getElementById('textoTreino').value;

        if (treino.trim() !== "") {
            const listaDeAlunos = obterAlunos();
            const aluno = listaDeAlunos.find(a => a.nome === alunoSelecionadoAtual);

            if (aluno) {
                if (!aluno.historicoTreinos) aluno.historicoTreinos = [];
                const dataAtual = new Date().toLocaleDateString('pt-BR');

                aluno.historicoTreinos.push({
                    data: dataAtual,
                    treino: treino
                });

                localStorage.setItem('listaAlunos', JSON.stringify(listaDeAlunos));
            }

            const mensagem = `Olá, ${alunoSelecionadoAtual}! 💪\n\nAqui está o seu treino de hoje:\n\n${treino}`;
            const linkWhatsapp = `https://api.whatsapp.com/send?text=${encodeURIComponent(mensagem)}`;
            window.open(linkWhatsapp, '_blank');

            fecharJanelaTreino();
        } else {
            alert("Digite um treino antes de enviar!");
        }
    });
}

// FUNÇÃO EDITAR ALUNO
function editarAluno(idDoAluno) {
    const listaDeAlunos = obterAlunos();
    const aluno = listaDeAlunos.find(a => a.id === idDoAluno);

    if (!aluno) return;

    const novoNome = prompt("Editar Nome do Aluno:", aluno.nome);
    if (novoNome === null) return; //Se cancelar, não altera nada

    const novaIdade = prompt("Editar Idade do Aluno:", aluno.idade);
    if (novaIdade === null) return;

    const novoObjetivo = prompt("Editar Objetivo do Aluno:", aluno.objetivo);
    if (novoObjetivo === null) return;

    // Atualiza os dados no objetivo
    aluno.nome = novoNome.trim() !== "" ? novoNome : aluno.nome;
    aluno.idade = novaIdade.trim() !== "" ? novaIdade : aluno.idade;
    aluno.objetivo = novoObjetivo.trim() !== "" ? novoObjetivo : aluno.objetivo;

    // Salvar a lista atualizada no localStorage e recarrega a tela
    localStorage.setItem('listaAlunos', JSON.stringify(listaDeAlunos));
    atualizarListaNaTela();
}

// FUNÇÃO DELETAR ALUNO
function deletarAluno(idDoAluno) {
    if (confirm("Tem certeza que deseja remover este aluno?")) {
        const listaDeAlunos = obterAlunos();
        const listaAtualizada = listaDeAlunos.filter(aluno => aluno.id !== idDoAluno);
        localStorage.setItem('listaAlunos', JSON.stringify(listaAtualizada));
        atualizarListaNaTela();
    }
}

// Atualiza a lista na tela se estiver no painel
atualizarListaNaTela();


/* =======================================================
   PARTE 2: AUTENTICAÇÃO E REDIRECIONAMENTO (index.html)
   ======================================================= */
document.addEventListener("DOMContentLoaded", function() {

    // Se já estiver logado e tentar acessar a tela de login, manda direto pro painel
    if (window.location.pathname.endsWith("index.html") || window.location.pathname === "/") {
        if (localStorage.getItem("personalLogado") === "true") {
            window.location.href = "painel.html";
        }
    }

    const boxCadastro = document.getElementById("box-cadastro");
    const boxLogin = document.getElementById("box-login");
    const irParaLogin = document.getElementById("ir-para-login");
    const irParaCadastro = document.getElementById("ir-para-cadastro");

    const formCadastro = document.getElementById("cadastroPersonal");
    const formLogin = document.getElementById("loginPersonal");

    // Alternar telas na index.html
    if (irParaLogin && irParaCadastro) {
        irParaLogin.addEventListener("click", function(e) {
            e.preventDefault();
            boxCadastro.classList.add("hide");
            boxLogin.classList.remove("hide");
        });

        irParaCadastro.addEventListener("click", function(e) {
            e.preventDefault();
            boxLogin.classList.add("hide");
            boxCadastro.classList.remove("hide");
        });
    }

    // Lógica de Criar Conta
    if (formCadastro) {
        formCadastro.addEventListener("submit", function(e) {
            e.preventDefault();

            const nome = document.getElementById("cad-nome").value;
            const email = document.getElementById("cad-email").value;
            const senha = document.getElementById("cad-senha").value;

            const dadosPersonal = { nome, email, senha };
            localStorage.setItem("contaPersonal", JSON.stringify(dadosPersonal));

            alert(`Conta criada com sucesso, Professor(a) ${nome}!`);
            formCadastro.reset();
            boxCadastro.classList.add("hide");
            boxLogin.classList.remove("hide");
        });
    }

    // Lógica de Entrar
    if (formLogin) {
        formLogin.addEventListener("submit", function(e) {
            e.preventDefault();

            const emailDigitado = document.getElementById("login-email").value;
            const senhaDigitada = document.getElementById("login-senha").value;
            const dadosSalvos = localStorage.getItem("contaPersonal");

            if (!dadosSalvos) {
                alert("Nenhum personal cadastrado neste navegador. Crie uma conta primeiro!");
                return;
            }

            const conta = JSON.parse(dadosSalvos);

            if (emailDigitado === conta.email && senhaDigitada === conta.senha) {
                alert(`Seja bem-vindo de volta, ${conta.nome}!`);
                localStorage.setItem("personalLogado", "true");

                // REDIRECIONA PARA A PÁGINA DO PAINEL!
                window.location.href = "painel.html";
            } else {
                alert("E-mail ou senha incorretos! Tente novamente.");
            }
        });
    }
}); // <-- Fim do DOMContentLoaded


/* =======================================================
   PARTE 3: FUNÇÃO GLOBAL DE LOGOUT (Fora de tudo)
   ======================================================= */
function fazerLogout() {
    localStorage.removeItem("personalLogado");
    window.location.href = "index.html";
}