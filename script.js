
var currentPage = 1;    
var lastPage = 3;             //lastPage of current pagination list
var userData;                 //will contain the user-data after fetching from api through AJAX
var totalPages;               //contain the total pages created w.r.t to fetched user data
var rowsDeletion = [];        //arrays contains the row-id's to be created when selected to delete

$('#delete-selected').on('click',deleteSelected);   //add click event to the delete selected button
$('#search-button').on('click',search);             //add click event on search-user button

//making an ajax request to fetch user data through JQuery
$.ajax({
	url: 'https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json',
	method: 'get',
	success: function(data){
		userData = data;
		for(let i=0;i<=9;i++){
			$('#user-container').append(newUserDom(data[i]));    //create first 10 rows and through newUserDom() and append it on page 1
		}
		pageNavViewer(data);            //will create the Navbar to navigate pages
		addCheckboxEvent();             //add click event on the checkboxes of each row
		addDeleteEvent();               //add click event to all the trash buttons of each row
		addEditEvent();                 //add click event to all the edit buttons of each row
	}
});


//method for creating new user
let newUserDom = function(user){
	return(`<div id='row-${user.id}' class="row pt-3 border-bottom border-secondary border-1">
		<div class="col-1 mb-2">
		    <input data-value='row-${user.id}' class="form-check-input" type="checkbox" value="" id="flexCheckDefault">
		</div>
		<div class="col-3 search-helper text-secondary mb-2 text-center">${user.name}</div>
		<div class="col-3 search-helper text-secondary mb-2 text-center">${user.email}</div>
		<div class="col-3 search-helper text-secondary mb-2 text-center text-capitalize">${user.role}</div>
		<div class="col-2 text-secondary mb-2 text-center">
		    <a href="#" data-value="row-${user.id}" class="trash"><i class="fas fa-trash fa-lg" style="color:red"></i></a>&nbsp;&nbsp 
		    <a href="#" data-value="${user.id}" class="edit"><i class="fas fa-edit fa-lg"></i></a></div>
		</div>`);
}


//add page navigation list to footer very first when data is fetched from AJAX
function pageNavViewer(users){

	//calculating total pages created from total no. of users 
	let totalUsers = users.length;            
    totalPages = Math.ceil(totalUsers/10) ;

    //apppend previous page link button
    $('.pagination').append(`<li class="page-item"><a class="page-link" id='previous' href="#">Previous</a></li>`);

    //append first 3 pages link button
    for(let i=1;i<=3;i++){
    	$('.pagination').append(`<li class="page-item"><a id='${i}' class="page-link" href="#">${i}</a></li>`);
    }

    //append next page link button
    $('.pagination').append(`<li class="page-item"><a class="page-link" id='next' href="#">Next</a></li>`);

    //adding click events
    addNavEvent();
    $('#next').on('click',nextPages);

    //highlighting page 1 button
    $('#1').css({
    	color: 'white',
    	backgroundColor: 'blue'
    });
}

//delete all the selected rows 
function deleteSelected() {
	if(rowsDeletion.length == 0){
		alert('Select Rows to Delete'); 
	}

	for(let i=0;i<rowsDeletion.length;i++){
		$(`#${rowsDeletion[i]}`).remove();        //removing all rows whose id's stored in rowsDeletion[] array
	}

	rowsDeletion = [];                            //make arrray empty after deleting all rows for further deletion
}


//navigate the pages
function navigatePage(page){

	$('#search-input').val('');                   //clean-up search-bar when page navigate  
	currentPage = page;                           //storing current page in global variable
	rowsDeletion = [];                            //also clean-up rowsDeletion if any element is selected in previous page and not deleted
    
    //higlighting current page
	$('.page-link').css({                         
		color: 'blue',
		backgroundColor: 'white'
	});

	//calculate index of first row in userData to be displayed on current page 
	let userStartIndex = page*10 - 10;
	let loopCount = 0;                      //initiate loopCount from 0and goes upto 9 as we have to display 10 rows       

	$('#user-container').empty();           //clean the previous page rows

	//append new rows on the new page
	while(loopCount < 10 && userStartIndex < userData.length){
		$('#user-container').append(newUserDom(userData[userStartIndex]));  
		userStartIndex++;
		loopCount++;
	}

	//highlighting current page
	$(`#${page}`).css({
		color: 'white',
		backgroundColor: 'blue'
	});

	//add all click events again 
	addCheckboxEvent();   
	addDeleteEvent();     
	addEditEvent();
}

