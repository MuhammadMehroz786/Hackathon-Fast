/**
 * Virtual ESP32 Sensor Node Simulator
 * Simulates a complete IoT sensor node with:
 * - DS18B20 Temperature Sensor (-55°C to +125°C)
 * - ADXL345 3-Axis Accelerometer (seismic activity detection)
 * - HC-SR04 Ultrasonic Distance Sensor (water level measurement)
 * - Solar Panel + Li-Ion Battery Power Management
 * - Deep Sleep Power Saving Modes
 * - LoRaWAN/WiFi Data Transmission
 */

class ESP32SensorNode {
  constructor(config) {
    this.nodeId = config.nodeId;
    this.location = config.location;
    this.elevation = config.elevation;

    // Hardware Configuration
    this.hardware = {
      // Temperature Sensor (DS18B20)
      tempSensor: {
        type: 'DS18B20',
        pin: 'GPIO4',
        range: { min: -55, max: 125 },
        accuracy: 0.5,
        resolution: 0.0625 // 12-bit resolution
      },

      // Seismic Sensor (ADXL345 Accelerometer)
      seismicSensor: {
        type: 'ADXL345',
        interface: 'I2C',
        sda: 'GPIO21',
        scl: 'GPIO22',
        range: '±2g to ±16g',
        sensitivity: 0.004 // g per LSB
      },

      // Water Level Sensor (HC-SR04 Ultrasonic)
      waterLevelSensor: {
        type: 'HC-SR04',
        trigPin: 'GPIO5',
        echoPin: 'GPIO18',
        range: { min: 2, max: 400 }, // cm
        accuracy: 0.3 // cm
      },

      // Solar Power System
      solarPanel: {
        type: '6V 2W Polycrystalline',
        maxVoltage: 6,
        maxCurrent: 0.33, // Amps
        efficiency: 0.18
      },

      // Battery Management
      battery: {
        type: 'Li-Ion 18650',
        capacity: 3000, // mAh
        voltage: 3.7, // V
        currentCharge: 2800, // mAh
        chargeController: 'TP4056'
      },

      // Communication Module
      comm: {
        type: 'ESP32-WROOM-32',
        wifi: true,
        bluetooth: true,
        loraModule: 'RFM95W', // LoRaWAN
        frequency: '915 MHz'
      }
    };

    // Power consumption profiles (mA)
    this.powerProfiles = {
      deepSleep: 0.01,
      lightSleep: 0.8,
      active: 80,
      wifiTransmit: 170,
      loraTransmit: 120,
      sensorRead: 50
    };

    // Current state
    this.state = {
      powerMode: 'active',
      batteryLevel: 93, // percentage
      batteryVoltage: 3.7,
      batteryCurrent: this.hardware.battery.currentCharge,
      solarCharging: false,
      lastTransmission: null,
      uptime: 0
    };

    // Sensor baselines (realistic for glacier environment)
    this.baselines = {
      temperature: config.baseTemp || -10,
      seismicX: 0,
      seismicY: 0,
      seismicZ: 9.81, // Gravity
      waterLevel: config.baseWaterLevel || 280 // cm from sensor
    };

    // Environmental conditions
    this.environment = {
      sunlightHours: this.getSunlightHours(),
      ambientTemp: -15,
      weatherCondition: 'clear'
    };

    console.log(`🔌 [${this.nodeId}] Virtual ESP32 Node Initialized`);
    console.log(`   Location: ${this.location.name} @ ${this.elevation}m`);
    console.log(`   Hardware: ESP32 + DS18B20 + ADXL345 + HC-SR04`);
    console.log(`   Power: Solar (${this.hardware.solarPanel.type}) + ${this.hardware.battery.type}`);
    console.log(`   Comm: WiFi + LoRaWAN (${this.hardware.comm.frequency})`);
  }

  /**
   * Calculate sunlight hours based on time of day
   */
  getSunlightHours() {
    const hour = new Date().getHours();
    // Sunrise ~7AM, Sunset ~6PM in winter
    if (hour >= 7 && hour <= 18) {
      return true;
    }
    return false;
  }

  /**
   * Simulate DS18B20 Temperature Sensor Reading
   */
  readTemperature() {
    const { min, max } = this.hardware.tempSensor.range;
    const { accuracy, resolution } = this.hardware.tempSensor;

    // Add realistic variations
    const dailyVariation = Math.sin((new Date().getHours() / 24) * Math.PI * 2) * 5;
    const randomNoise = (Math.random() - 0.5) * accuracy;

    let temperature = this.baselines.temperature + dailyVariation + randomNoise;

    // Quantize to resolution
    temperature = Math.round(temperature / resolution) * resolution;

    // Clamp to sensor range
    temperature = Math.max(min, Math.min(max, temperature));

    return parseFloat(temperature.toFixed(2));
  }

  /**
   * Simulate ADXL345 Seismic Activity (Accelerometer)
   */
  readSeismicActivity() {
    // Base gravity + micro-tremors + occasional events
    const microTremor = (Math.random() - 0.5) * 0.02; // Normal micro-seismic noise

    // Occasional seismic events (3% chance per reading)
    let event = 0;
    if (Math.random() < 0.03) {
      event = Math.random() * 0.5; // 0-0.5g event
    }

    const accel = {
      x: this.baselines.seismicX + microTremor + event,
      y: this.baselines.seismicY + microTremor,
      z: this.baselines.seismicZ + microTremor
    };

    // Calculate magnitude (simplified)
    const magnitude = Math.sqrt(
      Math.pow(accel.x, 2) +
      Math.pow(accel.y, 2) +
      Math.pow(accel.z - 9.81, 2)
    );

    return {
      x: parseFloat(accel.x.toFixed(4)),
      y: parseFloat(accel.y.toFixed(4)),
      z: parseFloat(accel.z.toFixed(4)),
      magnitude: parseFloat(magnitude.toFixed(3))
    };
  }

