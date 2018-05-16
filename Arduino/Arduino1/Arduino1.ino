#include <LiquidCrystal.h>

#include <Servo.h>

#include <Wire.h>

int button;
int tilt;
Servo servo.attach();


volatile byte state = LOW;

unsigned long previousMillis = 0; //storing the milliseconds from the previous interrupt
const long interval = 60000;      //storing the milliseconds between the interval of interrupts

void setup() {
  // put your setup code here, to run once:


  pinMode(ledPin, OUTPUT);
  
  pinMode(button, INPUT);
  attachInterrupt(button, buttonIsr1, FALLING);

    pinMode(tilt, INPUT);
  attachInterrupt(tilt, buttonIsr1, FALLING);

  
}

void loop() {
  // put your main code here, to run repeatedly:

}

void receiveEvent(int bytes) { 
   x = Wire.read();
}


void buttonIsr1() {
    //Get the current milliseconds
    unsigned long currentMillis = millis();

    //When the difference between the current millisevonds and the previous milliseconds the intterupt fired is bigger or equal to the interval the function can be executed
    if (currentMillis - previousMillis >= interval) 
    { 
      previousMillis = currentMillis; //store the milliseconds when the function has been executed
      state = !state;

      //TODO: do something
    }
}


void tiltIsr1() {
    //Get the current milliseconds
    unsigned long currentMillis = millis();

    //When the difference between the current millisevonds and the previous milliseconds the intterupt fired is bigger or equal to the interval the function can be executed
    if (currentMillis - previousMillis >= interval) 
    { 
      previousMillis = currentMillis; //store the milliseconds when the function has been executed
      state = !state;
      //TODO: do something
    }
}
