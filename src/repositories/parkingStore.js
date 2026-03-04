const { PARKING_CAPACITY } = require("../config/parkingConfig");

function cloneCapacity() {
  return { ...PARKING_CAPACITY };
}

function createInitialState() {
  return {
    capacity: cloneCapacity(),
    occupied: {
      carro: 0,
      moto: 0,
    },
    ticketSequence: 0,
    tickets: [],
    events: [],
  };
}

let state = createInitialState();

function resetStore() {
  state = createInitialState();
  return getState();
}

function getState() {
  return state;
}

module.exports = {
  getState,
  resetStore,
};
