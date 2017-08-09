"use strict";

/*;
	@module-license:
		The MIT License (MIT)
		@mit-license

		Copyright (@c) 2017 Richeve Siodina Bebedor
		@email: richeve.bebedor@gmail.com

		Permission is hereby granted, free of charge, to any person obtaining a copy
		of this software and associated documentation files (the "Software"), to deal
		in the Software without restriction, including without limitation the rights
		to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
		copies of the Software, and to permit persons to whom the Software is
		furnished to do so, subject to the following conditions:

		The above copyright notice and this permission notice shall be included in all
		copies or substantial portions of the Software.

		THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
		IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
		FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
		AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
		LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
		OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
		SOFTWARE.
	@end-module-license

	@module-configuration:
		{
			"package": "qport",
			"path": "qport/qport.js",
			"file": "qport.js",
			"module": "qport",
			"author": "Richeve S. Bebedor",
			"eMail": "richeve.bebedor@gmail.com",
			"repository": "https://github.com/volkovasystems/qport.git",
			"test": "qport-test.js",
			"global": true
		}
	@end-module-configuration

	@module-documentation:
		Query usable port.

		This will follow some specific standards regarding port increments whenever
			the port is already taken.

		The port will always be incremented by 1000 and
			the limit is 60000.
	@end-module-documentation

	@include:
		{
			"depher": "depher",
			"numric": "numric",
			"raze": "raze",
			"rport": "rport"
		}
	@end-include
*/

const depher = require( "depher" );
const numric = require( "numric" );
const raze = require( "raze" );
const rport = require( "rport" );
const zelf = require( "zelf" );

const BASE_PORT_LIMIT = 60000;
const BASE_PORT = 10000;
const DEFAULT_BASE_PORT = (
	numric( process.env.DEFAULT_BASE_PORT )
	&& parseInt( process.env.DEFAULT_BASE_PORT ) > BASE_PORT
)? parseInt( process.env.DEFAULT_BASE_PORT ) : BASE_PORT;

const resolvePort = function resolvePort( openPort, basePort ){
	let index = openPort.length;
	while( index-- ){
		let port = openPort[ index ];

		if( port == basePort ){
			basePort += 1000;
		}

		if(
			port > BASE_PORT
			&& ( Math.floor( port / 1000 ) * 1000 ) > basePort
			&& ( Math.ceil( ( port + 1 ) / 1000 ) * 1000 ) < basePort
		){
			basePort += 1000;
		}

		if( basePort >= BASE_PORT_LIMIT ){
			throw new Error( "base port limit reached" );
		}
	}

	return basePort;
}

const qport = function qport( basePort, synchronous, option ){
	/*;
		@meta-configuration:
			{
				"basePort:required": "number",
				"synchronous": "boolean",
				"option": "object"
			}
		@end-meta-configuration
	*/

	let parameter = raze( arguments );

	synchronous = depher( parameter, BOOLEAN, false );

	basePort = depher( parameter, NUMBER, DEFAULT_BASE_PORT );

	if( basePort < DEFAULT_BASE_PORT ){
		basePort = DEFAULT_BASE_PORT;
	}

	if( basePort >= BASE_PORT_LIMIT ){
		throw new Error( "base port limit reached" );
	}

	if( synchronous ){
		return resolvePort( rport( true ), basePort );

	}else{
		let catcher = rport.bind( zelf( this ) )( )
			.then( function done( error, openPort ){
				if( error instanceof Error ){
					return catcher.pass( new Error( `cannot query usable port, ${ error.stack }` ), NaN );
				}

				try{
					return catcher.pass( null, resolvePort( openPort, basePort ) );

				}catch( error ){
					return catcher.pass( new Error( `cannot query usable port, ${ error.stack }` ), NaN );
				}
			} );

		return catcher;
	}
};

module.exports = qport;
