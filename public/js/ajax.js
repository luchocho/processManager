

objTodos = {
	init : function () {
		objTodos.toggleNewProcess();
		objTodos.toggleEditProcess();
		objTodos.toggleShowProcess();
		objTodos.createToDo();
		objTodos.loadToDoData();
		objTodos.loadEditData();
		objTodos.updateToDo();
		objTodos.deleteToDo();
		objTodos.showUsers();
		objTodos.fillClientType();
		objTodos.filter();
		objTodos.closeProcessData();
		objTodos.saveProcess();
		objTodos.searchBar();
	}
	,toggleNewProcess : function () {
		$('#new-process-sign').on('click', function(e) {
			e.preventDefault();
			if(($('#edit-process').css("display") !== "none" ) || ($('#show-process').css("display") !== "none" )){
				return false;
			}
			if ($('#new-process').css('display') == 'none') {
				//Reinicia errores de formulario
				$('#new-process-form .form-result').css('display', 'none');
				$('#new-process-form .form-result').removeClass('form-error');
				$('#new-process-form .form-result ul').html('');
				//reinicia valores de formulario
				$('#new-process-form')[0].reset();
				// $('#new-process-form #clientTypeNumber').selectedIndex = -1;
				if( $('#new-process-form #client option').length === 1) {
						objTodos.fillClientDroplist();
				}
			}
			$('#new-process').toggle();
		});
	}
	,toggleEditProcess : function () {
		// oculta el form de editar el proceso
		$('#edit-process').on('click', '#edit-process-close', function() {
			$('#edit-process').toggle();
		});
	}
	,toggleShowProcess : function () {
		// oculta el form de mostrar el proceso
		$('#show-process').on('click', '#show-process-close', function() {
			$('#show-process').toggle();
		});
	}
	,createToDo : function () {
		// Create To Do Item
		$('#new-process-form').submit(function(e) {
			e.preventDefault();
			var formData = {
				name: $(this).find('#name').val(),
				client : $(this).find('#client').val(),
				clientTypeId : $(this).find('#clientTypeId').val(),
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
				objPaintData.paintProcess(data);
				objPaintData.calcSLATime(data.todos);
				$('#new-process').toggle();
			});
		});

	}
	,loadToDoData : function () {
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
	}
	,loadEditData : function () {
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
	}
	,updateToDo : function () {
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
					objPaintData.paintProcess(data);
					objPaintData.calcSLATime(data.todos);
				}
			});
			$('#edit-process').toggle();
		});

	}
	,deleteToDo : function () {
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

	}
	,showUsers : function () {
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
	}
	,fillClientDroplist : function () {
		//Rellenar datos de cliente
		var select = $("#client");

		$.get("/client", function(data){
			data.forEach(function(client){
				var opt = client.name;
				var el = document.createElement("option");
				el.textContent = opt;
				el.value = opt;
				select[0].appendChild(el);
			});
		});
	}
	,fillClientType : function () {
		//Rellena el campo tipo de empresa al elegir una empresa ya existente del form crear proceso
		$('#client').on('change', function(e) {
			$.get(`/client?name=${e.target.value}`, function(client){
			    console.log(client);
				if(client.length !== 0){
					$("#clientTypeNumber option").each(function(el){
						if((el) == client[0].clientTypeNumber){
							($(this)).prop('selected', true)
						} else {
					    ($(this)).prop('selected', false)
						}
					});
					$("#clientTypeId").val(client[0].clientTypeId);
				}
			});
		});
	}
	,filter : function () {
		//Filtros
		$('.list-inline a').on('click', function(e){
			$.get('/todos?name=' + e.currentTarget.text, function(data){
				objPaintData.paintProcess(data);
				objPaintData.calcSLATime(data.todos);
			});
		});
	}
	,closeProcessData : function () {
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
	}
	,saveProcess : function () {
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
					objPaintData.paintProcess(data);
					objPaintData.calcSLATime(data.todos);
					$('#closeForm').modal('hide');
				}
			});
		});
	}
	,searchBar : function () {
		// Search functionality
	  $('#search').on('input', function(e) {
	  	e.preventDefault();
	  	$.get(`/todos?keyword=${e.target.value}`, function(data) {
		 		objPaintData.paintProcess(data);
		 		objPaintData.calcSLATime(data.todos);
	  		});
	  	});
	}
}

