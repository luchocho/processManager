
// Muestra o oculta el form de creacion de proceso
$('#new-process-sign').on('click', function() {
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
	console.log(toDoItem);
	$.post('/todos', toDoItem, function(data) {
		$('#todo-list').append(
			`
			<li class="list-group-item">
				<span class="lead" id="${data._id}">
					${data.name}
				</span>
				<div class="pull-right">
					<button class="btn btn-sm btn-warning edit-button">Edit</button>
				</div>
				<div class="clearfix"></div>
			</li>
			`
			);
			$('#new-process').toggle();
	});
});

//Carga el formulario con los datos ya existentes del proceso
$('#todo-list').on('click', '.edit-button', function() {

	var actionUrl = "/todos/"+$(this).parent().siblings('span.lead').attr('id');
	console.log(actionUrl);
	$.get(actionUrl, function(data){
		console.log(data);
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
					<label for="clientType">Tipo</label>
					<input type="text" class="form-control" value="${data.client.clientType}" id="clientType" disabled>
				</div>
				<div class="form-group form-inline">
					<label class="mr-sm-2" for="priority">Prioridad</label>
					<select class="custom-select  mb-2 mr-sm-2 mb-sm-0" name="todo[priority]" id="priority" value="${data.priority}">
						<option value="Alta">Alta</option>
						<option value="Normal">Normal</option>
						<option value="Baja">Baja</option>
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
		)
	});
	$('#edit-process').show();
});

// Update  del proceso
$('#edit-process').on('submit', '#edit-process-form', function(e) {
	e.preventDefault();
	var toDoItem = $(this).serialize();
	var actionUrl = $(this).attr('action');
//	var $originalItem = $(this).parent('.list-group-item');
	console.log(toDoItem);
	$.ajax({
		url: actionUrl,
		data: toDoItem,
		type: 'PUT',
		//originalItem: $originalItem,
		success: function(data) {
			$('span#'+data._id).closest('.list-group-item').html(

				`
				<span class="lead" id="${data._id}">
					${data.name}
				</span>
				<div class="pull-right">
					<button class="btn btn-sm btn-warning edit-button">Edit</button>
				</div>
				<div class="clearfix"></div>
				`
			);
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
	var dataList = $("#json-datalist");
	var input = $("#client");
	$.get("/client", function(data){
		data.forEach(function(client){
			var option = document.createElement('option');
			option.value = client.name;
			dataList[0].appendChild(option);
		});
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
					<span class="lead" id="${data._id}">
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
