var Main = new class
{
	constructor()
	{
		this.ipc = require('electron').ipcRenderer;
		this.ipc.on('broadcast-receive-message', this.receiveMessage.bind(this));

		var send = document.getElementById('send');
		send.addEventListener('click', this.sendMessage.bind(this));

		var message = document.getElementById('message');
		message.addEventListener('keyup', function(event) {
			console.log(event);
			if ( event.keyCode == 13 ) {
				Main.sendMessage();
			}
		});
	}

	sendMessage()
	{
		var message = document.getElementById('message');
		if ( message.value.length > 0 ) {
			this.ipc.send('broadcast-send-message', message.value);
			message.value = '';
		}
	}

	receiveMessage(event, data)
	{
		console.log(data);

		var content = document.getElementById('content');
		var text = document.createElement('div');
		var span = document.createElement('div');

		text.classList.add('mdl-shadow--2dp', 'mdl-cell', 'mdl-cell--10-col', 'mdl-grid');
		text.innerText = data.message;
		span.classList.add('mdl-cell--2-col');

		if ( data.from === true ) {
			// For me
			text.classList.add(['mdl-color--green']);
			content.appendChild(text);
			content.appendChild(span);
		} else {
			// It's me
			text.classList.add(['mdl-color--blue']);
			content.appendChild(span);
			content.appendChild(text);
		}

		content.scrollTop = content.scrollHeight;
	}
}