var jeremi = require('jeremi');


var a = 4;
var b = 2;

console.log( "\nOperand 1 : " + a + "\nOperand 2 : " + b + "\n" );
console.log( "Adding : \t\t" + jeremi.add( a, b ) );
console.log( "Subtracting : \t\t" + jeremi.subtract( a, b ) );
console.log( "Multiplying : \t\t" + jeremi.multiply( a, b ) );
console.log( "Dividing : \t\t" + jeremi.divide( a, b ) );
console.log( "Square Root : \t\t" + jeremi.sqrt( a ) );

jeremi.history()