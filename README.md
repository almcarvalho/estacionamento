Projetinho que a gente na live de terça 03/03/2026
Criamos usando o CODEX da OPEN AI DENTRO do vscode.

>> link do video
>  https://www.youtube.com/watch?v=V4MTw8mh360


>Desafio: Backend de Estacionamento de Shopping (Node.js, local, sem BD, in-memory) — Ticket Only
Objetivo

Criar uma API REST (só backend) para controlar entrada/saída de veículos em um estacionamento, com capacidade por tipo (carro/moto), tickets gerados automaticamente, cálculo de valor, e estado 100% em memória.

Regras do Estacionamento
Tipos aceitos

carro

moto

Capacidade (fixa no código)

Exemplo:

carro: 200

moto: 80

Se não houver vaga do tipo, o check-in deve falhar com erro.

Fluxo
Check-in (entrada)

Entrada recebe somente:

tipoVeiculo: carro | moto

O sistema deve:

Validar o tipo

Verificar se existe vaga disponível para aquele tipo

Gerar ticketId único (ex: TCK_000001)

Registrar em memória:

ticketId

tipoVeiculo

entradaEm

status: ATIVO

Check-out (saída)

Saída é apenas por ticketId.

O sistema deve:

Validar se o ticket existe

Validar se está ATIVO

Registrar saidaEm

Calcular minutos e valor

Marcar status: FINALIZADO

Tabela de Preço (exemplo)

Até 15 min: grátis

Até 1h: R$ 12,00

Cada hora adicional (arredondando pra cima): R$ 6,00

Teto diário: R$ 60,00

Exigência: o cálculo deve ser uma função pura e testável, tipo:

calculatePrice(minutes, tipoVeiculo)

Regra opcional (escolha 1)

Moto paga 70% do valor final (arredondar para 2 casas).

Ou: Moto tem tabela própria.

API Endpoints Obrigatórios
1) Inicializar/Resetar

POST /parking/init

Zera memória (tickets, eventos, contadores)

Recarrega capacidade

Retorno sugerido:

{
  "capacity": { "carro": 200, "moto": 80 },
  "occupied": { "carro": 0, "moto": 0 }
}
2) Check-in

POST /parking/checkin
Body:

{ "tipoVeiculo": "carro" }

Retorno:

{
  "ticketId": "TCK_000001",
  "tipoVeiculo": "carro",
  "entradaEm": "2026-03-03T12:00:00.000Z"
}

Erros:

INVALID_TYPE

NO_SPOT_AVAILABLE

3) Check-out

POST /parking/checkout
Body:

{ "ticketId": "TCK_000001" }

Retorno:

{
  "ticketId": "TCK_000001",
  "tipoVeiculo": "carro",
  "entradaEm": "...",
  "saidaEm": "...",
  "minutos": 83,
  "valor": 18.0
}

Erros:

TICKET_NOT_FOUND

TICKET_ALREADY_CLOSED

4) Status

GET /parking/status
Retorna ocupação, vagas restantes e total de tickets ativos.

Exemplo:

{
  "capacity": { "carro": 200, "moto": 80 },
  "occupied": { "carro": 10, "moto": 5 },
  "available": { "carro": 190, "moto": 75 },
  "activeTickets": 15
}
5) Consultar ticket por id

GET /parking/tickets/:ticketId

Retorna ticket (ativo ou finalizado)

6) Listar eventos/log

GET /parking/events?limit=50

Log em memória de checkin, checkout (e erros opcionais)

Requisitos Técnicos

Node.js + Express (ou Fastify)

Sem banco

Estado em memória:

tickets[]

events[]

contadores de ocupação e gerador incremental de ticket

Organização mínima:

controllers/

services/

domain/ (cálculo de preço e regras)

Erros padronizados:

{ "error": "NO_SPOT_AVAILABLE", "message": "Sem vagas para carro" }
