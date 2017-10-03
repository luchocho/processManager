
// Muestra o oculta el form de creacion de proceso
$('#new-process-sign').on('click', function() {
	if($('#edit-process').css("display") !== "none" ){
		return false;
	}
	$('#new-process').toggle();
});

// oculta el form de editar el proceso
$('#edit-process').on('click', '#edit-process-close', function() {
	$('#edit-process').toggle();
});

// Create To Do Item
$('#new-process-form').submit(function(e) {
	e.preventDefault();
	var toDoItem = $(this).serialize();
	$('#todo-list').html('');
	$.post('/todos', toDoItem, function(data) {
		data.forEach(function(todo){
			$('#todo-list').append(
				`
				<li class="list-group-item" id="list${todo._id}">
					<span class="lead" id="${todo._id}">
						${todo.name}
					</span>
					<div class="pull-right">
						<button class="btn btn-sm btn-warning edit-button">Edit</button>
					</div>
					<div class="clearfix"></div>
				</li>
				`
				);
		});
		calcSLATime(data);
		$('#new-process').toggle();
	});
});

//Carga el formulario con los datos ya existentes del proceso
$('#todo-list').on('click', '.edit-button', function() {
	if($('#new-process').css("display") !== "none" ){
		return false;
	}
	var actionUrl = "/todos/"+$(this).parent().siblings('span.lead').attr('id');
	$.get(actionUrl, function(data){
		$('#edit-process').html(
			`
			<h1><a id="edit-process-close" class="pull-left" href="#">x</a>Editar Proceso</h1>
			<form action="/todos/${data._id}" method="POST" id="edit-process-form">
				<div class="form-group">
					<label for="name">Nombre del proceso</label>
					<input type="text" name="todo[name]" class="form-control" value="${data.name}" id="name">
				</div>
				<div class="form-group">
					<label for="client">Cliente</label>
					<input type="text" class="form-control" value="${data.client.name}" id="client" disabled>
				</div>
				<div class="form-group">
					<label for="clientTypeNumber">Tipo</label>
					<input type="number" class="form-control hidden" value="${data.client.clientTypeNumber}" id="clientTypeNumber" disabled>
					<input type="text" class="form-control" value="${data.client.clientType}" id="clientType" disabled>
				</div>
				<div class="form-group form-inline">
					<label class="mr-sm-2" for="priorityNumber">Prioridad</label>
					<select class="custom-select  mb-2 mr-sm-2 mb-sm-0" name="todo[priorityNumber]" id="priorityNumber" value="${data.priorityNumber}">
						<option value="1">Alta</option>
						<option value="2">Normal</option>
						<option value="3">Baja</option>
					</select>
				</div>
				<div class="form-group form-inline">
					<label for="createAt">Inicio</label>
					<input type="date" class="form-control" value="${moment(data.createAt).format('YYYY-MM-DD')}" id="createAt" disabled>
				</div>
				<div class="form-group form-inline">
					<label for="dateDelivery">Entrega</label>
					<input type="date" name="todo[dateDelivery]" class="form-control" value="${moment(data.dateDelivery).format('YYYY-MM-DD')}" id="dateDelivery">
				</div>
				<div class="form-group">
					<label for="office">Oficina</label>
					<input type="text" name="todo[office]" class="form-control" value="${data.office}" id="office">
				</div>
				<div class="form-group">
					<label for="assignUser">Responsable</label>
					<input type="text" name="todo[assignUser]" class="form-control" value="${data.assignUser}" id="assignUser">
				</div>
				<button class="btn btn-primary">Actualizar</button>
			</form>
			`
		);
		$("#edit-process option").each(function(el){
			if((el+1) == data.priorityNumber){
				($(this)).attr('selected', true)
			}
		});
	});
	$('#edit-process').show();
});

// Update  del proceso
$('#edit-process').on('submit', '#edit-process-form', function(e) {
	e.preventDefault();
	var toDoItem = $(this).serialize();
	var actionUrl = $(this).attr('action');
	$.ajax({
		url: actionUrl,
		data: toDoItem,
		type: 'PUT',
		success: function(data) {
			$('#todo-list').html('');
			data.forEach(function(todo){
				$('#todo-list').append(
					`
					<li class="list-group-item" id="list${todo._id}">
						<span class="lead" id="${todo._id}">
								${todo.name}
							</span>
							<div class="pull-right">
								<button class="btn btn-sm btn-warning edit-button">Edit</button>
							</div>
							<div class="clearfix"></div>
						</li>
					`
				);
			});
			calcSLATime(data);
		}
	});
	$('#edit-process').toggle();
});

