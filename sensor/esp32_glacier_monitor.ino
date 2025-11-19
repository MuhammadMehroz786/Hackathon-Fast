/**
 * Project Barfani - Glacier Monitoring Sensor Node
 * ESP32 code for simulating glacier monitoring sensors
 *
 * Sensors:
 * - DHT22: Temperature sensor
 * - SW-420: Vibration/Seismic sensor
 * - HC-SR04: Ultrasonic distance sensor (water level)
 *
 * Copy this code to Wokwi.com ESP32 simulator
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// WiFi credentials (for Wokwi simulation)
const char* ssid = "Wokwi-GUEST";
const char* password = "";

// Backend API endpoint
const char* serverUrl = "http://your-backend-url/api/sensor/data";

// Sensor configuration
const char* nodeId = "glacier_lake_01";  // Change for different nodes

// Pin definitions
#define DHT_PIN 4           // DHT22 temperature sensor
#define VIBRATION_PIN 34    // SW-420 vibration sensor (analog)
#define TRIG_PIN 5          // HC-SR04 trigger
#define ECHO_PIN 18         // HC-SR04 echo
#define LED_PIN 2           // Built-in LED for status

// Sensor baseline values (simulated glacier conditions)
float baseTemperature = -10.0;  // Base temp in °C
float baseWaterLevel = 250.0;   // Base water level in cm
float baseSeismic = 0.2;        // Base seismic activity

// Simulation variables
unsigned long lastSendTime = 0;
const unsigned long sendInterval = 5000; // Send data every 5 seconds
int readingCount = 0;

void setup() {
  Serial.begin(115200);
  delay(1000);

  pinMode(LED_PIN, OUTPUT);
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(VIBRATION_PIN, INPUT);

  Serial.println("\n🏔️  Project Barfani - Glacier Monitoring System");
  Serial.println("================================================");
  Serial.printf("Node ID: %s\n", nodeId);

  connectToWiFi();
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    connectToWiFi();
    return;
  }

  if (millis() - lastSendTime >= sendInterval) {
    // Read sensors
    float temperature = readTemperature();
    float seismicActivity = readSeismicActivity();
    float waterLevel = readWaterLevel();
    int battery = getBatteryLevel();
    int signalStrength = getSignalStrength();

    // Send data to backend
    sendSensorData(temperature, seismicActivity, waterLevel, battery, signalStrength);

    lastSendTime = millis();
    readingCount++;
  }

  delay(100);
}

void connectToWiFi() {
  Serial.print("Connecting to WiFi");
  WiFi.begin(ssid, password);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    digitalWrite(LED_PIN, !digitalRead(LED_PIN));
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✅ WiFi Connected!");
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());
    digitalWrite(LED_PIN, HIGH);
  } else {
    Serial.println("\n❌ WiFi Connection Failed!");
    digitalWrite(LED_PIN, LOW);
  }
}

float readTemperature() {
  // Simulate DHT22 temperature reading
  // Add realistic variations and occasional spikes
  float variation = random(-20, 20) / 10.0;  // ±2°C variation

  // Simulate warming trend (potential GLOF risk)
  if (readingCount > 20 && readingCount < 40) {
    variation += (readingCount - 20) * 0.5;  // Gradual warming
  }

  float temperature = baseTemperature + variation;

  Serial.printf("🌡️  Temperature: %.2f°C\n", temperature);
  return temperature;
}

float readSeismicActivity() {
  // Simulate SW-420 vibration sensor
  // Returns value between 0.0 and 1.5
  float reading = baseSeismic + (random(0, 100) / 100.0);

  // Simulate seismic event
  if (readingCount > 25 && readingCount < 35) {
    reading += random(30, 80) / 100.0;  // Seismic spike
  }

  // Clamp to realistic range
  reading = constrain(reading, 0.0, 1.5);

  Serial.printf("📊 Seismic Activity: %.3f\n", reading);
  return reading;
}

float readWaterLevel() {
  // Simulate HC-SR04 ultrasonic sensor
  // Measures distance to water surface, converts to water level

  float variation = random(-50, 50) / 10.0;  // ±5cm variation

  // Simulate rising water level (GLOF risk)
  if (readingCount > 20) {
    variation += (readingCount - 20) * 0.8;  // Rising trend
  }

  float waterLevel = baseWaterLevel + variation;
  waterLevel = constrain(waterLevel, 100.0, 500.0);

  Serial.printf("💧 Water Level: %.2f cm\n", waterLevel);
  return waterLevel;
}

int getBatteryLevel() {
  // Simulate battery level (70-100%)
  // Gradually decreasing over time
  int battery = 100 - (readingCount / 10);
  battery = constrain(battery, 70, 100);
  return battery;
}

int getSignalStrength() {
  // Simulate signal strength (60-100%)
  return random(60, 100);
}

void sendSensorData(float temp, float seismic, float water, int battery, int signal) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("❌ WiFi not connected, skipping send");
    return;
  }

  HTTPClient http;
  http.begin(serverUrl);
  http.addHeader("Content-Type", "application/json");

  // Create JSON payload
  StaticJsonDocument<512> doc;
  doc["node_id"] = nodeId;
  doc["temperature"] = temp;
  doc["seismic_activity"] = seismic;
  doc["water_level"] = water;
  doc["battery"] = battery;
  doc["signal_strength"] = signal;

  String jsonString;
  serializeJson(doc, jsonString);

  Serial.println("\n📡 Sending data to backend...");
  Serial.println(jsonString);

  // Send HTTP POST request
  int httpResponseCode = http.POST(jsonString);

  if (httpResponseCode > 0) {
    String response = http.getString();
    Serial.printf("✅ Response code: %d\n", httpResponseCode);
    Serial.println("Response: " + response);

    // Parse response for alerts
    StaticJsonDocument<1024> responseDoc;
    deserializeJson(responseDoc, response);

    if (responseDoc["alert"]["shouldAlert"]) {
      String riskLevel = responseDoc["alert"]["riskLevel"];
      Serial.println("\n🚨🚨🚨 ALERT TRIGGERED! 🚨🚨🚨");
      Serial.println("Risk Level: " + riskLevel);

      // Flash LED for alert
      for (int i = 0; i < 5; i++) {
        digitalWrite(LED_PIN, LOW);
        delay(100);
        digitalWrite(LED_PIN, HIGH);
        delay(100);
      }
    }
  } else {
    Serial.printf("❌ HTTP Error: %d\n", httpResponseCode);
    Serial.println("Tip: Update serverUrl with your backend URL");
  }

  http.end();
  Serial.println("================================================\n");
}
