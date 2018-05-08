exports.data = {
  'iniciantes': {
    nome: 'Iniciantes',
    integrantes: {},
    index: 'iniciantes'
  }
};

exports.criarSala = function(socket,nome){
	var index = nome.toLowerCase().replace(' ','-');
	if(this.data[index])
		return false;
	this.data[index] = {
		nome: nome,
		integrantes: {},
		index: index
	};
};

exports.iniciar = function(socket, io){
	socket.on('sala_conectar',function(m){
		m = JSON.parse(m);
	    console.log(m.player, "tentando se conectar a sala "+m.sala);
	    if(!salas.data[m.sala].integrantes[m.player]){
	      	salas.data[m.sala].integrantes[m.player] = m;
	      	// salas['iniciantes'].mensagens.push();
	      	socket.join(m.sala);
	      	io.to(m.sala).emit('sala_conectou', JSON.stringify(salas.data[m.sala].integrantes));
	      	// rsala = Object.assign({}, salas.data[m.sala]);
	      	// delete rsala.mensagens;
	      	socket.emit('sala_conectado', JSON.stringify(salas.data[m.sala]));
	      	io.to(m.sala).emit('sala_mensagem_atualizar', JSON.stringify({player: 'Sistema', mensagem: m.player+" entrou na sala"}));
	    }else{
	      	socket.emit('sala_conectado', 'false');
	    }
	});

	socket.on('buscar_salas', function(m){
		socket.emit('atualizar_salas', JSON.stringify(salas.data));
	});

	socket.on('sala_mensagem', function(m){
	    m = JSON.parse(m);
	    if(!salas.data[m.sala].integrantes[m.mensagem.player]){
	      	socket.emit('sala_mensagem', 'false');
	    }else{
	      	io.to(m.sala).emit('sala_mensagem_atualizar', JSON.stringify(m.mensagem));
	    }
	});

	socket.on('sala_sair', function(m){
		console.log(m);
		m = JSON.parse(m);
		if(!salas.data[m.sala].integrantes[m.player]){
			socket.emit('sala_sair', 'false');
		}else{
			socket.leave(m.sala);
			delete salas.data[m.sala].integrantes[m.player];
			io.to(m.sala).emit('sala_conectou', JSON.stringify(salas.data[m.sala].integrantes));
			socket.emit('sala_saiu', 'true');
			io.emit('atualizar_salas', JSON.stringify(salas.data));
			io.to(m.sala).emit('sala_mensagem_atualizar', JSON.stringify({player: 'Sistema', mensagem: m.player+" saiu da sala"}));
		}
	});

	socket.on('disconnection', function(m){
		if(m.sala){
	    	delete salas.data[m.sala].integrantes[m.player];
	    	io.emit('atualizar_salas', JSON.stringify(salas.data));
	    }
	});

	socket.on('criar_sala', function(m){
		m = JSON.parse(m);
		salas.criarSala(socket, m.sala);
		io.emit('sala_criada', JSON.stringify(salas.data));
	});
};