objPaintData = {
	calcSLATime : function (todos) {
		//Calcula el tiempo restande de un proceso y asigna los estilos
		todos.forEach(function(todo){
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

			objPaintData.paintProgress(sla, todo);
			objPaintData.paintCloseProcess(todo);
			objPaintData.paintImgUser(todo);
			objPaintData.paintImgSelection(todo);

		});
		objPaintData.loadSVG();
	}
	,paintProgress : function (sla, todo) {
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
	}
	,paintCloseProcess : function (todo) {
		if(todo.stateNumber !== 0){
			$('#progress'+todo._id).removeClass('active');
			$('.lead#'+todo._id).css('text-decoration', 'line-through');
		}
	}
	,paintImgUser : function (todo) {
		if(typeof todo.assignUser.initials !== 'undefined'){
			$('#initials-container'+todo._id).text(todo.assignUser.initials);
		} else {
			$('#bio-image'+todo._id).hide();
		}
	}
	,paintImgSelection : function (todo) {
		if(typeof todo.processType !== 'undefined'){

			switch(todo.processType) {
				case 'Recurrente':
					$('#selection-image'+todo._id).attr('src','/img/icons8-24hour.png');
					break;
				case 'Habitual':
					$('#selection-image'+todo._id).attr('src','/img/icons8-run.png');
					break;
				case 'Agil':
					$('#selection-image'+todo._id).attr('src','/img/icons8-agil.png');
					break;
				case 'Expertise':
					$('#selection-image'+todo._id).attr('src','/img/icons8-agil.png');
					break;
				case 'Estrategica y de impacto':
					$('#selection-image'+todo._id).attr('src','/img/icons8-king.png');
					break;
				case 'Otra':
					$('#selection-image'+todo._id).attr('src','/img/icons8-otros.png');
					break;
			}
		}
	}
	,paintProcess : function (todos) {
		$('#todo-list').html('');
		todos.todos.forEach(function(todo){
			console.log(todo);
			$('#todo-list').append(
				`
				<li class="list-group-item" id="list${todo._id}" >
					<div class="row">
						<div class="col-md-8">
							<span class="lead" id="${todo._id}">
								${todo.name}
							</span>
						</div>
						<div class="col-md-4">
							<img src="/img/medal.svg" class="pull-right svg svg${todo.client.clientTypeNumber}" alt="">
							<img src="" id="selection-image${todo._id}" class="pull-right selection-image">
							<div id="bio-image${todo._id}" class="pull-right bio-image">
								<div id="initials-container${todo._id}" class="pull-right initials-container">
								</div>
							</div>
						</div>
					</div>
					<div class="progress">
						<div class="progress-bar progress-bar-striped active" id="progress${todo._id}" role="progressbar"
								aria-valuenow="" aria-valuemin="0" aria-valuemax="100" style="width:">
						</div>
					</div>
					<div class="pull-right">
					${todos.isAdmin == false && todos.id !== todo.assignUser._id  ? ''
						: todos.isAdmin == undefined ? ''
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
	,loadSVG : function () {
		//Replace all SVG images with inline SVG
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
}

objClient = {
	init : function () {
		objClient.clientModal();
		objClient.saveClientModal();
	}
	,clientModal : function () {
		$('#createClientButton').on('click', function () {
			objClient.resetDataModal();
			$('#newClient-process-form .form-result-newClient').css('display', 'none');
			$('#newClient-process-form .form-result-newClient').removeClass('form-error');
			$('#newClientForm').modal('show');
		});
	}
	,saveClientModal : function () {
		//Guardar nuevo cliente
		$('.modal-body').on('submit', '#newClient-process-form', function(e){
			e.preventDefault();
			var formData = {
				clientName: $(this).find('#newClient').val(),
				clientTypeNumber : $(this).find('#newClientTypeNumber').val(),
			}
			var result = formValidationClient(formData);
			if (objClient.modalFormValidation(result) !== false) {
				var newClient = $(this).serialize();
				var actionUrl = '/client'
				$.ajax({
					url: actionUrl,
					data: newClient,
					type: 'PUT',
					success: function(data) {
						$('#newClientForm').modal('hide');
					}
				});
			}
		});
	}
	,resetDataModal : function () {
		$('#newClient-process-form')[0].reset();
	}
	,modalFormValidation : function (result) {
		$('#newClient-process-form .form-result-newClient ul').html('');
		if(result.length > 0){
			$('#newClient-process-form .form-result-newClient').addClass('form-error');
			$('#newClient-process-form .form-result-newClient h4').text('Revisa los siguientes campos: ')
			result.forEach(function(error){
				$('#newClient-process-form .form-result-newClient ul').append('<li>' + error.msg + '</li>')
			});
			$('#newClient-process-form .form-result-newClient').css('display', 'block');
			return false;
		} else {
			$('#newClient-process-form .form-result-newClient').css('display', 'none');
			$('#newClient-process-form .form-result-newClient').removeClass('form-error');
		};
	}
}

function formValidation(data){
	var result = [];
	if((typeof data.name !== 'undefined') && (data.name == '')){
		 result.push({error : 'true', msg : 'Nombre del proceso'});
	};
	if((typeof data.clientTypeId !== 'undefined') && ((data.client == '') || (data.client == 'Elige un cliente'))){
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

function formValidationClient(data) {
	var result = [];
	if((typeof data.clientName !== 'undefined') && (data.clientName == '')){
		 result.push({error : 'true', msg : 'Nombre del cliente'});
	};
	if((typeof data.clientTypeNumber !== 'undefined') && ((data.clientTypeNumber == '') || (data.clientTypeNumber == 'Elegir...'))){
		result.push({error : 'true', msg : 'Tipo de cliente'});
	};
	return result;
}

 //LLamada al calculo del tiempo SLA cada 30 mins
 $(document).ready(function() {
 		$.get('/todos', function(todos) {
     	objPaintData.calcSLATime(todos.todos);
 		});
 		setInterval('objPaintData.calcSLATime(todos.todos)', 1800000);
		objTodos.init();
		objClient.init();
 });