// Delete To Do Item
$('#todo-list').on('submit', '.delete-item-form', function(e) {
	e.preventDefault();
	var confirmResponse = confirm('Are you sure?');
	if(confirmResponse) {
		var actionUrl = $(this).attr('action');
		var $itemToDelete = $(this).closest('.list-group-item');
		$.ajax({
			url: actionUrl,
			type: 'DELETE',
			itemToDelete: $itemToDelete,
			success: function(data) {
				this.itemToDelete.remove();
			}
		});
	} else {
		$(this).find('button').blur();
	}
});

//Rellenar datos de cliente
$('#client').on('focus', function(e) {
	$("#json-datalist").html('');
	var dataList = $("#json-datalist");
	//var input = $("#client");
	$.get("/client", function(data){
		data.forEach(function(client){
			var option = document.createElement('option');
			option.value = client.name;
			dataList[0].appendChild(option);
		});
	});
});

//Rellena el campo tipo de empresa al elegir una empresa ya existente del form crear proceso
$('#client').on('blur', function(e) {
	$.get(`/client?name=${e.target.value}`, function(client){
		if(client.length !== 0){
			$("#clientTypeNumber option").each(function(el){
				if((el) == client[0].clientTypeNumber){
					($(this)).attr('selected', true)
				}
			});
		}
	});
});

// Search functionality
$('#search').on('input', function(e) {
	e.preventDefault();
	$.get(`/todos?keyword=${e.target.value}`, function(data) {
		$('#todo-list').html('');
		data.forEach(function(todo){
			$('#todo-list').append(
				`
				<li class="list-group-item">
					<span class="lead" id="${todo._id}">
						${todo.name}
					</span>
					<div class="pull-right">
						<button class="btn btn-sm btn-warning edit-button">Edit</button>
					</div>
					<div class="clearfix"></div>
				</li>
				`
				);
		});
	});
});

//Calcula el tiempo restande de un proceso y asigna los estilos
function calcSLATime(todos){
	todos.forEach(function(todo){
		// console.log(todo.dateDelivery.diff(todo.createAt, 'days'), ' dias de diferencia');
		var fecha2 = moment(todo.dateDelivery);
		var fecha1 = moment(todo.createAt);
		var total = fecha2.diff(fecha1, 'minutes');
		var restante = ((todo.tiempoRestante-7200000)/1000/60);
		var restante = (restante*100)/total;
		//SLA = Tiempo consumido del proceso
		var sla = (100-restante);
		console.log('div?');
		console.log($('#list'+todo._id));
		switch(true) {
			case (sla >= 100):
												$('#list'+todo._id).css("backgroundColor", "white");
												break;
			case (sla >= 75):
												$('#list'+todo._id).addClass("dangerTime");
												break;
			case (sla >= 50):
												$('#list'+todo._id).addClass("warningTime");
												break;
			case (sla >= 0):
												$('#list'+todo._id).addClass("safeTime");
												break;
		}
	});
}

//LLamada al calculo del tiempo SLA cada 30 mins
$(document).ready(function() {
		console.log('entra a ready');
		$.get('/todos', function(todos) {
    	calcSLATime(todos);
		});
		setInterval('calcSLATime()', 1800000);
		});



//prueba
// $.get('/todos', function(data){
//
// 		data.forEach(function(todo){
// 				// console.log(todo.dateDelivery.diff(todo.createAt, 'days'), ' dias de diferencia');
// 				var fecha2 = moment(todo.dateDelivery);
// 				console.log(fecha2);
// 				var fecha1 = moment(todo.createAt);
// 				console.log(fecha1);
// 				var fecha3 = moment();
// 				console.log(fecha3);
//
// var total = fecha2.diff(fecha1, 'minutes');
// console.log(total);
// var consumidos = fecha3.diff(fecha1, 'minutes');
// console.log(consumidos);
// var consumido60 = moment(consumidos);
// var consumidos2 = consumido60.add(60,'minutes');
// console.log(consumidos2);
// var sla = (consumidos*100)/total
// console.log(sla);
// if(sla >= 100){
// 	console.log('black');
// } else if (sla >= 80) {
// 	console.log('red')
// } else if (sla >= 60) {
// 	console.log('yellow')
// } else {
// 	console.log('green')
// }
//
//
// 		});
//
// });
