// Array que guarda os pacientes cadastrados
const pacientes = [];

// Referências aos elementos do DOM
const formulario = document.getElementById('form-paciente');
const tabela = document.getElementById('tabela-pacientes');
const totalPacientes = document.getElementById('total-pacientes');
const campoBusca = document.getElementById('busca');
const cabecalhoNome = document.getElementById('ordenar-nome');

// Estado da ordenação: false = ordem de cadastro, true = ordem alfabética
let ordenarPorNome = false;

// Função responsável por adicionar um paciente ao array
function adicionarPaciente(nome, email, telefone, nascimento) {
	const novoPaciente = { nome, email, telefone, nascimento };
	pacientes.push(novoPaciente);
	salvarNoLocalStorage();
}

// Função responsável por desenhar a tabela inteira
function renderizarTabela() {
	totalPacientes.textContent = `Total de pacientes: ${pacientes.length}`;
	tabela.innerHTML = ''; // limpa a tabela antes de redesenhar

	const termoBusca = campoBusca.value.toLowerCase();

	// Cria pares (paciente + índice original) para filtrar/ordenar sem perder a referência da remoção
	let lista = pacientes.map((paciente, indice) => ({ paciente, indice }));

	// Busca: mantém apenas quem corresponde ao termo digitado
	lista = lista.filter((item) =>
		item.paciente.nome.toLowerCase().includes(termoBusca)
	);

	// Ordenação: se ativa, ordena a lista por nome
	if (ordenarPorNome) {
		lista.sort((a, b) => a.paciente.nome.localeCompare(b.paciente.nome));
	}

	lista.forEach(({ paciente, indice }) => {
		const linha = document.createElement('tr');

		linha.innerHTML = `
      <td>${paciente.nome}</td>
      <td>${paciente.email}</td>
      <td>${formatarData(paciente.nascimento)}</td>
      <td>${calcularIdade(paciente.nascimento)}</td>
      <td>${paciente.telefone}</td>
      <td>
        <button type="button" class="btn btn-danger btn-sm" onclick="removerPaciente(${indice})">
          Remover
        </button>
      </td>
    `;

		tabela.appendChild(linha);
	});
}

// Remove um paciente do array pelo índice original e redesenha
function removerPaciente(indice) {
	pacientes.splice(indice, 1);
	salvarNoLocalStorage();
	renderizarTabela();
}

// Salva o array no localStorage (transforma em texto JSON)
function salvarNoLocalStorage() {
	localStorage.setItem('pacientes', JSON.stringify(pacientes));
}

// Carrega os dados salvos no localStorage, se existirem
function carregarDoLocalStorage() {
	const dados = localStorage.getItem('pacientes');
	if (dados) {
		pacientes.push(...JSON.parse(dados));
	}
}

// Função utilitária para formatar a data no padrão dd/mm/aaaa
function formatarData(dataISO) {
	const [ano, mes, dia] = dataISO.split('-');
	return `${dia}/${mes}/${ano}`;
}

// Calcula a idade a partir da data de nascimento
function calcularIdade(dataISO) {
	const hoje = new Date();
	const nascimento = new Date(dataISO + 'T00:00:00');

	let idade = hoje.getFullYear() - nascimento.getFullYear();

	const mesAtual = hoje.getMonth();
	const mesNascimento = nascimento.getMonth();
	const diaAtual = hoje.getDate();
	const diaNascimento = nascimento.getDate();

	// Se ainda não fez aniversário este ano, desconta 1
	if (mesAtual < mesNascimento || (mesAtual === mesNascimento && diaAtual < diaNascimento)) {
		idade--;
	}

	return idade;
}

// Busca em tempo real: a cada tecla digitada, redesenha a tabela
campoBusca.addEventListener('input', () => {
	renderizarTabela();
});

// Ordenação: clicar no cabeçalho "Nome" alterna entre alfabética e ordem de cadastro
cabecalhoNome.addEventListener('click', () => {
	ordenarPorNome = !ordenarPorNome;
	cabecalhoNome.textContent = ordenarPorNome ? 'Nome ▲' : 'Nome';
	renderizarTabela();
});

// Evento disparado quando o formulário é enviado
formulario.addEventListener('submit', (event) => {
	event.preventDefault(); // evita o recarregamento da página

	const nome = document.getElementById('nome').value;
	const email = document.getElementById('email').value;
	const telefone = document.getElementById('telefone').value;
	const nascimento = document.getElementById('nascimento').value;

	// Impede o cadastro de e-mails duplicados
	const emailJaExiste = pacientes.some((paciente) => paciente.email === email);

	if (emailJaExiste) {
		alert('Este e-mail já está cadastrado!');
		return; // interrompe aqui: nada abaixo é executado
	}

	adicionarPaciente(nome, email, telefone, nascimento);
	renderizarTabela();

	formulario.reset(); // limpa os campos do formulário
});

// Na inicialização: carrega os dados salvos e desenha a tabela
carregarDoLocalStorage();
renderizarTabela();