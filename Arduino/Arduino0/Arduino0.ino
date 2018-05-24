#include <Wire.h>

//this one has the bluetooth on 0 and 1

int potentio = A0;
int RGBred =9;
int RGBblue=10;
int RGBgreen=11;
int piezo = 12;

int potenwaarde=0;

boolean pausebutton = true;
char color ;


void setup() {
  // put your setup code here, to run once:
pinMode(potentio, INPUT);
pinMode(RGBred, OUTPUT);
pinMode(RGBblue, OUTPUT);
pinMode(RGBgreen, OUTPUT);
pinMode(piezo, OUTPUT);


   Wire.begin(42);                // join i2c bus with address #8
  Wire.onReceive(receiveEvent); // register event

  


Serial.begin(9600);

  //  Serial.begin(38400); // Default communication rate of the Bluetooth module
  //  Serial.begin(9600); // Default communication rate of the USB module

}

void loop() {
  // put your main code here, to run repeatedly:

  
  potenwaarde = analogRead(potentio);
  delay(10);
  char newcolor = processpotent(potenwaarde);
  if (color != newcolor){
    color = newcolor;
  Serial.print(color);
  sendWithWire(color);

  }

  if (Serial.available() > 0) {
                // read the incoming byte:
                char incomming = Serial.read();

                // say what you got:
                Serial.print(incomming);
               
        }


}


void sendWithWire(char x){
    Wire.beginTransmission(44); // transmit to device #8
  Wire.write(x);        // sends five bytes
  Wire.endTransmission();    // stop transmitting
}


char processpotent(int potentwaarde){
  int range = 1024;
  
  if (potentwaarde<(range*0.1)){
    setColor(0,0,255);
    return('B');
  }
    if (potentwaarde<(range*0.5)){
    setColor(0,255,0);
    return('G');
  }
  if (potentwaarde<(range*0.9)){
    setColor(144,255,0);
    return('Y');

  }
  if (potentwaarde<range){
    setColor(255,0,0);
    return('R');
  }
  };

  void receiveEvent(int bytes) { 


  char c = Wire.read(); // receive byte as a character
    Serial.print(c);         // print the character

}


  void setColor(int red, int green, int blue)
{
  analogWrite(RGBred, red);
  analogWrite(RGBgreen, green);
  analogWrite(RGBblue, blue);  
}

