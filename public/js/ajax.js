
// Muestra o oculta el form de creacion de proceso
$('#new-process-sign').on('click', function(e) {
	e.preventDefault();
	if(($('#edit-process').css("display") !== "none" ) || ($('#show-process').css("display") !== "none" )){
		return false;
	}
	$('#new-process').toggle();
	//Reinicia errores de formulario
	$('#new-process-form .form-result').css('display', 'none');
	$('#new-process-form .form-result').removeClass('form-error');
	$('#new-process-form .form-result ul').html('');
	//reinicia valores de formulario
	$('#new-process-form #name').val('');
	$('#new-process-form #client').val('');
	$('#new-process-form #clientTypeNumber').val('Elegir...');
	$('#new-process-form #clientType').val('');
	$('#new-process-form #priorityNumber').val('Elegir...');
	$('#new-process-form #selection').val('Elegir...');
	$('#new-process-form #dateDelivery').val('');
	$('#new-process-form #office').val('');

});

// oculta el form de editar el proceso
$('#edit-process').on('click', '#edit-process-close', function() {
	$('#edit-process').toggle();
});

$('#show-process').on('click', '#show-process-close', function() {
	$('#show-process').toggle();
});

// Create To Do Item
$('#new-process-form').submit(function(e) {
	e.preventDefault();
	var formData = {
		name: $(this).find('#name').val(),
		clientName : $(this).find('#client').val(),
		clientTypeNumber : $(this).find('#clientTypeNumber').val(),
		priorityNumber : $(this).find('#priorityNumber').val(),
		processType : $(this).find('#selection').val(),
		createAt : $(this).find('#createAt').val(),
		dateDelivery : $(this).find('#dateDelivery').val(),
		office : $(this).find('#office').val(),
		assignUser : $(this).find('#assignUser').val()
	}
	var result = formValidation(formData);

	$('#new-process-form .form-result ul').html('');
	if(result.length > 0){
		$('#new-process-form .form-result').addClass('form-error');
		$('#new-process-form .form-result h4').text('Revisa los siguientes campos: ')
		result.forEach(function(error){
			$('#new-process-form .form-result ul').append('<li>' + error.msg + '</li>')
		});
		$('#new-process-form .form-result').css('display', 'block');
		return false;
	} else {
		$('#new-process-form .form-result').css('display', 'none');
		$('#new-process-form .form-result').removeClass('form-error');
	};
	var toDoItem = $(this).serialize();
	$.post('/todos', toDoItem, function(data) {
		console.log(data);
		paintProcess(data);
		calcSLATime(data.todos);
		$('#new-process').toggle();
	});
});

//Carga el formulario con los datos ya existentes del proceso
$('#todo-list').on('click', '.list-group-item', function() {
	if(($('#new-process').css("display") !== "none" ) || ($('#edit-process').css("display") !== "none" )){
		return false;
	}
	var listId = $(this).attr('id').split("list");
	var actionUrl = "/todos/"+listId[1];
	$.get(actionUrl, function(data){
		$('#show-process #name').val(data.name);
		$('#show-process #client').val(data.client.name);
		$('#show-process #clientTypeNumber').val(data.client.clientTypeNumber);
		$('#show-process #clientType').val(data.client.clientType);
		$('#show-process #priorityNumber').val(data.priorityNumber);
		$('#show-process #selection').val(data.processType);
		$('#show-process #createAt').val(moment(data.createAt).format('YYYY-MM-DD'));
		$('#show-process #dateDelivery').val(moment(data.dateDelivery).format('YYYY-MM-DD'));
		$('#show-process #office').val(data.office);
		$('#show-process #assignUser').val(data.assignUser.username);
		$("#show-process option").each(function(el){
			if((el+1) == data.priorityNumber){
				($(this)).attr('selected', true)
			}
		});

	});
	$('#show-process').show();
	$("html, body").animate({ scrollTop: 0 }, "slow");
});


