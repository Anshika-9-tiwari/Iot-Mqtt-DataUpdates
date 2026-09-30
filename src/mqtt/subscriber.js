const mqtt = require("mqtt");
const { Point } = require("@influxdata/influxdb-client");
const writeApi = require("../database/influx");

require("dotenv").config();

const client = mqtt.connect(process.env.MQTT_BROKER_URL, {
  username: process.env.MQTT_USERNAME,
  password: process.env.MQTT_PASSWORD,
});

client.on("connect", () => {
  console.log("✅ Connected to MQTT Broker");

  client.subscribe("68mldjag", (err) => {
    if (!err) {
      console.log("✅ Subscribed to 68mldjag");
    }
  });
});

// 2026-09-30T07:54:07.2945196Z

client.on("message", async (topic, message) => {
  try {
    const data = JSON.parse(message.toString());

    console.log("📌 MQTT Topic:", topic);
    
    console.log("📩 MQTT Data:", data);

    const point = new Point("iot-data-configure")
      .tag("site_id", data.SITE_ID || "unknown")
      .tag("gateway_id", data.GatewayId || "unknown")
      .tag("slave_no", data.SlaveNo || "unknown")
      .tag("slave_name", data.SlaveName || "unknown")
      .floatField("signal", Number(data.signal))
      .floatField("bod_inlet", Number(data.bod__inlet))
      .floatField("tna_inlet", Number(data.tna__inlet))
      .floatField("rcm_inlet", Number(data.rcm__inlet))
      .floatField("tpa_inlet", Number(data.tpa__inlet))
      .floatField("ph_outlet", Number(data.ph_outlet))
      .floatField("cm_inlet", Number(data.cm__inlet))
      .floatField("cod_inlet", Number(data.cod__inlet))
      .floatField("ph_inlet", Number(data.ph_inlet))
      .floatField("rcm_outlet", Number(data.rcm_outlet))
      .floatField("tss_inlet", Number(data.tss__inlet));

    writeApi.writePoint(point);

    await writeApi.flush();

    console.log("✅ Data saved to InfluxDB");
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
});

client.on("error", (error) => {
  console.error("❌ MQTT Error:", error.message);
});