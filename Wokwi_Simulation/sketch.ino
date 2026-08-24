#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include "RTClib.h"

// --- Pins ---
#define POT_PIN 34       // Potentiometer Simulating Flow Sensor
#define BUZZER_PIN 15    // Alarm for leakage

// --- Objects ---
LiquidCrystal_I2C lcd(0x27, 16, 2); 
RTC_DS1307 rtc;

// --- Variables ---
float flowRate = 0.0;
float totalLitres = 0.0;
unsigned long previousMillis = 0;
const long interval = 1000; // Update every second

void setup() {
  Serial.begin(115200);
  
  pinMode(POT_PIN, INPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  
  // Initialize LCD
  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print("AquaSense Init..");
  
  // Initialize RTC
  if (!rtc.begin()) {
    Serial.println("Couldn't find RTC");
  }
  if (!rtc.isrunning()) {
    rtc.adjust(DateTime(F(__DATE__), F(__TIME__)));
  }

  delay(2000);
  lcd.clear();
}

void loop() {
  unsigned long currentMillis = millis();

  if (currentMillis - previousMillis >= interval) {
    previousMillis = currentMillis;

    // --- 1. SIMULATE SENSOR WITH POTENTIOMETER ---
    // Read the analog value (0-4095)
    int potValue = analogRead(POT_PIN); 
    
    // Map the analog value to a flow rate (e.g., 0 to 30 L/min)
    // We add a small deadzone (100) so it's easy to turn it "completely off"
    if (potValue > 100) { 
       flowRate = map(potValue, 0, 4095, 0, 30);
    } else {
       flowRate = 0.0;
    }

    // --- 2. CALCULATE TOTAL LITRES ---
    // If flowRate is L/min, then flow in 1 second is (flowRate / 60)
    totalLitres += (flowRate / 60.0);

    // --- 3. GET TIME ---
    DateTime now = rtc.now();

    // --- 4. DISPLAY ON LCD ---
    lcd.setCursor(0, 0);
    lcd.print("F:");
    if (flowRate < 10) lcd.print(" ");
    lcd.print(flowRate, 1);
    lcd.print("L/m ");
    
    // Print time on top right
    lcd.setCursor(11, 0);
    if(now.hour() < 10) lcd.print('0');
    lcd.print(now.hour());
    lcd.print(':');
    if(now.minute() < 10) lcd.print('0');
    lcd.print(now.minute());

    lcd.setCursor(0, 1);
    lcd.print("Tot:");
    if (totalLitres < 10) lcd.print(" ");
    lcd.print(totalLitres, 1);
    lcd.print("L   ");

    // --- 5. SIMULATE LEAKAGE ALERT ---
    // For demo: if flow is very small but continuous, trigger buzzer
    if (flowRate > 0 && flowRate < 3) {
       digitalWrite(BUZZER_PIN, HIGH);
       lcd.setCursor(11, 1);
       lcd.print("LEAK!");
    } else {
       digitalWrite(BUZZER_PIN, LOW);
       lcd.setCursor(11, 1);
       lcd.print("     "); // Clear leak text
    }

    // --- 6. SERIAL OUTPUT FOR CLOUD SIMULATION ---
    Serial.print("Time: "); 
    if(now.hour() < 10) Serial.print('0'); Serial.print(now.hour()); Serial.print(':');
    if(now.minute() < 10) Serial.print('0'); Serial.print(now.minute()); Serial.print(':');
    if(now.second() < 10) Serial.print('0'); Serial.print(now.second());
    Serial.print(" | Flow: "); Serial.print(flowRate);
    Serial.print(" L/min | Total: "); Serial.print(totalLitres);
    Serial.println(" L");
  }
}
