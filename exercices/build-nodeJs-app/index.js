const http = require( "http" );

http.createServer( function( request, response ) {
  // eslint-disable-next-line no-console
  console.log( "request received" );
  response.end( "omg hi", "utf-8" );
} )
    .listen( 3000 );
// eslint-disable-next-line no-console
console.log( "server started" );