//fetch the data from input fields of edi and pass to editDone() when clicked on done button to reflect changes
function editRow(row){
	$(`#row-${row}`).empty();                        //delete all the rows from particular row
	$(`#row-${row}`).append(inputToEdit(row));       //create and append input fields to all cols of particular row

	////remove all the click event during editing
	$('#delete-selected').off('click');            
	$('a').off('click');
	$('input').off('click');

	//click event on done button of editing and call editDone() on click
	$('#edit-done').on('click',function(){
		editDone(row);
	});

}

//create input fields in each column of a particular row when click on edit
let inputToEdit =  function(rowId){
	return(`<div class="col-1 mb-2">
		        <input datavalue='row-${rowId}' class="form-check-input" type="checkbox" value="" id="flexCheckDefault">
		</div>
		<div class="col-3 search-helper text-secondary mb-2 text-center">
		    <input type="text" id="name-${rowId}" placeholder="Enter name..">
		</div>
		<div class="col-3 search-helper text-secondary mb-2 text-center">
		    <input type="text" id="email-${rowId}" placeholder="Enter email..">
		</div>
		<div class="col-3 search-helper text-secondary mb-2 text-center text-capitalize">
		    <input type="text" id="role-${rowId}" placeholder="Enter role.."></div>
		<div class="col-2 text-secondary mb-2 text-center">
		<button id="edit-done" type="button" class="btn btn-success">Done</button>
		</div>`);
}


//called when click on done after entering all the values in input
function editDone(row){
	//fetching values from input field
	var name = $(`#name-${row}`).val();
	var email = $(`#email-${row}`).val();
	var role = $(`#role-${row}`).val();

	//delete the input fields from row
	$(`#row-${row}`).empty();

	//creating cols of a row by putting editted data 
	$(`#row-${row}`).append(`<div class="col-1 mb-2"></div>
        		<div class="col-3 search-helper text-secondary mb-2 text-center">${name}</div>
        		<div class="col-3 search-helper text-secondary mb-2 text-center">${email}</div>
        		<div class="col-3 search-helper text-secondary mb-2 text-center text-capitalize">${role}</div>
        		<div class="col-2 text-secondary mb-2 text-center">
        		    <a href="#" data-value="row-${row}" class="trash"><i class="fas fa-trash fa-lg" style="color:red"></i></a>&nbsp;&nbsp 
        		    <a href="#" data-value="${row}" class="edit"><i class="fas fa-edit fa-lg"></i></a>
        		</div>`);

	//enable all click events again after successfully edit the row
	$('#delete-selected').on('click',deleteSelected);
	$('#next').on('click',nextPages);
	if(lastPage > 3){                             
		 $('#previous').on('click',prevPages);   //add event only when user is on the page greater than 3
	}
	addCheckboxEvent();
	addDeleteEvent();
	addEditEvent();
	addNavEvent();
}


//triggered when clicked on 'Next' button pagination
function nextPages(){

	lastPage += 1;
	let loopStart = lastPage;
	let loopEnd = lastPage + 2;

	$('.pagination').empty();     //clear the previous pagination

	//append 'previous' link button
	$('.pagination').append(`<li class="page-item"><a class="page-link" id='previous' href="#">Previous</a></li>`);
	
	//append pageNo. buttons
	while(loopStart <= loopEnd && loopStart <= totalPages){
		$('.pagination').append(`<li class="page-item"><a id='${loopStart}' class="page-link" href="#">${loopStart}</a></li>`);
		loopStart++;
	}

	//append 'Next' link button
	$('.pagination').append(`<li class="page-item"><a class="page-link" id='next' href="#">Next</a></li>`);

	//navigate to first page of the next pages set
	navigatePage(lastPage);

	//updating lastPage value according to new pages set
	lastPage = loopEnd;

	//adding click events
	addNavEvent();

	if(loopStart <= totalPages)
		$('#next').on('click',nextPages);

	if(lastPage > 3)
		$('#previous').on('click',prevPages);

}

//triggered when click on 'Previous' button
function prevPages() {

	//calculating startPage and lastPage when clicked on 'previous' button
	let rem = lastPage % 3;
	if(rem == 0)
		lastPage = lastPage - 3;
	else
		lastPage = lastPage - rem;

	let startPage = lastPage - 2;

	$('.pagination').empty();      //removing old pagination buttons

	//append 'previous' button link
	$('.pagination').append(`<li class="page-item"><a class="page-link" id='previous' href="#">Previous</a></li>`);

	//append pageNo. link buttons
	for(let i=startPage;i<=lastPage;i++){
		$('.pagination').append(`<li class="page-item"><a id='${i}' class="page-link" href="#">${i}</a></li>`);
	}

	//append 'Next' link button
	$('.pagination').append(`<li class="page-item"><a class="page-link" id='next' href="#">Next</a></li>`);

	//adding all click events again
	addNavEvent();
	navigatePage(lastPage);

	if(lastPage > 3)
	    $('#previous').on('click',prevPages);

	$('#next').on('click',nextPages);

}

