const MINUTES_FREE = 15;
const FIRST_HOUR_PRICE = 12;
const ADDITIONAL_HOUR_PRICE = 6;
const DAILY_CAP = 60;
const MOTO_DISCOUNT_FACTOR = 0.7;

function roundToTwo(value) {
  return Number(value.toFixed(2));
}

function calculateBasePrice(minutes) {
  if (minutes <= MINUTES_FREE) {
    return 0;
  }

  if (minutes <= 60) {
    return FIRST_HOUR_PRICE;
  }

  const additionalMinutes = minutes - 60;
  const additionalHours = Math.ceil(additionalMinutes / 60);
  const rawPrice = FIRST_HOUR_PRICE + additionalHours * ADDITIONAL_HOUR_PRICE;

  return Math.min(rawPrice, DAILY_CAP);
}

function calculatePrice(minutes, tipoVeiculo) {
  if (!Number.isInteger(minutes) || minutes < 0) {
    throw new Error("minutes must be a non-negative integer");
  }

  if (tipoVeiculo !== "carro" && tipoVeiculo !== "moto") {
    throw new Error("invalid vehicle type");
  }

  const basePrice = calculateBasePrice(minutes);

  if (tipoVeiculo === "moto") {
    return roundToTwo(basePrice * MOTO_DISCOUNT_FACTOR);
  }

  return roundToTwo(basePrice);
}

module.exports = {
  calculatePrice,
  calculateBasePrice,
};
