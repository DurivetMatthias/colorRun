#include <LiquidCrystal.h>

#include <Servo.h>

#include <Wire.h>
int button = 13;                                                      ;
int tilt=12;
Servo servo;
LiquidCrystal lcd(7, 6, 4, 5, 8, 9);

boolean pausebutton;
boolean play = false;
boolean jump;


volatile byte state = LOW;

unsigned long previousMillis = 0; //storing the milliseconds from the previous interrupt
const long interval = 60000;      //storing the milliseconds between the interval of interrupts

void setup() {
  // put your setup code here, to run once:


lcd.begin(16,2);
  
  pinMode(button, INPUT);

   pinMode(tilt, INPUT);

   Wire.begin(44);                // join i2c bus with address #8
  Wire.onReceive(receiveEvent); // register event


//  servo.attach();
lcd.print("Color Run");
lcd.setCursor(0,1);
lcd.print("Push the button to play");                                        
}

void loop() {
  // put your main code here, to run repeatedly:
  delay(20);
  if(digitalRead(button)== HIGH){
    if(!pausebutton){
    sendWithWire('P');
    pausebutton = true;
    play = !play;
        lcd.clear();

        if (play){
          lcd.print("Play");
        }else{
    lcd.print("Pauze");}
    }
  }
  else(pausebutton=false);
    if(digitalRead(tilt)== LOW){
      if(!jump && play){
    sendWithWire('J');
    jump = true;
    lcd.clear();
    lcd.print("Jump");
    }
  }
  else(jump = false);
}

void sendWithWire(char x){
    Wire.beginTransmission(42); // transmit to device #8
  Wire.write(x);        // sends five bytes
  Wire.endTransmission();    // stop transmitting
}

void receiveEvent(int bytes) { 

    char c = Wire.read(); // receive byte as a character
    
          
   showCollor(c);

  

}

void showCollor(char c){
  
  if (play){
    lcd.clear();
   if(c == 'R'){
      lcd.print("Red"); 
    }
    if(c == 'Y'){
      lcd.print("Yellow"); 
    }
    if(c == 'G'){
      lcd.print("Green"); 
    }
    if(c == 'B'){
      lcd.print("Blue"); 
    }
}}