// ........................................*All Click Events*...............................................

//add click event on all edit buttons
function addEditEvent(){
	var editsButton = $('.edit');

	for(let i=0;i<editsButton.length;i++){
		editsButton.eq(i).on('click',function(){
			editRow(editsButton.eq(i).attr('data-value'));  //calling editRow() on click
		});
	}
}


//add click event listener to nav links
function addNavEvent(){
	var pageStart = lastPage - 2;

	for(let i=pageStart;i<=lastPage;i++){
		$(`#${i}`).on('click',function(event){
			event.preventDefault();
			navigatePage(i);                                 //calling navigatePage() on click
		});
	}
}

//add click event on multiple delete checkboxes
function addCheckboxEvent() {
	var checkbox = $('.form-check-input');

	for(let i=0;i<checkbox.length;i++){
		checkbox.eq(i).on('click',function(){

			//fetching data-value attribute value which contains id of particular row to delete
			let rowData = checkbox.eq(i).attr('data-value');

			//adding the row-id to rowsDeletion array only if it is not present in array.        
			let index = rowsDeletion.indexOf(rowData);
			if(index != -1){
				rowsDeletion.splice(index,1);                //if present already then delete row-id (it means user is clicking for deSelecting row)
				$(`#${rowData}`).css('background','white');  //making background of row again white after deSelecting
			}else{
				rowsDeletion.push(rowData);                     //if not present the push into array 
				$(`#${rowData}`).css('background','lightgrey'); //make background of row to lightgrey
			}
		});
	}
}

//add click event to delete button of all rows
function addDeleteEvent(){
	var trashButtons = $('.trash');
	for(let i=0;i<trashButtons.length;i++){
		trashButtons.eq(i).on('click',function(e){
			e.preventDefault;
			let rowData = trashButtons.eq(i).attr('data-value');  //fetch the value of rowId and remove from the DOM
			$(`#${rowData}`).remove();
		});
	}
}


//.............................*Functions to Search User*.....................................................

// for searching a particular row only within current 10 displayed rows on the page.
function search() {

	//making all the rows background to white to display the new search record, if previously searched any
    var rows = $('.border-1');
    for(let j = 0;j < rows.length; j++ ){
        rows.eq(j).css('background','white');
    }

    var name = $("#search-input").val();   //fetching input value provided by user
    var pattern = name.toLowerCase();      //converts fetched value to lowercase
    var targetId = "";                     //will contain the row-id to be highlighted after value matches in a particular row
    
    var divs = $(".search-helper");        //fetch all the cols of all rows which contains name,email and role
    var found = false;                     //if not found on the current page then search will happen from complete user data

    for (let i = 0; i < divs.length; i++) {
       var index = divs.eq(i).text().toLowerCase().indexOf(pattern);  //if text matches with input pattern

       if (index != -1) {
          targetId = divs.eq(i).parent().attr('id');                  //fetch id of parent element(row)
         
          $(`#${targetId}`).css('background','orange');                  //highlight searched row 
          found = true;                                                  //make found flag to true 
       }
    } 

    if(!found)
       searchAllUsers(pattern);  //if not found then search in complete user data and display only that row on the page
 }

//for searching from all the users 
 function searchAllUsers(searchItem){

 	//iterating on each and every key in userData to search for the searchItem
 	for(let i=0;i<userData.length;i++){

 		Object.keys(userData[i]).forEach(function(k){             //iterating on every key of each user  
 			var index = userData[i][k].indexOf(searchItem);       //matching pattern
 			//if pattern matches
 			if(index != -1){                                  
 				$('#user-container').empty();                             //remove all the rows from current page
 				$('#user-container').append(newUserDom(userData[i]));     //append new row with searched data
 				$(`#row-${userData[i].id}`).css('background','orange');   //highlight background
 				
 				//remove nav page-highlighter
 				$('.page-link').css({
 					color: 'blue',
 					backgroundColor: 'white'
 				});

 				return;
 			}
 		});
 	}

 	//add click event to new row
    addCheckboxEvent();
	addDeleteEvent();
}

