const express = require("express");
const parkingRoutes = require("./routes/parkingRoutes");
const { AppError } = require("./domain/errors/AppError");

const app = express();

app.use(express.json());

app.use("/parking", parkingRoutes);

app.use((req, res) => {
  res.status(404).json({
    error: "NOT_FOUND",
    message: "Rota nao encontrada",
  });
});

app.use((error, req, res, next) => {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      error: error.error,
      message: error.message,
    });
  }

  return res.status(500).json({
    error: "INTERNAL_SERVER_ERROR",
    message: "Erro interno do servidor",
  });
});

module.exports = { app };
