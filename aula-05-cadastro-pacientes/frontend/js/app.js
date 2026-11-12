
/*
  AULA 09 - CADASTRO DE PACIENTES
  Frontend integrado ao PostgreSQL do Supabase
  Backend hospedado no Render
*/

// URL da API do Eduardo
const URL_API = 'https://api-clinica-eduardo-mente.onrender.com/pacientes';

// Elementos do HTML
const formulario = document.getElementById('form-paciente');
const tabela = document.getElementById('tabela-pacientes');
const mensagem = document.getElementById('mensagem');
const mensagemCarregando = document.getElementById('carregando');

const campoId = document.getElementById('id');
const campoNome = document.getElementById('nome');
const campoEmail = document.getElementById('email');
const campoNascimento = document.getElementById('nascimento');

const botaoSalvar = document.getElementById('btn-salvar');
const botaoCancelar = document.getElementById('btn-cancelar');

const campoBuscar = document.getElementById('buscar-nome');
const totalPacientes = document.getElementById('total-pacientes');

// Controle de consultas
let numeroBusca = 0;
let atualizandoDados = false;

// Formatar data
function formatarData(dataISO) {
  if (!dataISO) return '';

  const [ano, mes, dia] = dataISO.slice(0, 10).split('-');
  return `${dia}/${mes}/${ano}`;
}

// Exibir mensagens
function mostrarMensagem(texto, tipo = 'danger') {
  mensagem.innerHTML = '';

  const alerta = document.createElement('div');
  alerta.className = `alert alert-${tipo}`;
  alerta.textContent = texto;

  mensagem.appendChild(alerta);
}

// Criar célula da tabela
function criarCelula(texto) {
  const celula = document.createElement('td');
  celula.textContent = texto ?? '';
  return celula;
}

// Mostrar pacientes na tabela
function renderizarTabela(pacientes) {
  tabela.innerHTML = '';

  if (pacientes.length === 0) {
    const linha = document.createElement('tr');
    const celula = document.createElement('td');

    celula.colSpan = 5;
    celula.className = 'text-center text-muted py-4';
    celula.textContent = 'Nenhum paciente encontrado.';

    linha.appendChild(celula);
    tabela.appendChild(linha);
    return;
  }

  pacientes.forEach((paciente) => {
    const linha = document.createElement('tr');

    linha.appendChild(criarCelula(paciente.id));
    linha.appendChild(criarCelula(paciente.nome));
    linha.appendChild(criarCelula(paciente.email));

    linha.appendChild(
      criarCelula(formatarData(paciente.nascimento))
    );

    const celulaAcoes = document.createElement('td');

    // Botão EDITAR
    const botaoEditar = document.createElement('button');
    botaoEditar.textContent = 'Editar';
    botaoEditar.className = 'btn btn-sm btn-outline-primary me-2';

    botaoEditar.addEventListener('click', () => {
      iniciarEdicao(paciente);
    });

    // Botão EXCLUIR
    const botaoExcluir = document.createElement('button');
    botaoExcluir.textContent = 'Excluir';
    botaoExcluir.className = 'btn btn-sm btn-outline-danger';

    botaoExcluir.addEventListener('click', () => {
      excluirPaciente(paciente.id);
    });

    celulaAcoes.appendChild(botaoEditar);
    celulaAcoes.appendChild(botaoExcluir);

    linha.appendChild(celulaAcoes);
    tabela.appendChild(linha);
  });
}

// Preparar formulário para editar
function iniciarEdicao(paciente) {
  campoId.value = paciente.id;
  campoNome.value = paciente.nome;
  campoEmail.value = paciente.email;
  campoNascimento.value = paciente.nascimento.slice(0, 10);

  botaoSalvar.textContent = 'Atualizar';
  botaoCancelar.classList.remove('d-none');

  campoNome.focus();
}

// Limpar formulário
function limparFormulario() {
  formulario.reset();
  campoId.value = '';

  botaoSalvar.textContent = 'Salvar';
  botaoCancelar.classList.add('d-none');
}

