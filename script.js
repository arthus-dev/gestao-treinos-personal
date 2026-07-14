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
        historicoTreinos: [] // NOVO: Agora todo aluno nasce com uma lista de treinos vazia!
    };

    listaDeAlunos.push(novoAluno);
    localStorage.setItem('listaAlunos', JSON.stringify(listaDeAlunos));
}

// VARIÁVEIS GLOBAIS PARA CONTROLAR O ALUNO SELECIONADO
let alunoSelecionadoAtual = "";

// 3. FUNÇÃO PARA ATUALIZAR A LISTA NA TELA
function atualizarListaNaTela() {
    const listaTela = document.getElementById('listaTela');
    const listaDeAlunos = obterAlunos();

    listaTela.innerHTML = "";

    listaDeAlunos.forEach(function(aluno) {
        const itemLista = document.createElement('li');

        // NOVO: Adicionamos a classe 'link-nome' ao redor do nome do aluno para torná-lo clicável
        itemLista.innerHTML = `
            <div class="aluno-info">
                <span class="link-nome" style="cursor:pointer; text-decoration: underline;"><strong>${aluno.nome}</strong></span> - ${aluno.objetivo}
            </div>
            <div class="aluno-botoes">
                <button class="btn-whatsapp">Treinos 📱</button>
                <button class="btn-deletar">❌</button>
            </div>
        `;

        // NOVO: Escuta o clique no NOME do aluno para abrir o histórico
        itemLista.querySelector('.link-nome').addEventListener('click', function() {
            abrirJanelaHistorico(aluno.id);
        });

        itemLista.querySelector('.btn-whatsapp').addEventListener('click', function() {
            abrirJanelaTreino(aluno.nome);
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
    // Encontra o aluno correto pelo ID
    const aluno = listaDeAlunos.find(a => a.id === idDoAluno);

    if (aluno) {
        document.getElementById('tituloHistorico').innerText = `Histórico de ${aluno.nome}`;
        const containerTreinos = document.getElementById('listaHistoricoTreinos');
        containerTreinos.innerHTML = ""; // Limpa histórico anterior da janela

        // Se o aluno não tiver nenhum treino salvo ainda
        if (!aluno.historicoTreinos || aluno.historicoTreinos.length === 0) {
            containerTreinos.innerHTML = "<p style='color: #7c7c8a;'>Nenhum treino enviado anteriormente.</p>";
        } else {
            // Mostra os treinos do mais novo para o mais antigo (.reverse())
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

// 4. ESCUTANDO O FORMULÁRIO DE CADASTRO
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

            // Encontra o aluno atual no banco de dados para salvar o treino dele
            const aluno = listaDeAlunos.find(a => a.nome === alunoSelecionadoAtual);

            if (aluno) {
                // Se por acaso o aluno antigo não tiver a propriedade de histórico, criamos agora
                if (!aluno.historicoTreinos) aluno.historicoTreinos = [];

                // Formata a data atual (Ex: 11/07/2026)
                const dataAtual = new Date().toLocaleDateString('pt-BR');

                // Salva o treino e a data no histórico dele
                aluno.historicoTreinos.push({
                    data: dataAtual,
                    treino: treino
                });

                // Atualiza o banco de dados do navegador
                localStorage.setItem('listaAlunos', JSON.stringify(listaDeAlunos));
            }

            // Envia para o WhatsApp
            const mensagem = `Olá, ${alunoSelecionadoAtual}! 💪\n\nAqui está o seu treino de hoje:\n\n${treino}`;
            const linkWhatsapp = `https://api.whatsapp.com/send?text=${encodeURIComponent(mensagem)}`;
            window.open(linkWhatsapp, '_blank');

            fecharJanelaTreino();
        } else {
            alert("Digite um treino antes de enviar!");
        }
    });
}

// FUNÇÃO DELETAR
function deletarAluno(idDoAluno) {
    if (confirm("Tem certeza que deseja remover este aluno?")) {
        const listaDeAlunos = obterAlunos();
        const listaAtualizada = listaDeAlunos.filter(aluno => aluno.id !== idDoAluno);
        localStorage.setItem('listaAlunos', JSON.stringify(listaAtualizada));
        atualizarListaNaTela();
    }
}

// MOSTRAR OS ALUNOS SALVOS ASSIM QUE A PÁGINA ABRIR
atualizarListaNaTela();