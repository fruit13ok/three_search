console.log("Sanity Check: JS is working!");
let backendRoute = new URL("http://localhost:8000/api");

const getScrape = async (backendRoute, formObj) => {
    try {
        const response = await fetch(backendRoute, {
            method: 'POST', // or 'PUT'
            body: JSON.stringify(formObj), // data can be `string` or {object}!
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        console.log('response',response);
        let json = await response.json();
        console.log('json',json);
        let mList = document.getElementById('result-list');
        mList.innerHTML = '';
        let ul = document.createElement('ul');
	    ul.className = 'list-group';
        mList.appendChild(ul);
        for(let i=0; i<json.length; i++){
            let li = document.createElement('li');
	        li.className = 	'list-group-item';
            ul.appendChild(li);
            li.innerHTML += JSON.stringify(json[i])+',';
        }
    }catch (error) {
        console.log(error);
    }
};

// submit button clicked, pass form data into scrape function and invoke it
$(document).ready(function(){
    $("#button1").click(function(){
        let formArr = $("#form1").serializeArray();
        // convert form array of objects to an object of properties
        let formObj = formArr.reduce((map, obj) => {
            map[obj.name] = obj.value;
            return map;
        }, {});
        document.getElementById('result-list').innerHTML = 
        '<p style="color:blue;font-size:46px;"><strong> ... Find related searchs please wait ... </strong></p>';
	    console.log('formObj',formObj);
        getScrape(backendRoute, formObj);
    });
});