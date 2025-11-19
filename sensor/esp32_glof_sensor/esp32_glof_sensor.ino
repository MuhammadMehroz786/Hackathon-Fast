/*
 * Project Barfani - GLOF Early Warning System
 * ESP32 Sensor Node Firmware
 *
 * Sensors:
 * - DHT22: Temperature & Humidity
 * - SW-420: Seismic Activity (Vibration)
 * - HC-SR04: Water Level (Ultrasonic Distance)
 *
 * Features:
 * - WiFi connectivity for data transmission
 * - Deep sleep for power conservation
 * - Solar power management
 * - JSON data formatting
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <DHT.h>
#include <ArduinoJson.h>

// ==================== CONFIGURATION ====================

// WiFi Credentials
// For Wokwi simulation, use "Wokwi-GUEST" with no password
const char* WIFI_SSID = "Wokwi-GUEST";
const char* WIFI_PASSWORD = "";

// Backend API
// For VS Code Wokwi: use localhost
// For online Wokwi: use your public IP or ngrok URL
const char* API_URL = "http://localhost:5001/api/sensor/data";

// Sensor Node Configuration
const char* NODE_ID = "glacier_lake_01";
const char* LOCATION = "Hunza Valley, GB";
const float ELEVATION = 3400.0; // meters above sea level

// Pin Definitions
#define DHT_PIN 4           // DHT22 Temperature sensor
#define SEISMIC_PIN 34      // SW-420 Vibration sensor (analog)
#define TRIG_PIN 5          // HC-SR04 Trigger
#define ECHO_PIN 18         // HC-SR04 Echo
#define BATTERY_PIN 35      // Battery voltage monitor
#define SOLAR_PIN 32        // Solar panel voltage monitor
#define LED_PIN 2           // Status LED

// Sensor Configuration
#define DHT_TYPE DHT22
#define SEISMIC_SAMPLES 100 // Number of seismic readings to average
#define WATER_SAMPLES 5     // Number of distance readings to average

// Power Management
#define SLEEP_DURATION 300  // Deep sleep duration in seconds (5 minutes)
#define LOW_BATTERY_THRESHOLD 3.3  // Volts
#define CRITICAL_BATTERY_THRESHOLD 3.0  // Volts

// ==================== GLOBAL OBJECTS ====================

DHT dht(DHT_PIN, DHT_TYPE);
RTC_DATA_ATTR int bootCount = 0;
RTC_DATA_ATTR float lastWaterLevel = 0;

// ==================== HELPER FUNCTIONS ====================

/**
 * Blink LED for status indication
 */
void blinkLED(int times, int delayMs = 100) {
  for (int i = 0; i < times; i++) {
    digitalWrite(LED_PIN, HIGH);
    delay(delayMs);
    digitalWrite(LED_PIN, LOW);
    delay(delayMs);
  }
}

/**
 * Read battery voltage
 */
float readBatteryVoltage() {
  int rawValue = analogRead(BATTERY_PIN);
  // Convert to voltage (assuming voltage divider R1=100k, R2=100k)
  // ESP32 ADC: 0-4095 = 0-3.3V, but we're measuring up to 4.2V through divider
  float voltage = (rawValue / 4095.0) * 3.3 * 2.0;
  return voltage;
}

/**
 * Read solar panel voltage
 */
float readSolarVoltage() {
  int rawValue = analogRead(SOLAR_PIN);
  float voltage = (rawValue / 4095.0) * 3.3 * 2.0;
  return voltage;
}

/**
 * Check if we have enough power to operate
 */
bool checkPowerStatus() {
  float batteryVoltage = readBatteryVoltage();
  float solarVoltage = readSolarVoltage();

  Serial.printf("🔋 Battery: %.2fV | ☀️ Solar: %.2fV\n", batteryVoltage, solarVoltage);

  if (batteryVoltage < CRITICAL_BATTERY_THRESHOLD) {
    Serial.println("⚠️ CRITICAL BATTERY - Extended sleep mode");
    blinkLED(10, 50);
    esp_deep_sleep(SLEEP_DURATION * 1000000ULL * 4); // Sleep 4x longer
    return false;
  }

  if (batteryVoltage < LOW_BATTERY_THRESHOLD) {
    Serial.println("⚠️ Low battery - Power saving mode");
    blinkLED(3, 200);
  }

  return true;
}

