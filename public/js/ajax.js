
// Muestra o oculta el form de creacion de proceso
$('#new-process-sign').on('click', function(e) {
	e.preventDefault();
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
	$.post('/todos', toDoItem, function(data) {
		console.log(data);
		paintProcess(data);
		calcSLATime(data.todos);
		$('#new-process').toggle();
	});
});

//Carga el formulario con los datos ya existentes del proceso
$('#todo-list').on('click', '.edit-button', function() {
	if($('#new-process').css("display") !== "none" ){
		return false;
	}
	var buttonId = $(this).attr('id').split("button");
	var actionUrl = "/todos/"+buttonId[1];
	$.get(actionUrl, function(data){
		$('#edit-process #edit_processId').val(data._id);
		$('#edit-process #name').val(data.name);
		$('#edit-process #client').val(data.client.name);
		$('#edit-process #client').val(data.client.name);
		$('#edit-process #clientTypeNumber').val(data.client.clientTypeNumber);
		$('#edit-process #clientType').val(data.client.clientType);
		$('#edit-process #priorityNumber').val(data.priorityNumber);
		$('#edit-process #selection').val(data.processType);
		$('#edit-process #createAt').val(moment(data.createAt).format('YYYY-MM-DD'));
		$('#edit-process #dateDelivery').val(moment(data.dateDelivery).format('YYYY-MM-DD'));
		$('#edit-process #office').val(data.office);
		$('#edit-process #assignUser').val(data.assignUser.username);

		$("#edit-process option").each(function(el){
			if((el+1) == data.priorityNumber){
				($(this)).attr('selected', true)
			}
		});
	});
	$('#edit-process').show();
	$("html, body").animate({ scrollTop: 0 }, "slow");
});

