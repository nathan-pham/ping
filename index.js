const Server = require('./server').App,
	util = require('util'),
	{ping, pong, cycle} = require('./ping'),
	{getFiles} = require('./files'),
	fetch = require('node-fetch');

let app = new Server;
const files = getFiles('./public');
app.folder = './public'
app.get(files.map((part) => part.replace(app.folder, '')), (req, res) => {
	app.sendFile(req.url)
})
app.get('/', (req, res) => {
	app.sendFile('/index.html')
})
app.get('404', (req, res) => {
	app.redirect('/')
})
app.post('/pong',  (req, res) => {
	app.collect((json)=> {
		let {value} = JSON.parse(json);
		if(!value) return;
		let url;

		try{
			let real = new URL(value.trim())
			url = `${real.protocol}//${real.hostname}`.split('&')[0]
		}
		catch(e){
			if(!value.includes('http')){
				app.send(JSON.stringify({
					error: 'Include http/https'
				}))
			}
			else{
				app.send(JSON.stringify({
					error: 'Invalid Url'
				}))
			}
			return;
		}
		let data =  ping();
		
		if(data.split(', ').includes(url)){
			app.send(JSON.stringify({
				error: 'Url has already been added'
			}))
			return;
		}
		fetch(url, {method: 'GET'})
		.then(() => {
			data += `, ${url}`
			pong(data)

			app.send(JSON.stringify({
				success: 'Added to que'
			}))
		})
		.catch(e => {
			app.send(JSON.stringify({
				error: 'Invalid Url'
			}))
		})
	})
})
app.start(8080)