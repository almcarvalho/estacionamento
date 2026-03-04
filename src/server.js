const { app } = require("./app");
const { initParking } = require("./services/parkingService");

const PORT = process.env.PORT || 3000;

initParking();

app.listen(PORT, () => {
  console.log(`Parking API running on port ${PORT}`);
});
