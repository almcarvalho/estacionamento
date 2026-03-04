const { PARKING_CAPACITY, VALID_VEHICLE_TYPES } = require("../config/parkingConfig");
const { AppError } = require("../domain/errors/AppError");
const { calculatePrice } = require("../domain/pricing/calculatePrice");
const { getState, resetStore } = require("../repositories/parkingStore");

function nowIso() {
  return new Date().toISOString();
}

function formatTicketId(sequence) {
  return `TCK_${String(sequence).padStart(6, "0")}`;
}

function addEvent(type, payload) {
  const state = getState();
  state.events.unshift({
    type,
    timestamp: nowIso(),
    ...payload,
  });
}

function validateVehicleType(tipoVeiculo) {
  if (!VALID_VEHICLE_TYPES.includes(tipoVeiculo)) {
    throw new AppError("INVALID_TYPE", "Tipo de veiculo invalido", 400);
  }
}

function initParking() {
  const state = resetStore();

  return {
    capacity: { ...state.capacity },
    occupied: { ...state.occupied },
  };
}

function createCheckin(tipoVeiculo) {
  validateVehicleType(tipoVeiculo);

  const state = getState();
  if (state.occupied[tipoVeiculo] >= PARKING_CAPACITY[tipoVeiculo]) {
    throw new AppError(
      "NO_SPOT_AVAILABLE",
      `Sem vagas para ${tipoVeiculo}`,
      409,
    );
  }

  state.ticketSequence += 1;
  state.occupied[tipoVeiculo] += 1;

  const ticket = {
    ticketId: formatTicketId(state.ticketSequence),
    tipoVeiculo,
    entradaEm: nowIso(),
    status: "ATIVO",
  };

  state.tickets.push(ticket);
  addEvent("CHECKIN", {
    ticketId: ticket.ticketId,
    tipoVeiculo: ticket.tipoVeiculo,
  });

  return {
    ticketId: ticket.ticketId,
    tipoVeiculo: ticket.tipoVeiculo,
    entradaEm: ticket.entradaEm,
  };
}

function findTicketById(ticketId) {
  const state = getState();
  return state.tickets.find((ticket) => ticket.ticketId === ticketId) || null;
}

function getTicket(ticketId) {
  const ticket = findTicketById(ticketId);
  if (!ticket) {
    throw new AppError("TICKET_NOT_FOUND", "Ticket nao encontrado", 404);
  }

  return { ...ticket };
}

function createCheckout(ticketId) {
  const ticket = findTicketById(ticketId);
  if (!ticket) {
    throw new AppError("TICKET_NOT_FOUND", "Ticket nao encontrado", 404);
  }

  if (ticket.status !== "ATIVO") {
    throw new AppError("TICKET_ALREADY_CLOSED", "Ticket ja finalizado", 409);
  }

  const state = getState();
  const checkoutDate = new Date();
  const checkinDate = new Date(ticket.entradaEm);
  const diffMs = Math.max(checkoutDate.getTime() - checkinDate.getTime(), 0);
  const minutes = Math.ceil(diffMs / 60000);
  const value = calculatePrice(minutes, ticket.tipoVeiculo);

  ticket.saidaEm = checkoutDate.toISOString();
  ticket.minutos = minutes;
  ticket.valor = value;
  ticket.status = "FINALIZADO";
  state.occupied[ticket.tipoVeiculo] -= 1;

  addEvent("CHECKOUT", {
    ticketId: ticket.ticketId,
    tipoVeiculo: ticket.tipoVeiculo,
    minutos: ticket.minutos,
    valor: ticket.valor,
  });

  return {
    ticketId: ticket.ticketId,
    tipoVeiculo: ticket.tipoVeiculo,
    entradaEm: ticket.entradaEm,
    saidaEm: ticket.saidaEm,
    minutos: ticket.minutos,
    valor: ticket.valor,
  };
}

function getStatus() {
  const state = getState();
  return {
    capacity: { ...state.capacity },
    occupied: { ...state.occupied },
    available: {
      carro: state.capacity.carro - state.occupied.carro,
      moto: state.capacity.moto - state.occupied.moto,
    },
    activeTickets: state.tickets.filter((ticket) => ticket.status === "ATIVO").length,
  };
}

function listEvents(limit = 50) {
  const parsedLimit = Number.parseInt(limit, 10);
  const safeLimit = Number.isNaN(parsedLimit) || parsedLimit <= 0 ? 50 : parsedLimit;
  const state = getState();

  return state.events.slice(0, safeLimit).map((event) => ({ ...event }));
}

module.exports = {
  initParking,
  createCheckin,
  createCheckout,
  getStatus,
  getTicket,
  listEvents,
};
