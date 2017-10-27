const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const sse = require('./sse')

var connections = []

app.use(bodyParser.urlencoded({
	extended: true
}))

app.use(sse)

app.get('/', function (req, res) {
	res.sendFile(__dirname+'/index.html')
})

app.post('/', function(req, res){
	var value = req.body.number;
	var rest = value;
	var result = "";
	var last;
	var dividers = {
		"C": 100,
		"L": 50,
		"X": 10,
		"V": 5,
		"I": 1
	};
	for (divider in dividers) {

		if (typeof last !== "undefined") {
			for (divider2 in dividers) {
				if ((dividers[divider2] < rest) && ((dividers[divider2]*2)<dividers[last])) {
					let nbr = parseInt(rest / (dividers[last] - dividers[divider2]));
					if (nbr) {
						for (let i = 0; i < nbr; i++) {
							result += divider2 + last;
						}
						rest = rest % (dividers[last] - dividers[divider2]);
					}
				}
			}
		}

		let nbr3 = parseInt(rest / dividers[divider]);
		for (let i = 0; i < nbr3; i++) {
			result += divider;
		}
		rest = rest % dividers[divider];
		last = divider;
	}
	for(var i = 0; i < connections.length; i++) {
		connections[i].sseSend(result)
	}

	res.sendStatus(200)
});

app.get('/stream', function(req, res) {
  res.sseSetup()
  res.sseSend("pending...")
  connections.push(res)
})

app.listen(80, function () {
	console.log('Serveur is up!')
})