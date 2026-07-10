const cl = console.log;
const cardcontainer = document.getElementById('cardcontainer')
const inputform = document.getElementById('inputform')
const title = document.getElementById('title')
const body = document.getElementById('body')
const userId = document.getElementById('userId')
const addpost = document.getElementById('addpost')
const updatepost = document.getElementById('updatepost')
const spinner = document.getElementById('spinner')

let postArr =[]

let Base_url ='https://crud-b-21-default-rtdb.asia-southeast1.firebasedatabase.app'

let post_url = `${Base_url}/posts.json`



function snackbar(msg,icon){
    swal.fire({
        title : msg,
        icon : icon,
        timer : 3000
    })
}

function tooltip(){
    $(function () {
        $('[data-toggle="tooltip"]').tooltip()
    })
}



function getconfirmation(msg){
    return Swal.fire({
        title: msg,
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!"
        })
}


function makeApicall(url,method,body=null){
    spinner.classList.remove('d-none')
    return fetch(url,{
        method : method,
        body : body ? JSON.stringify(body) : null,
        headers : {
            "content-type" : "application/json",
            Auth : "Token"
        }
    })
    .then(res => res.json())
}


makeApicall(post_url,'GET',null)
    .then(data =>{
        for (const key in data) {
            postArr.unshift({...data[key],id:key}) 
        }
        createposts(postArr)  
    })
    .catch(err =>{
        snackbar(err,'error')
    })
    .finally(() =>{
        spinner.classList.add('d-none')
    })

function createposts(arr){
    let result = ''
    arr.forEach(ele =>{
        result +=`<div class="col-md-3 my-4" id =${ele.id}>
					<div class="card h-100">
						<div class="card-header" data-toggle="tooltip" data-placement="top" title="${ele.title}">
							<h2>${ele.title}</h2>
						</div>
						<div class="card-body">
							<p>${ele.body}</p>
						</div>
						<div class="card-footer d-flex justify-content-between">
							<button class="btn btn-primary btn-sm " id="editbtn" onclick='onedit(this)'>Edit</button>
							<button class="btn btn-danger btn-sm " id="deletebtn" onclick='onremove(this)' >Remove</button>

						</div>
					</div>
				</div>`
    })


    cardcontainer.innerHTML =result

    tooltip()
}

function onsubmit(ele){
    spinner.classList.remove('d-none')
    
    ele.preventDefault()

    let newobj = {
        title : title.value,
        body : body.value,
        userId : userId.value,
    }

   makeApicall(post_url,"POST",newobj)
    .then(data => {
        newobj.id = data.name
        addnewcard(newobj)
    })
    .catch(err =>{
        snackbar(err,'error')
    })
    .finally(() =>{
        spinner.classList.add('d-none')
    })
}


function addnewcard(newobj){
    let div = document.createElement('div')
    div.className = 'col-md-3 my-4'
    div.id = newobj.id

    div.innerHTML = `<div class="card h-100">
						<div class="card-header" data-toggle="tooltip" data-placement="top" title="${newobj.title}">
							<h2>${newobj.title}</h2>
						</div>
						<div class="card-body">
							<p>${newobj.body}</p>
						</div>
						<div class="card-footer d-flex justify-content-between">
							<button class="btn btn-primary btn-sm " id="editbtn" onclick='onedit(this)'>Edit</button>
							<button class="btn btn-danger btn-sm " id="deletebtn" onclick='onremove(this)' >Remove</button>

						</div>
					</div>`


    cardcontainer.prepend(div)
    tooltip()
    inputform.reset()
    snackbar(`The New Post id ${newobj.id} is added successfull!!`,'success')
}


function onedit(ele){
    let editId = ele.closest('.col-md-3').id
    localStorage.setItem('EditId',editId)
    let GET_url = `${Base_url}/posts/${editId}.json`

    makeApicall(GET_url,'GET',null)
        .then(data =>{
            title.value = data.title
            body.value = data.body
            userId.value = data.userId

            addpost.classList.add('d-none')
            updatepost.classList.remove('d-none')

            inputform.scrollIntoView({
                behavior : 'smooth',
                block : 'start'
            })

        })
        .catch(err =>{
            snackbar(err,'error')
        })
        .finally(() =>{
            spinner.classList.add('d-none')
        })
}


function onupdate(){
    let updateId = localStorage.getItem('EditId')
    let updateObj ={
        title : title.value,
        body : body.value,
        userId : userId.value,
        id : updateId
    }

    let PUT_url = `${Base_url}/posts/${updateId}.json`

    makeApicall(PUT_url,'PUT',updateObj)
        .then(data=>{
            updateonui(data)
        })
        .catch(err =>{
            snackbar(err,'error')
        })
        .finally(() =>{
            spinner.classList.add('d-none')
        })
   
}

function updateonui(data){
    let div = document.getElementById(data.id)

    div.innerHTML =`<div class="card h-100">
						<div class="card-header" data-toggle="tooltip" data-placement="top" title="${data.title}">
							<h2>${data.title}</h2>
						</div>
						<div class="card-body">
							<p>${data.body}</p>
						</div>
						<div class="card-footer d-flex justify-content-between">
							<button class="btn btn-primary btn-sm " id="editbtn" onclick='onedit(this)'>Edit</button>
							<button class="btn btn-danger btn-sm " id="deletebtn" onclick='onremove(this)' >Remove</button>

						</div>
					</div>`
                    

    inputform.reset()
    addpost.classList.remove('d-none')
    updatepost.classList.add('d-none')
    tooltip()

    div.scrollIntoView({
        behavior : "smooth",
        block : "center"
    })

    div.classList.add('highlight')

    setTimeout(() => {
        div.classList.remove('highlight')
    }, 4000);

}


function onremove(ele){
    let removeId = ele.closest('.col-md-3').id
    getconfirmation(`Are You Sure You Want To Remove Post With Id ${removeId}?`)
        .then((result) => {
        if (result.isConfirmed){
            let removeurl = `${Base_url}/posts/${removeId}.json`

            makeApicall(removeurl,'DELETE',null)
                .then(data =>{
                    document.getElementById(removeId).remove()

                    snackbar(`The Post With Id ${removeId} Is Removed Successfully!`,'success')
                })
                .catch(err =>{
                    snackbar(err,'error')
                })
                .finally(() =>{
                    spinner.classList.add('d-none')
                })
        }
    });

}

inputform.addEventListener('submit',onsubmit)
updatepost.addEventListener('click',onupdate)