/**
 * Connect to WiFi with timeout
 */
bool connectWiFi(int timeoutSeconds = 20) {
  Serial.print("📡 Connecting to WiFi");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < timeoutSeconds) {
    delay(1000);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✅ WiFi connected!");
    Serial.print("IP: ");
    Serial.println(WiFi.localIP());
    blinkLED(2, 100);
    return true;
  } else {
    Serial.println("\n❌ WiFi connection failed!");
    blinkLED(5, 50);
    return false;
  }
}

/**
 * Read temperature from DHT22
 */
float readTemperature() {
  float temp = dht.readTemperature();

  if (isnan(temp)) {
    Serial.println("❌ Failed to read temperature!");
    return -999.0;
  }

  // Adjust for elevation (temperature drops ~0.65°C per 100m)
  float adjustedTemp = temp - (ELEVATION / 100.0 * 0.65);

  Serial.printf("🌡️  Temperature: %.2f°C (adjusted for %dm elevation)\n", adjustedTemp, (int)ELEVATION);
  return adjustedTemp;
}

/**
 * Read seismic activity from SW-420
 */
float readSeismicActivity() {
  long sum = 0;
  int maxValue = 0;
  int minValue = 4095;

  // Take multiple samples to detect vibrations
  for (int i = 0; i < SEISMIC_SAMPLES; i++) {
    int reading = analogRead(SEISMIC_PIN);
    sum += reading;
    if (reading > maxValue) maxValue = reading;
    if (reading < minValue) minValue = reading;
    delay(10);
  }

  // Calculate variance as measure of seismic activity
  int average = sum / SEISMIC_SAMPLES;
  int variance = maxValue - minValue;

  // Convert to magnitude scale (0.0 - 2.0)
  float magnitude = (variance / 4095.0) * 2.0;

  Serial.printf("📊 Seismic Activity: %.3f magnitude (variance: %d)\n", magnitude, variance);
  return magnitude;
}

/**
 * Read water level using HC-SR04
 */
float readWaterLevel() {
  float distances[WATER_SAMPLES];

  // Take multiple readings
  for (int i = 0; i < WATER_SAMPLES; i++) {
    // Trigger ultrasonic pulse
    digitalWrite(TRIG_PIN, LOW);
    delayMicroseconds(2);
    digitalWrite(TRIG_PIN, HIGH);
    delayMicroseconds(10);
    digitalWrite(TRIG_PIN, LOW);

    // Measure echo duration
    long duration = pulseIn(ECHO_PIN, HIGH, 30000); // 30ms timeout

    if (duration == 0) {
      distances[i] = -1;
    } else {
      // Calculate distance in cm
      distances[i] = duration * 0.034 / 2.0;
    }

    delay(100);
  }

  // Average valid readings
  float sum = 0;
  int validCount = 0;
  for (int i = 0; i < WATER_SAMPLES; i++) {
    if (distances[i] > 0 && distances[i] < 400) {
      sum += distances[i];
      validCount++;
    }
  }

  if (validCount == 0) {
    Serial.println("❌ Failed to read water level!");
    return lastWaterLevel; // Return last known value
  }

  float avgDistance = sum / validCount;

  // Convert distance to water level
  // Assuming sensor is 500cm above lake bottom
  const float SENSOR_HEIGHT = 500.0;
  float waterLevel = SENSOR_HEIGHT - avgDistance;

  // Store for next reading
  lastWaterLevel = waterLevel;

  Serial.printf("💧 Water Level: %.2fcm (distance: %.2fcm)\n", waterLevel, avgDistance);
  return waterLevel;
}

/**
 * Send sensor data to backend API
 */
