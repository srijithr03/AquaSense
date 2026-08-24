/*
 * AquaSense - AI Smart Water Monitoring System
 * 
 * Hardware Requirements:
 * - ESP32 Dev Board
 * - Water Flow Sensor (ZJ-S201): Signal -> GPIO35, VCC -> VIN (5V), GND -> GND
 * - DS3231 RTC Module: SDA -> GPIO25, SCL -> GPIO26, VCC -> 3.3V, GND -> GND
 * - ST7032 I2C LCD (Address 0x3E): SDA -> GPIO13, SCL -> GPIO14, VCC -> VIN, GND -> GND
 */

#include <Arduino.h>
#include <Wire.h>
#include <RTClib.h>
#include <ST7032_asukiaaa.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// ==========================================
// PIN DEFINITIONS & CONSTANTS
// ==========================================

// WiFi & API Configuration
const char* WIFI_SSID = "";
const char* WIFI_PASSWORD = "";
const char* SERVER_URL = "";

const char* DEVICE_ID = "AquaSense001";
const char* DEVICE_NAME = "Main Water Meter";

// Water Flow Sensor
#define FLOW_SENSOR_PIN 35
#define CALIBRATION_FACTOR 7.5 // ZJ-S201 Calibration: F = 7.5 * Q (L/min)

// RTC Module (DS3231) on I2C Bus 0
#define RTC_SDA 25
#define RTC_SCL 26

// LCD Module (ST7032) on I2C Bus 1
#define LCD_SDA 13
#define LCD_SCL 14
#define LCD_ADDRESS 0x3E

// ==========================================
// GLOBAL VARIABLES
// ==========================================

// Independent I2C Buses
TwoWire rtcWire = TwoWire(0);
TwoWire lcdWire = TwoWire(1);

// Device Instances
RTC_DS3231 rtc;
ST7032_asukiaaa lcd;

// Status Flags
bool rtcFound = false;
bool lcdFound = false;
bool isFlowing = false;

// Flow Measurements
volatile uint32_t pulseCount = 0; // Incremented by interrupt
uint32_t currentPulses = 0;       // Pulses in the current second
float flowRate = 0.0;             // L/min
float sessionWater = 0.0;         // L
float totalWater = 0.0;           // L

// Session Tracking
String sessionStartTimeStr = "";
String sessionEndTimeStr = "";
uint32_t sessionStartMillis = 0;
uint32_t sessionDuration = 0;     // Seconds
float sessionAvgFlowRate = 0.0;   // L/min

// Time/Date Tracking
String currentTimeStr = "00:00:00";
String currentDateStr = "01-01-2000";
String currentDayStr = "MON";

// Timing Control
unsigned long lastUpdateMillis = 0;
unsigned long lastScreenChange = 0;
unsigned long lastPostMillis = 0;
int currentScreen = 1;

// ==========================================
// INTERRUPT SERVICE ROUTINE
// ==========================================
void IRAM_ATTR flowInterruptISR() {
    pulseCount++;
}

// ==========================================
// FUNCTION PROTOTYPES
// ==========================================
void setupRTC();
void setupLCD();
void setupFlowSensor();
void updateRTC();
void updateLCD();
void calculateFlow();
void detectSession();
void printSerial();
void printJSON();
String getFormattedTime(DateTime now);
String getFormattedDate(DateTime now);
String getDayOfWeek(DateTime now);
void setupWiFi();
void postData();

// ==========================================
// SETUP FUNCTION
// ==========================================
void setup() {
    Serial.begin(115200);
    while (!Serial) { delay(10); } // Wait for serial connection

    Serial.println("Initializing AquaSense...");

    setupRTC();
    setupLCD();
    setupFlowSensor();
    setupWiFi();
    
    Serial.println("Initialization Complete.\n");
}

// ==========================================
// LOOP FUNCTION
// ==========================================
void loop() {
    unsigned long currentMillis = millis();

    // 1-Second Interval Task
    if (currentMillis - lastUpdateMillis >= 1000) {
        lastUpdateMillis = currentMillis;

        calculateFlow();
        updateRTC();
        detectSession();
        
        printSerial();
        printJSON();
    }

    // 5-Second API Data POST Task
    if (currentMillis - lastPostMillis >= 5000) {
        lastPostMillis = currentMillis;
        
        // Non-blocking WiFi reconnect attempt
        if (WiFi.status() != WL_CONNECTED && String(WIFI_SSID) != "") {
            Serial.println("WiFi disconnected. Reconnecting...");
            WiFi.disconnect();
            WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
        }
        
        if (WiFi.status() == WL_CONNECTED && String(SERVER_URL) != "") {
            postData();
        }
    }

    // 3-Second LCD Screen Rotation Task
    if (currentMillis - lastScreenChange >= 3000) {
        lastScreenChange = currentMillis;
        currentScreen++;
        if (currentScreen > 5) {
            currentScreen = 1;
        }
        updateLCD();
    }
}

// ==========================================
// INITIALIZATION FUNCTIONS
// ==========================================