// Update  del proceso
$('#edit-process').on('submit', '#edit-process-form', function(e) {
	e.preventDefault();
	var toDoItem = $(this).serialize();
	var actionUrl = '/todos/' + $(this).find('#edit_processId').val();
	$.ajax({
		url: actionUrl,
		data: toDoItem,
		type: 'PUT',
		success: function(data) {
			console.log(data);
			paintProcess(data);
			calcSLATime(data.todos);
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

	$.get("/client", function(data){
		data.forEach(function(client){
			var option = document.createElement('option');
			option.value = client.name;
			dataList[0].appendChild(option);
		});
	});
});

//Rellenar datos de usuario
$('.assignUser').on('focus', function(e) {
	console.log('entra');
	$("#json-userlist").html('');
	var dataList = $("#json-userlist");

	$.get("/user", function(data){
		data.forEach(function(user){
			var option = document.createElement('option');
			option.value = user.username;
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


//Filtros
$('.list-inline a').on('click', function(e){
	console.log(e.currentTarget.text);
	$.get('/todos?name=' + e.currentTarget.text, function(data){
		paintProcess(data);
		calcSLATime(data.todos);
	});
})


//Modal Cerrar proceso
$('#todo-list').on('click','.close-button', function(e){
	e.preventDefault();
	var buttonId = $(this).attr('id').split("close");
	var actionUrl = "/todos/"+buttonId[1];
	$.get(actionUrl, function(todo){
		var fecha2 = moment();
		var fecha1 = moment(todo.createAt);
		var total = fecha2.diff(fecha1, 'minutes');
		$('#modal-name').val(todo.name);
		$('#modal-id').val(todo._id);
		$('.proccessTime').text('Tiempo aproximado del proceso: ' + Math.round(total/60/24) + 'días');
	});
});

//Guardar cierre de proceso
$('.modal-body').on('submit', '#close-process-form', function(e){
	e.preventDefault();
	var toDoItem = $(this).serialize();
	var actionUrl = '/todos/'+$('#modal-id').val();
	$.ajax({
		url: actionUrl,
		data: toDoItem,
		type: 'PUT',
		success: function(data) {
			paintProcess(data);
			calcSLATime(data.todos);
			$('#closeForm').modal('hide');
		}
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
		switch(true) {
			case (sla >= 100):
												// $('#list'+todo._id).css("backgroundColor", "white");
												$('#progress'+todo._id).addClass('progress-bar-danger');
												$('#progress'+todo._id).removeClass('active progress-bar-striped');
												$('#progress'+todo._id).attr('aria-valuenow',Math.round(sla));
												$('#progress'+todo._id).attr('style','width:'+Math.round(sla)+'%');
												break;
			case (sla >= 75):
												// $('#list'+todo._id).addClass("dangerTime");
												$('#progress'+todo._id).addClass('progress-bar-danger');
												$('#progress'+todo._id).attr('aria-valuenow',Math.round(sla));
												$('#progress'+todo._id).attr('style','width:'+Math.round(sla)+'%');
												break;
			case (sla >= 50):
												// $('#list'+todo._id).addClass("warningTime");
												$('#progress'+todo._id).addClass('progress-bar-warning');
												$('#progress'+todo._id).attr('aria-valuenow',Math.round(sla));
												$('#progress'+todo._id).attr('style','width:'+Math.round(sla)+'%');
												break;
			case (sla >= 0):
												// $('#list'+todo._id).addClass("safeTime");
												$('#progress'+todo._id).addClass('progress-bar-success');
												$('#progress'+todo._id).attr('aria-valuenow',Math.round(sla));
												$('#progress'+todo._id).attr('style','width:'+Math.round(sla)+'%');
												break;
		}
	});
	loadSVG();
}

function paintProcess(todos){
	$('#todo-list').html('');
	todos.todos.forEach(function(todo){
		$('#todo-list').append(
			`
			<li class="list-group-item" id="list${todo._id}" >
				<div class="row">
					<div class="col-md-9">
						<span class="lead" id="${todo._id}">
							${todo.name}
						</span>
					</div>
					<div class="col-md-3">
						<img src="/img/medal.svg" class="svg svg${todo.client.clientTypeNumber}" alt="">
					</div>
				</div>
				<div class="progress">
					<div class="progress-bar progress-bar-striped active" id="progress${todo._id}" role="progressbar"
							aria-valuenow="" aria-valuemin="0" aria-valuemax="100" style="width:">
					</div>
				</div>
				<div class="pull-right">
				${todos.isAdmin == true || todos.id == todo.assignUser.id  ?
					`<button class="btn btn-sm btn-primary edit-button" id="button${todo._id}">Editar</button>
					<button type="button" class="btn btn-sm btn-info close-button" id="close${todo._id}" data-toggle="modal" data-target="#closeForm">Cerrar</button>` : '' }
				</div>
				<div class="clearfix"></div>
			</li>
			`
			);
	});
}

//LLamada al calculo del tiempo SLA cada 30 mins
$(document).ready(function() {
		console.log('entra a ready');
		$.get('/todos', function(todos) {
    	calcSLATime(todos.todos);
		});
		setInterval('calcSLATime(todos.todos)', 1800000);
});

/*
 * Replace all SVG images with inline SVG
 */
 function loadSVG(){
	 jQuery('img.svg').each(function(){
			 var $img = jQuery(this);
			 var imgID = $img.attr('id');
			 var imgClass = $img.attr('class');
			 var imgURL = $img.attr('src');

			 jQuery.get(imgURL, function(data) {
					 // Get the SVG tag, ignore the rest
					 var $svg = jQuery(data).find('svg');

					 // Add replaced image's ID to the new SVG
					 if(typeof imgID !== 'undefined') {
							 $svg = $svg.attr('id', imgID);
					 }
					 // Add replaced image's classes to the new SVG
					 if(typeof imgClass !== 'undefined') {
							 $svg = $svg.attr('class', imgClass+' replaced-svg');
					 }

					 // Remove any invalid XML tags as per http://validator.w3.org
					 $svg = $svg.removeAttr('xmlns:a');

					 // Check if the viewport is set, if the viewport is not set the SVG wont't scale.
					 if(!$svg.attr('viewBox') && $svg.attr('height') && $svg.attr('width')) {
							 $svg.attr('viewBox', '0 0 ' + $svg.attr('height') + ' ' + $svg.attr('width'))
					 }

					 // Replace image with new SVG
					 $img.replaceWith($svg);

			 }, 'xml');

	 });

 }

 // Search functionality
 $('#search').on('input', function(e) {
 	e.preventDefault();
 	$.get(`/todos?keyword=${e.target.value}`, function(data) {
		paintProcess(data);
		calcSLATime(data.todos);
 		});
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
