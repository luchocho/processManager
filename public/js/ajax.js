// Create To Do Item

$('#new-process-sign').on('click', function() {
	$('#new-process').toggle();
});

$('#new-process-form').submit(function(e) {
	e.preventDefault();
	var toDoItem = $(this).serialize();
	console.log(toDoItem);
	$.post('/todos', toDoItem, function(data) {
		$('#todo-list').append(
			`
			<li class="list-group-item">
				<form action="/todos/${data._id}" method="POST" class="edit-item-form">
					<div class="form-group">
						<label for="${data._id}">Item Text</label>
						<input type="text" value="${data.name}" name="todo[name]" class="form-control" id="${data._id}">
					</div>
					<button class="btn btn-primary">Update Item</button>
				</form>
				<span class="lead">
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

// Edit To Do Item

$('#todo-list').on('click', '.edit-button', function() {
	//$(this).parent().siblings('.edit-item-form').toggle();
	var actionUrl = $(this).parent().siblings('.edit-item-form').attr('action');
	console.log(actionUrl);
	$.get(actionUrl, function(data){
		console.log(data);
		$('#edit-process').html(
			`
			<h1>Editar Proceso</h1>
			<form action="/todos/${data._id}" method="POST" id="edit-process-form">
				<div class="form-group">
					<label for="name">Nombre del proceso</label>
					<input type="text" name="todo[name]" class="form-control" value="${data.name}" id="name">
				</div>
				<div class="form-group">
					<label for="client">Cliente</label>
					<input type="text" name="todo[client]" class="form-control" value="${data.client}" id="client">
				</div>
				<div class="form-group form-inline">
					<label class="mr-sm-2" for="clientType">Tipo</label>
					<select class="custom-select  mb-2 mr-sm-2 mb-sm-0" name="todo[clientType]" id="clientType">
						<option selected>Elegir...</option>
						<option value="1">Oro</option>
						<option value="2">Plata</option>
						<option value="3">Bronce</option>
					</select>
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
					<input type="date" name="todo[createAt]" class="form-control" value="${moment(data.createAt).format('YYYY-MM-DD')}" id="createAt">
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
		$('#edit-process').toggle();
	});

});

$('#edit-process').on('submit', '#edit-process-form', function(e) {
	e.preventDefault();
	console.log('hola');
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
			$('input#'+data._id).closest('.list-group-item').html(

				`
				<form action="/todos/${data._id}" method="POST" class="edit-item-form">
					<div class="form-group">
						<label for="${data._id}">Item Text</label>
						<input type="text" value="${data.name}" name="todo[name]" class="form-control" id="${data._id}">
					</div>
					<button class="btn btn-primary">Update Item</button>
				</form>
				<span class="lead">
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

// Search functionality

$('#search').on('input', function(e) {
	e.preventDefault();
	$.get(`/todos?keyword=${e.target.value}`, function(data) {
		$('#todo-list').html('');
		data.forEach(function(todo){
			$('#todo-list').append(
				`
				<li class="list-group-item">
					<form action="/todos/${todo._id}" method="POST" class="edit-item-form">
						<div class="form-group">
							<label for="${todo._id}">Item Text</label>
							<input type="text" value="${todo.name}" name="todo[name]" class="form-control" id="${todo._id}">
						</div>
						<button class="btn btn-primary">Update Item</button>
					</form>
					<span class="lead">
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
