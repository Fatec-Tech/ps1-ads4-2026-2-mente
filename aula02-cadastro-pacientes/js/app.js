const pacientes = [];

const formulario = document.getElementById('form-paciente');
const tabela = document.getElementById('tabela-pacientes');
const mensagemCarregando = document.getElementById('carregando');

function adicionarPaciente(nome, email, nascimento, origem) {
	pacientes.push({ nome, email, nascimento, origem });
}

function renderizarTabela() {
	tabela.innerHTML = '';

	// Tratamento de lista vazia: mostra mensagem no lugar das linhas
	if (pacientes.length === 0) {
		const linha = document.createElement('tr');
		linha.innerHTML = `
      <td colspan="3" class="text-center text-muted">Nenhum paciente cadastrado ainda</td>
    `;
		tabela.appendChild(linha);
		return;
	}

	pacientes.forEach((paciente) => {
		const linha = document.createElement('tr');
		linha.innerHTML = `
      <td>${paciente.nome}</td>
      <td>${paciente.email}</td>
      <td>${formatarData(paciente.nascimento)}</td>
    `;
		tabela.appendChild(linha);
	});
}

function formatarData(dataISO) {
	const [ano, mes, dia] = dataISO.split('-');
	return `${dia}/${mes}/${ano}`;
}

// Nova função: atualiza os contadores de origem dos pacientes
function atualizarContadores() {
	const doJson = pacientes.filter((paciente) => paciente.origem === 'json').length;
	const manuais = pacientes.filter((paciente) => paciente.origem === 'manual').length;

	document.getElementById('contador-json').textContent = `${doJson} do arquivo JSON`;
	document.getElementById('contador-manual').textContent = `${manuais} cadastrados manualmente`;
}

// Nova função: busca os pacientes iniciais a partir do arquivo JSON
async function carregarPacientesIniciais() {
	try {
		// Simulação de latência: espera 1 segundo antes de buscar os dados
		await new Promise((resolve) => setTimeout(resolve, 1000));

		const resposta = await fetch('data/pacientes.json');
		console.log(resposta);

		// Nem toda resposta é sucesso — precisamos checar antes de usar
		if (!resposta.ok) {
			throw new Error(`Erro HTTP: ${resposta.status}`);
		}

		const dados = await resposta.json(); // converte a resposta em objeto JS

		// Adiciona cada paciente vindo do arquivo ao nosso array local
		dados.forEach((paciente) => {
			adicionarPaciente(paciente.nome, paciente.email, paciente.nascimento, 'json');
		});

		renderizarTabela();
		atualizarContadores();
	} catch (erro) {
		console.error('Não foi possível carregar os pacientes:', erro);

		// Tratamento de erro amigável: esconde o "Carregando..." e mostra o alerta
		mensagemCarregando.classList.add('d-none');
		document.getElementById('alerta-erro').classList.remove('d-none');

		return; // sai da função sem continuar
	}

	mensagemCarregando.textContent =
		'Dados carregados com sucesso.';
	// mensagemCarregando.style.display = 'none'; // esconde "Carregando..." em caso de sucesso
}

formulario.addEventListener('submit', (event) => {
	event.preventDefault();

	const nome = document.getElementById('nome').value;
	const email = document.getElementById('email').value;
	const nascimento = document.getElementById('nascimento').value;

	adicionarPaciente(nome, email, nascimento, 'manual');
	renderizarTabela();
	atualizarContadores();

	formulario.reset();
});

// Assim que o script carrega, já dispara a busca dos dados iniciais
carregarPacientesIniciais();