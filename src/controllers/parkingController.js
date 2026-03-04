const parkingService = require("../services/parkingService");

function initParking(req, res, next) {
  try {
    const response = parkingService.initParking();
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
}

function checkin(req, res, next) {
  try {
    const response = parkingService.createCheckin(req.body.tipoVeiculo);
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
}

function checkout(req, res, next) {
  try {
    const response = parkingService.createCheckout(req.body.ticketId);
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
}

function status(req, res, next) {
  try {
    const response = parkingService.getStatus();
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
}

function getTicket(req, res, next) {
  try {
    const response = parkingService.getTicket(req.params.ticketId);
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
}

function events(req, res, next) {
  try {
    const response = parkingService.listEvents(req.query.limit);
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  initParking,
  checkin,
  checkout,
  status,
  getTicket,
  events,
};
