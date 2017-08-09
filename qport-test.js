
const assert = require( "assert" );
const qport = require( "./qport.js" );

assert.equal( qport( 11000, true ), 11000, "should be equal" );

console.log( "ok" );
