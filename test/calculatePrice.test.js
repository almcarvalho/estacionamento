const test = require("node:test");
const assert = require("node:assert/strict");
const { calculatePrice } = require("../src/domain/pricing/calculatePrice");

test("should be free up to 15 minutes", () => {
  assert.equal(calculatePrice(15, "carro"), 0);
});

test("should charge first hour for cars", () => {
  assert.equal(calculatePrice(60, "carro"), 12);
});

test("should round additional hours up for cars", () => {
  assert.equal(calculatePrice(83, "carro"), 18);
});

test("should cap daily price for cars", () => {
  assert.equal(calculatePrice(1000, "carro"), 60);
});

test("should apply moto discount", () => {
  assert.equal(calculatePrice(83, "moto"), 12.6);
});

test("should throw for invalid vehicle type", () => {
  assert.throws(() => calculatePrice(30, "van"));
});