// Initialize DS3231 RTC
void setupRTC() {
    rtcWire.begin(RTC_SDA, RTC_SCL);
    if (!rtc.begin(&rtcWire)) {
        Serial.println("RTC NOT FOUND");
        rtcFound = false;
    } else {
        rtcFound = true;
        // Automatically set the RTC time to compile time if power was lost
        if (rtc.lostPower()) {
            Serial.println("RTC lost power. Resetting time to compile time.");
            rtc.adjust(DateTime(F(__DATE__), F(__TIME__)));
        }
    }
}

// Initialize ST7032 LCD
void setupLCD() {
    lcdWire.begin(LCD_SDA, LCD_SCL);
    lcd.setWire(&lcdWire);
    
    // Check if the LCD is responding on the bus
    lcdWire.beginTransmission(LCD_ADDRESS);
    if (lcdWire.endTransmission() == 0) {
        lcdFound = true;
        lcd.begin(16, 2);
        lcd.setContrast(30);
        lcd.clear();
        lcd.setCursor(0, 0);
        lcd.print("AquaSense");
        lcd.setCursor(0, 1);
        lcd.print("Starting...");
    } else {
        Serial.println("LCD NOT FOUND");
        lcdFound = false;
    }
}

// Initialize Water Flow Sensor and Interrupt
void setupFlowSensor() {
    pinMode(FLOW_SENSOR_PIN, INPUT_PULLUP);
    attachInterrupt(digitalPinToInterrupt(FLOW_SENSOR_PIN), flowInterruptISR, FALLING);
}

// Initialize WiFi connection (non-blocking in loop, but waits initially in setup)
void setupWiFi() {
    if (String(WIFI_SSID) != "") {
        Serial.print("Connecting to WiFi");
        WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
        int attempts = 0;
        while (WiFi.status() != WL_CONNECTED && attempts < 20) {
            delay(500);
            Serial.print(".");
            attempts++;
        }
        if (WiFi.status() == WL_CONNECTED) {
            Serial.println("\nConnected to WiFi");
            Serial.print("IP Address: ");
            Serial.println(WiFi.localIP());
        } else {
            Serial.println("\nWiFi connection failed. Will retry later.");
        }
    }
}

// ==========================================
// UPDATE & LOGIC FUNCTIONS
// ==========================================

// Fetch and format the current time from the RTC
void updateRTC() {
    if (rtcFound) {
        DateTime now = rtc.now();
        currentTimeStr = getFormattedTime(now);
        currentDateStr = getFormattedDate(now);
        currentDayStr = getDayOfWeek(now);
    }
}

// Refresh the LCD content based on the current screen index
void updateLCD() {
    if (!lcdFound) return;
    
    lcd.clear();
    
    switch (currentScreen) {
        case 1: // AquaSense Title & Time/Date
            lcd.setCursor(0, 0);
            lcd.print("AquaSense");
            lcd.setCursor(0, 1);
            // Example output: 10:42 11-08
            lcd.print(currentTimeStr.substring(0, 5) + " " + currentDateStr.substring(0, 5));
            break;
            
        case 2: // Flow Rate
            lcd.setCursor(0, 0);
            lcd.print("Flow Rate");
            lcd.setCursor(0, 1);
            lcd.print(String(flowRate, 2) + " L/min");
            break;
            
        case 3: // Session Water
            lcd.setCursor(0, 0);
            lcd.print("Session");
            lcd.setCursor(0, 1);
            lcd.print(String(sessionWater, 2) + " L");
            break;
            
        case 4: // Total Water
            lcd.setCursor(0, 0);
            lcd.print("Total Water");
            lcd.setCursor(0, 1);
            lcd.print(String(totalWater, 2) + " L");
            break;
            
        case 5: // Status
            lcd.setCursor(0, 0);
            lcd.print("Status");
            lcd.setCursor(0, 1);
            lcd.print(isFlowing ? "FLOWING" : "IDLE");
            break;
    }
}

// Calculate water flow metrics based on pulse counts
void calculateFlow() {
    // Safely retrieve the volatile pulse count
    noInterrupts();
    currentPulses = pulseCount;
    pulseCount = 0;
    interrupts();

    // Calculate metrics
    if (currentPulses > 0) {
        // flowRate (L/min) = Frequency (Pulses/sec) / Calibration Factor
        flowRate = ((float)currentPulses) / CALIBRATION_FACTOR;
        
        // Water consumed in the last second (Liters)
        float waterThisSecond = flowRate / 60.0;
        
        sessionWater += waterThisSecond;
        totalWater += waterThisSecond;
    } else {
        flowRate = 0.0;
    }
}