  /**
   * Simulate HC-SR04 Water Level Sensor
   * Returns distance from sensor to water surface
   */
  readWaterLevel() {
    const { min, max } = this.hardware.waterLevelSensor.range;
    const { accuracy } = this.hardware.waterLevelSensor;

    // Gradual changes + random noise
    const drift = (Math.random() - 0.5) * 2; // ±1cm per reading
    const noise = (Math.random() - 0.5) * accuracy;

    let distance = this.baselines.waterLevel + drift + noise;

    // Update baseline for next reading (simulates real water level changes)
    this.baselines.waterLevel = distance;

    // Clamp to sensor range
    distance = Math.max(min, Math.min(max, distance));

    return parseFloat(distance.toFixed(1));
  }

  /**
   * Solar Panel Charging Simulation
   */
  simulateSolarCharging(deltaTime = 1000) {
    const isSunny = this.getSunlightHours();

    if (isSunny && this.state.batteryLevel < 100) {
      // Calculate charge current (simplified)
      const { maxCurrent, efficiency } = this.hardware.solarPanel;
      const chargeCurrent = maxCurrent * efficiency; // mA

      // Add charge over time
      const chargeAdded = (chargeCurrent * deltaTime) / 3600000; // Convert to mAh
      this.state.batteryCurrent = Math.min(
        this.hardware.battery.capacity,
        this.state.batteryCurrent + chargeAdded
      );

      this.state.batteryLevel = (this.state.batteryCurrent / this.hardware.battery.capacity) * 100;
      this.state.solarCharging = true;
    } else {
      this.state.solarCharging = false;
    }
  }

  /**
   * Battery Discharge Simulation
   */
  simulateBatteryDrain(powerMode, duration = 1000) {
    const currentDraw = this.powerProfiles[powerMode]; // mA

    // Calculate discharge
    const discharged = (currentDraw * duration) / 3600000; // Convert to mAh
    this.state.batteryCurrent = Math.max(0, this.state.batteryCurrent - discharged);
    this.state.batteryLevel = (this.state.batteryCurrent / this.hardware.battery.capacity) * 100;

    // Update voltage (simplified linear model)
    this.state.batteryVoltage = 3.0 + (this.state.batteryLevel / 100) * 0.7;
  }

  /**
   * Enter Deep Sleep Mode (Power Saving)
   */
  enterDeepSleep(duration = 60000) {
    this.state.powerMode = 'deepSleep';
    console.log(`💤 [${this.nodeId}] Entering deep sleep for ${duration/1000}s`);
    console.log(`   Current draw: ${this.powerProfiles.deepSleep}mA`);

    // Simulate sleep
    this.simulateBatteryDrain('deepSleep', duration);
    this.simulateSolarCharging(duration);
  }

  /**
   * Wake from Sleep
   */
  wake() {
    this.state.powerMode = 'active';
    console.log(`⏰ [${this.nodeId}] Waking from sleep`);
    console.log(`   Battery: ${this.state.batteryLevel.toFixed(1)}%`);
  }

  /**
   * Read All Sensors
   */
  readSensors() {
    console.log(`📊 [${this.nodeId}] Reading sensors...`);
    this.state.powerMode = 'active';

    // Power consumption for sensor reading
    this.simulateBatteryDrain('sensorRead', 500);

    const temperature = this.readTemperature();
    const seismic = this.readSeismicActivity();
    const waterLevel = this.readWaterLevel();

    console.log(`   🌡️  Temp: ${temperature}°C, 📊 Seismic: ${seismic.magnitude}g, 💧 Water: ${waterLevel}cm`);

    return {
      temperature,
      seismic_activity: seismic.magnitude,
      seismic_raw: seismic,
      water_level: waterLevel,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Transmit Data via WiFi/LoRaWAN
   */
  async transmitData(data, protocol = 'wifi') {
    const powerMode = protocol === 'lora' ? 'loraTransmit' : 'wifiTransmit';
    this.state.powerMode = powerMode;

    console.log(`📡 [${this.nodeId}] Transmitting via ${protocol.toUpperCase()}...`);

    // Simulate transmission power consumption
    this.simulateBatteryDrain(powerMode, 2000);

    const packet = {
      node_id: this.nodeId,
      ...data,
      battery: Math.round(this.state.batteryLevel),
      signal_strength: 60 + Math.floor(Math.random() * 35),
      latitude: this.location.lat,
      longitude: this.location.lon,
      location_name: this.location.name,
      elevation: this.elevation,
      hardware: {
        esp32: 'ESP32-WROOM-32',
        sensors: ['DS18B20', 'ADXL345', 'HC-SR04'],
        power: `Solar + ${this.hardware.battery.type}`,
        protocol: protocol.toUpperCase()
      },
      power_stats: {
        battery_voltage: this.state.batteryVoltage.toFixed(2),
        battery_percent: this.state.batteryLevel.toFixed(1),
        solar_charging: this.state.solarCharging,
        power_mode: this.state.powerMode
      }
    };

    this.state.lastTransmission = new Date();
    return packet;
  }

  /**
   * Get Node Status
   */
  getStatus() {
    return {
      nodeId: this.nodeId,
      location: this.location,
      hardware: this.hardware,
      state: this.state,
      environment: this.environment,
      powerProfiles: this.powerProfiles
    };
  }
}

module.exports = ESP32SensorNode;
