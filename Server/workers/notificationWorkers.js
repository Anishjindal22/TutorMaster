const { startDispatchConsumer } = require("./notificationDispatchConsumer");
const { startDeliveryConsumer } = require("./notificationDeliveryConsumer");

exports.startNotificationWorkers = () => {
  startDispatchConsumer();
  startDeliveryConsumer();
};