bool sendSensorData(float temperature, float seismicActivity, float waterLevel) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("❌ No WiFi connection");
    return false;
  }

  HTTPClient http;
  http.begin(API_URL);
  http.addHeader("Content-Type", "application/json");

  // Create JSON payload
  StaticJsonDocument<512> doc;
  doc["node_id"] = NODE_ID;
  doc["location"] = LOCATION;
  doc["elevation"] = ELEVATION;
  doc["temperature"] = temperature;
  doc["seismic_activity"] = seismicActivity;
  doc["water_level"] = waterLevel;
  doc["battery_voltage"] = readBatteryVoltage();
  doc["solar_voltage"] = readSolarVoltage();
  doc["boot_count"] = bootCount;
  doc["timestamp"] = millis();

  String jsonString;
  serializeJson(doc, jsonString);

  Serial.println("\n📤 Sending data:");
  Serial.println(jsonString);

  int httpResponseCode = http.POST(jsonString);

  if (httpResponseCode > 0) {
    String response = http.getString();
    Serial.printf("✅ HTTP Response: %d\n", httpResponseCode);
    Serial.println(response);
    blinkLED(3, 100);
    http.end();
    return true;
  } else {
    Serial.printf("❌ HTTP Error: %d\n", httpResponseCode);
    blinkLED(5, 50);
    http.end();
    return false;
  }
}

// ==================== MAIN FUNCTIONS ====================

void setup() {
  // Initialize serial
  Serial.begin(115200);
  delay(1000);

  Serial.println("\n\n");
  Serial.println("═══════════════════════════════════════════");
  Serial.println("   🏔️  PROJECT BARFANI - GLOF SENSOR   ");
  Serial.println("   Glacier Monitoring & Early Warning    ");
  Serial.println("═══════════════════════════════════════════");
  Serial.printf("Node ID: %s\n", NODE_ID);
  Serial.printf("Location: %s\n", LOCATION);
  Serial.printf("Elevation: %.0fm\n", ELEVATION);
  Serial.printf("Boot count: %d\n", ++bootCount);
  Serial.println("═══════════════════════════════════════════\n");

  // Initialize pins
  pinMode(LED_PIN, OUTPUT);
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(SEISMIC_PIN, INPUT);
  pinMode(BATTERY_PIN, INPUT);
  pinMode(SOLAR_PIN, INPUT);

  // Startup blink
  blinkLED(3, 200);

  // Initialize DHT sensor
  dht.begin();
  delay(2000); // DHT22 needs time to stabilize

  // Check power status
  if (!checkPowerStatus()) {
    return; // Will go to deep sleep
  }
}

void loop() {
  unsigned long startTime = millis();

  Serial.println("\n🔄 Starting sensor reading cycle...\n");

  // Read all sensors
  float temperature = readTemperature();
  float seismicActivity = readSeismicActivity();
  float waterLevel = readWaterLevel();

  Serial.println("\n📊 ══ SENSOR READINGS ══");
  Serial.printf("Temperature: %.2f°C\n", temperature);
  Serial.printf("Seismic: %.3f magnitude\n", seismicActivity);
  Serial.printf("Water Level: %.2fcm\n", waterLevel);
  Serial.println("═════════════════════════\n");

  // Connect to WiFi and send data
  if (connectWiFi()) {
    sendSensorData(temperature, seismicActivity, waterLevel);
    WiFi.disconnect(true);
    Serial.println("📡 WiFi disconnected\n");
  }

  // Calculate time spent
  unsigned long elapsedTime = (millis() - startTime) / 1000;
  Serial.printf("⏱️  Cycle completed in %lu seconds\n", elapsedTime);

  // Enter deep sleep
  Serial.printf("😴 Entering deep sleep for %d seconds...\n\n", SLEEP_DURATION);
  blinkLED(1, 500);

  esp_sleep_enable_timer_wakeup(SLEEP_DURATION * 1000000ULL);
  esp_deep_sleep_start();
}