// Ler a mensagem de erro da API
async function verificarResposta(resposta) {
  if (!resposta.ok) {
    let mensagemErro = `Erro HTTP: ${resposta.status}`;

    try {
      const dados = await resposta.json();

      if (dados.erro) {
        mensagemErro = dados.erro;
      }
    } catch (erro) {
      console.error('Erro ao ler resposta:', erro);
    }

    throw new Error(mensagemErro);
  }

  return resposta;
}

// GET /pacientes
// GET /pacientes?nome=ana
async function listarPacientes() {
  const buscaAtual = ++numeroBusca;
  const nome = campoBuscar.value.trim();

  mensagemCarregando.style.display = 'block';

  try {
    const url = nome
      ? `${URL_API}?nome=${encodeURIComponent(nome)}`
      : URL_API;

    const resposta = await fetch(url);

    await verificarResposta(resposta);

    const pacientes = await resposta.json();

    // Evita que pesquisas antigas sobrescrevam as recentes
    if (buscaAtual !== numeroBusca) return;

    renderizarTabela(pacientes);
  } catch (erro) {
    if (buscaAtual !== numeroBusca) return;

    console.error(erro);

    mostrarMensagem(
      'Não foi possível carregar os pacientes: ' + erro.message
    );
  } finally {
    if (buscaAtual === numeroBusca) {
      mensagemCarregando.style.display = 'none';
    }
  }
}

// GET /pacientes/total
async function atualizarTotal() {
  try {
    const resposta = await fetch(`${URL_API}/total`);

    await verificarResposta(resposta);

    const dados = await resposta.json();

    totalPacientes.textContent = `Total: ${dados.total}`;
  } catch (erro) {
    console.error(erro);
    totalPacientes.textContent = 'Total indisponível';
  }
}

// Atualizar tabela e contagem
async function atualizarTela() {
  await Promise.all([
    listarPacientes(),
    atualizarTotal()
  ]);
}

// POST /pacientes
// PUT /pacientes/:id
async function salvarPaciente(dados, id) {
  const metodo = id ? 'PUT' : 'POST';
  const url = id ? `${URL_API}/${id}` : URL_API;

  const resposta = await fetch(url, {
    method: metodo,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(dados)
  });

  await verificarResposta(resposta);

  return resposta.json();
}

// DELETE /pacientes/:id
async function excluirPaciente(id) {
  const confirmar = confirm(
    'Deseja realmente excluir este paciente?'
  );

  if (!confirmar) return;

  try {
    const resposta = await fetch(`${URL_API}/${id}`, {
      method: 'DELETE'
    });

    await verificarResposta(resposta);

    // DELETE 204 não possui JSON
    mostrarMensagem(
      'Paciente excluído com sucesso.',
      'success'
    );

    if (campoId.value === String(id)) {
      limparFormulario();
    }

    await atualizarTela();
  } catch (erro) {
    console.error(erro);
    mostrarMensagem(erro.message);
  }
}

// Enviar formulário
formulario.addEventListener('submit', async (evento) => {
  evento.preventDefault();

  if (atualizandoDados) return;

  const dados = {
    nome: campoNome.value.trim(),
    email: campoEmail.value.trim(),
    nascimento: campoNascimento.value
  };

  const id = campoId.value;
  atualizandoDados = true;
  botaoSalvar.disabled = true;

  try {
    await salvarPaciente(dados, id);

    mostrarMensagem(
      id
        ? 'Paciente atualizado com sucesso.'
        : 'Paciente cadastrado com sucesso.',
      'success'
    );

    limparFormulario();
    await atualizarTela();
  } catch (erro) {
    console.error(erro);
    mostrarMensagem(erro.message);
  } finally {
    atualizandoDados = false;
    botaoSalvar.disabled = false;
  }
});

// Cancelar edição
botaoCancelar.addEventListener('click', limparFormulario);

// Pesquisar por nome
campoBuscar.addEventListener('input', () => {
  listarPacientes();
});

// Carregamento inicial
atualizarTela();