// Detect start and end of a water usage session
void detectSession() {
    // Session Start
    if (flowRate > 0.0 && !isFlowing) {
        isFlowing = true;
        sessionWater = 0.0; // Reset session volume
        sessionStartMillis = millis();
        sessionStartTimeStr = currentTimeStr;
    } 
    // Session End
    else if (flowRate == 0.0 && isFlowing) {
        isFlowing = false;
        sessionEndTimeStr = currentTimeStr;
        sessionDuration = (millis() - sessionStartMillis) / 1000;
        
        // Average flow rate during the session
        if (sessionDuration > 0) {
            sessionAvgFlowRate = (sessionWater / sessionDuration) * 60.0; 
        } else {
            sessionAvgFlowRate = 0.0;
        }

        // Print final session summary
        Serial.println("\n======== SESSION REPORT ========");
        Serial.println("Start Time         : " + sessionStartTimeStr);
        Serial.println("End Time           : " + sessionEndTimeStr);
        Serial.println("Duration (s)       : " + String(sessionDuration));
        Serial.println("Average Flow Rate  : " + String(sessionAvgFlowRate, 2) + " L/min");
        Serial.println("Session Water Used : " + String(sessionWater, 2) + " L");
        Serial.println("Total Water Used   : " + String(totalWater, 2) + " L");
        Serial.println("================================\n");
    }
}

// ==========================================
// OUTPUT FUNCTIONS
// ==========================================

// Print human-readable output to the Serial Monitor
void printSerial() {
    Serial.println("================================");
    Serial.println("Time          : " + currentTimeStr);
    Serial.println("Date          : " + currentDateStr);
    Serial.println("Flow Rate     : " + String(flowRate, 2) + " L/min");
    Serial.println("Pulses        : " + String(currentPulses));
    Serial.println("Session Water : " + String(sessionWater, 2) + " L");
    Serial.println("Total Water   : " + String(totalWater, 2) + " L");
    Serial.println("Status        : " + String(isFlowing ? "FLOWING" : "IDLE"));
    Serial.println("================================");
}

// Print machine-readable JSON output for React Dashboard
void printJSON() {
    Serial.print("{");
    Serial.print("\"time\":\""); Serial.print(currentTimeStr); Serial.print("\",");
    Serial.print("\"date\":\""); Serial.print(currentDateStr); Serial.print("\",");
    Serial.print("\"flowRate\":"); Serial.print(flowRate, 2); Serial.print(",");
    Serial.print("\"sessionWater\":"); Serial.print(sessionWater, 2); Serial.print(",");
    Serial.print("\"totalWater\":"); Serial.print(totalWater, 2); Serial.print(",");
    Serial.print("\"status\":\""); Serial.print(isFlowing ? "FLOWING" : "IDLE"); Serial.print("\"");
    Serial.println("}");
}

// Post JSON Data to HTTP Backend Server
void postData() {
    Serial.println("\n--- Starting HTTP POST ---");
    Serial.print("Wi-Fi Status: ");
    Serial.println(WiFi.status() == WL_CONNECTED ? "CONNECTED" : "DISCONNECTED");

    if (WiFi.status() == WL_CONNECTED) {
        HTTPClient http;
        String url = String(SERVER_URL) + "/api/water";
        
        Serial.print("Request URL: ");
        Serial.println(url);
        
        // Timeout reduces blocking if server is unreachable
        http.setTimeout(5000); // Increased timeout for better stability
        http.begin(url);
        http.addHeader("Content-Type", "application/json");

        // Construct JSON document
        StaticJsonDocument<512> doc;
        doc["deviceId"] = DEVICE_ID;
        doc["deviceName"] = DEVICE_NAME;
        doc["date"] = currentDateStr;
        doc["time"] = currentTimeStr;
        doc["flowRate"] = flowRate;
        doc["pulseCount"] = currentPulses;
        doc["sessionWater"] = sessionWater;
        doc["totalWater"] = totalWater;
        doc["status"] = isFlowing ? "FLOWING" : "IDLE";
        doc["uptime"] = millis();

        String requestBody;
        serializeJson(doc, requestBody);
        
        Serial.print("JSON Payload: ");
        Serial.println(requestBody);

        Serial.println("Sending POST Request...");
        int httpResponseCode = http.POST(requestBody);

        Serial.print("HTTP Response Code: ");
        Serial.println(httpResponseCode);

        if (httpResponseCode > 0) {
            String responseBody = http.getString();
            Serial.print("Server Response Body: ");
            Serial.println(responseBody);
        } else {
            Serial.print("HTTP POST Error details: ");
            Serial.println(http.errorToString(httpResponseCode).c_str());
        }
        http.end();
    } else {
        Serial.println("Error: Cannot post data because Wi-Fi is not connected.");
    }
    Serial.println("--------------------------\n");
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

// Get time as a formatted string (HH:MM:SS)
String getFormattedTime(DateTime now) {
    char buf[10];
    snprintf(buf, sizeof(buf), "%02d:%02d:%02d", now.hour(), now.minute(), now.second());
    return String(buf);
}

// Get date as a formatted string (DD-MM-YYYY)
String getFormattedDate(DateTime now) {
    char buf[12];
    snprintf(buf, sizeof(buf), "%02d-%02d-%04d", now.day(), now.month(), now.year());
    return String(buf);
}

// Get day of the week as a short string (e.g., "MON")
String getDayOfWeek(DateTime now) {
    const char* daysOfTheWeek[] = {"SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"};
    return String(daysOfTheWeek[now.dayOfTheWeek()]);
}