//Carga el formulario con los datos ya existentes del proceso para editarlo
$('#todo-list').on('click', '.edit-button', function(e) {
	if(($('#new-process').css("display") !== "none" ) || ($('#show-process').css("display") !== "none" )){
		return false;
	}
	var buttonId = $(this).attr('id').split("button");
	var actionUrl = "/todos/"+buttonId[1];
	$.get(actionUrl, function(data){
		$('#edit-process #edit_processId').val(data._id);
		$('#edit-process #name').val(data.name);
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
	var formData = {
		name: $(this).find('#name').val(),
		priorityNumber : $(this).find('#priorityNumber').val(),
		createAt : $(this).find('#createAt').val(),
		dateDelivery : $(this).find('#dateDelivery').val(),
		office : $(this).find('#office').val(),
	}
	var result = formValidation(formData);

	$('#edit-process-form .form-result ul').html('');
	if(result.length > 0){
		$('#edit-process-form .form-result').addClass('form-error');
		$('#edit-process-form .form-result h4').text('Revisa los siguientes campos: ')
		result.forEach(function(error){
			$('#edit-process-form .form-result ul').append('<li>' + error.msg + '</li>')
		});
		$('#edit-process-form .form-result').css('display', 'block');
		return false;
	} else {
		$('#edit-process-form .form-result').css('display', 'none');
		$('#edit-process-form .form-result').removeClass('form-error');
	};
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
	if(!($('#edit-process-form #assignUser').is('[readonly]')) || !($('#new-process-form #assignUser').is('[readonly]'))){
		$("#json-userlist").html('');
		var dataList = $("#json-userlist");

		$.get("/user", function(data){
			data.forEach(function(user){
				var option = document.createElement('option');
				option.value = user.username;
				dataList[0].appendChild(option);
			});
		});
	}
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
	e.stopPropagation();
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
	$('#closeForm').modal('show');
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
		//Fecha Inicio
		var fecha1 = moment(todo.createAt);
		//Fecha Fin
		var fecha2 = moment(todo.dateDelivery);
		//Total de tiempo para el proceso
		var total = fecha2.diff(fecha1, 'minutes');

		if(todo.stateNumber !== 0){
				//Si proceso cerrado - Diferencia desde fecha de entrega a fecha entregado
				var restante = fecha2.diff(todo.dateDelivered, 'minutes');
		} else {
				//Si proceso abierto - Tiempo restante calculado desde bbdd
				var restante = ((todo.tiempoRestante-7200000)/1000/60);
		}
		//Tiempo restante en %
		var restante = (restante*100)/total;
		//SLA = Tiempo consumido del proceso
		var sla = (100-restante);

		switch(true) {
			case (sla >= 100):
												// $('#list'+todo._id).css("backgroundColor", "white");
												$('#list'+todo._id).addClass('time-over');
												$('#progress'+todo._id).addClass('progress-bar-grey');
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
		if(todo.stateNumber !== 0){
			$('#progress'+todo._id).removeClass('active');
			$('.lead#'+todo._id).css('text-decoration', 'line-through');
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
				${todos.isAdmin == false && todos.id !== todo.assignUser.id  ? ''
					: todo.stateNumber == 0 ?
					`<button class="btn btn-sm btn-primary edit-button" id="button${todo._id}">Editar</button>
					<button type="button" class="btn btn-sm btn-info close-button" id="close${todo._id}" data-toggle="modal" data-target="#closeForm">Cerrar</button>` : '' }
				</div>
				<div class="clearfix"></div>
			</li>
			`
			);
	});
}

function formValidation(data){
	var result = [];
	if((typeof data.name !== 'undefined') && (data.name == '')){
		 result.push({error : 'true', msg : 'Nombre del proceso'});
	};
	if((typeof data.clientName !== 'undefined') && (data.clientName == '')){
		result.push({error : 'true', msg : 'Nombre del cliente'});
	};
	if((typeof data.clientTypeNumber !== 'undefined') && ((data.clientTypeNumber == '') || (data.clientTypeNumber == 'Elegir...'))){
		result.push({error : 'true', msg : 'Tipo de cliente'});
	};
	if((typeof data.priorityNumber !== 'undefined') && ((data.priorityNumber == '') || (data.priorityNumber == 'Elegir...'))){
		 result.push({error : 'true', msg : 'Prioridad'});
	};
	if((typeof data.processType !== 'undefined') && ((data.processType == '') || (data.processType == 'Elegir...'))){
		result.push({error : 'true', msg : 'Selección'});
	};
	if((typeof data.createAt !== 'undefined') && ((data.createAt == '') || (data.createAt > data.dateDelivery))){
		result.push({error : 'true', msg : 'Fecha Inicio'});
	};
	if((typeof data.dateDelivery !== 'undefined') && ((data.dateDelivery == '') || (data.dateDelivery < data.createAt))){
		result.push({error : 'true', msg : 'Fecha de Entrega'});
	};
	if((typeof data.office !== 'undefined') && (data.office == '')){
		result.push({error : 'true', msg : 'Oficina'});
	};
	if((typeof data.assignUser !== 'undefined') && (data.assignUser == '')){
		result.push({error : 'true', msg : 'Responsable'});
	};

	return result;
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
