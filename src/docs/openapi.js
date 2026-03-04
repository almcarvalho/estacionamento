const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "Parking Shopping API",
    version: "1.0.0",
    description:
      "API REST para controle de entrada e saida de veiculos em estacionamento com estado 100% em memoria.",
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Servidor local",
    },
  ],
  tags: [
    {
      name: "Parking",
      description: "Operacoes do estacionamento",
    },
  ],
  paths: {
    "/parking/init": {
      post: {
        tags: ["Parking"],
        summary: "Inicializa ou reseta o estacionamento",
        description:
          "Zera a memoria, limpa tickets e eventos, reinicia contadores e recarrega a capacidade fixa.",
        responses: {
          200: {
            description: "Estacionamento reinicializado com sucesso",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ParkingSnapshot",
                },
              },
            },
          },
        },
      },
    },
    "/parking/checkin": {
      post: {
        tags: ["Parking"],
        summary: "Realiza check-in de um veiculo",
        description:
          "Valida o tipo de veiculo, verifica disponibilidade e gera um ticket unico com status ATIVO.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/CheckinRequest",
              },
            },
          },
        },
        responses: {
          201: {
            description: "Check-in realizado com sucesso",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/CheckinResponse",
                },
              },
            },
          },
          400: {
            description: "Tipo de veiculo invalido",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
                example: {
                  error: "INVALID_TYPE",
                  message: "Tipo de veiculo invalido",
                },
              },
            },
          },
          409: {
            description: "Sem vagas disponiveis para o tipo informado",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
                example: {
                  error: "NO_SPOT_AVAILABLE",
                  message: "Sem vagas para carro",
                },
              },
            },
          },
        },
      },
    },
    "/parking/checkout": {
      post: {
        tags: ["Parking"],
        summary: "Realiza check-out de um ticket ativo",
        description:
          "Busca o ticket, valida se esta ATIVO, calcula tempo e valor e finaliza a estadia.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/CheckoutRequest",
              },
            },
          },
        },
        responses: {
          200: {
            description: "Check-out realizado com sucesso",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/CheckoutResponse",
                },
              },
            },
          },
          404: {
            description: "Ticket nao encontrado",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
                example: {
                  error: "TICKET_NOT_FOUND",
                  message: "Ticket nao encontrado",
                },
              },
            },
          },
          409: {
            description: "Ticket ja finalizado",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
                example: {
                  error: "TICKET_ALREADY_CLOSED",
                  message: "Ticket ja finalizado",
                },
              },
            },
          },
        },
      },
    },
    "/parking/status": {
      get: {
        tags: ["Parking"],
        summary: "Consulta status do estacionamento",
        description:
          "Retorna capacidade, ocupacao, vagas disponiveis e total de tickets ativos.",
        responses: {
          200: {
            description: "Status atual do estacionamento",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ParkingStatusResponse",
                },
              },
            },
          },
        },
      },
    },
    "/parking/tickets/{ticketId}": {
      get: {
        tags: ["Parking"],
        summary: "Consulta ticket por ID",
        description: "Retorna um ticket ativo ou finalizado pelo identificador.",
        parameters: [
          {
            in: "path",
            name: "ticketId",
            required: true,
            description: "Identificador do ticket, por exemplo TCK_000001",
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          200: {
            description: "Ticket encontrado",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/TicketResponse",
                },
              },
            },
          },
          404: {
            description: "Ticket nao encontrado",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
                example: {
                  error: "TICKET_NOT_FOUND",
                  message: "Ticket nao encontrado",
                },
              },
            },
          },
        },
      },
    },
    "/parking/events": {
      get: {
        tags: ["Parking"],
        summary: "Lista eventos em memoria",
        description:
          "Retorna os eventos mais recentes de check-in e check-out. O limite padrao e 50.",
        parameters: [
          {
            in: "query",
            name: "limit",
            required: false,
            description: "Quantidade maxima de eventos a retornar",
            schema: {
              type: "integer",
              default: 50,
              minimum: 1,
            },
          },
        ],
        responses: {
          200: {
            description: "Lista de eventos",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/Event",
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      VehicleType: {
        type: "string",
        enum: ["carro", "moto"],
      },
      OccupationByType: {
        type: "object",
        properties: {
          carro: {
            type: "integer",
            example: 200,
          },
          moto: {
            type: "integer",
            example: 80,
          },
        },
        required: ["carro", "moto"],
      },
      ParkingSnapshot: {
        type: "object",
        properties: {
          capacity: {
            $ref: "#/components/schemas/OccupationByType",
          },
          occupied: {
            $ref: "#/components/schemas/OccupationByType",
          },
        },
        required: ["capacity", "occupied"],
      },
      CheckinRequest: {
        type: "object",
        properties: {
          tipoVeiculo: {
            $ref: "#/components/schemas/VehicleType",
          },
        },
        required: ["tipoVeiculo"],
      },
      CheckinResponse: {
        type: "object",
        properties: {
          ticketId: {
            type: "string",
            example: "TCK_000001",
          },
          tipoVeiculo: {
            $ref: "#/components/schemas/VehicleType",
          },
          entradaEm: {
            type: "string",
            format: "date-time",
            example: "2026-03-03T12:00:00.000Z",
          },
        },
        required: ["ticketId", "tipoVeiculo", "entradaEm"],
      },
      CheckoutRequest: {
        type: "object",
        properties: {
          ticketId: {
            type: "string",
            example: "TCK_000001",
          },
        },
        required: ["ticketId"],
      },
      CheckoutResponse: {
        type: "object",
        properties: {
          ticketId: {
            type: "string",
            example: "TCK_000001",
          },
          tipoVeiculo: {
            $ref: "#/components/schemas/VehicleType",
          },
          entradaEm: {
            type: "string",
            format: "date-time",
          },
          saidaEm: {
            type: "string",
            format: "date-time",
          },
          minutos: {
            type: "integer",
            example: 83,
          },
          valor: {
            type: "number",
            format: "float",
            example: 18,
          },
        },
        required: [
          "ticketId",
          "tipoVeiculo",
          "entradaEm",
          "saidaEm",
          "minutos",
          "valor",
        ],
      },
      ParkingStatusResponse: {
        type: "object",
        properties: {
          capacity: {
            $ref: "#/components/schemas/OccupationByType",
          },
          occupied: {
            $ref: "#/components/schemas/OccupationByType",
          },
          available: {
            $ref: "#/components/schemas/OccupationByType",
          },
          activeTickets: {
            type: "integer",
            example: 15,
          },
        },
        required: ["capacity", "occupied", "available", "activeTickets"],
      },
      TicketResponse: {
        type: "object",
        properties: {
          ticketId: {
            type: "string",
            example: "TCK_000001",
          },
          tipoVeiculo: {
            $ref: "#/components/schemas/VehicleType",
          },
          entradaEm: {
            type: "string",
            format: "date-time",
          },
          saidaEm: {
            type: "string",
            format: "date-time",
            nullable: true,
          },
          minutos: {
            type: "integer",
            nullable: true,
          },
          valor: {
            type: "number",
            format: "float",
            nullable: true,
          },
          status: {
            type: "string",
            enum: ["ATIVO", "FINALIZADO"],
          },
        },
        required: ["ticketId", "tipoVeiculo", "entradaEm", "status"],
      },
      Event: {
        type: "object",
        properties: {
          type: {
            type: "string",
            enum: ["CHECKIN", "CHECKOUT"],
          },
          timestamp: {
            type: "string",
            format: "date-time",
          },
          ticketId: {
            type: "string",
            example: "TCK_000001",
          },
          tipoVeiculo: {
            $ref: "#/components/schemas/VehicleType",
          },
          minutos: {
            type: "integer",
            nullable: true,
          },
          valor: {
            type: "number",
            format: "float",
            nullable: true,
          },
        },
        required: ["type", "timestamp", "ticketId", "tipoVeiculo"],
      },
      ErrorResponse: {
        type: "object",
        properties: {
          error: {
            type: "string",
            example: "NO_SPOT_AVAILABLE",
          },
          message: {
            type: "string",
            example: "Sem vagas para carro",
          },
        },
        required: ["error", "message"],
      },
    },
  },
};

const swaggerHtml = `<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Parking Shopping API Docs</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
    <style>
      body { margin: 0; background: #f5f2ea; }
      .topbar { display: none; }
    </style>
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script>
      window.ui = SwaggerUIBundle({
        url: "/docs/openapi.json",
        dom_id: "#swagger-ui"
      });
    </script>
  </body>
</html>`;

module.exports = {
  openApiSpec,
  swaggerHtml,
};
