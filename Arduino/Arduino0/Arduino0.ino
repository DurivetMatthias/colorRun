#include <Wire.h>

//this one has the bluetooth on 0 and 1

int potentio = A0;
int RGBred =9;
int RGBblue=10;
int RGBgreen=11;
int piezo;

int potenwaarde=0;



void setup() {
  // put your setup code here, to run once:
pinMode(potentio, INPUT);
pinMode(RGBred, OUTPUT);
pinMode(RGBblue, OUTPUT);
pinMode(RGBgreen, OUTPUT);
pinMode(piezo, OUTPUT);

  


Serial.begin(9600);

  //  Serial.begin(38400); // Default communication rate of the Bluetooth module
  //  Serial.begin(9600); // Default communication rate of the USB module

}

void loop() {
  // put your main code here, to run repeatedly:

  
  potenwaarde = analogRead(potentio);
  delay(10);
  char color = processpotent(potenwaarde);
  Serial.print(color);



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

  


  void setColor(int red, int green, int blue)
{
  analogWrite(RGBred, red);
  analogWrite(RGBgreen, green);
  analogWrite(RGBblue, blue);  
}

void receiveEvent(int bytes) { 
   // x = Wire.read();
}
