// const usernameForm = document.forms.form;

registerForm.addEventListener("submit", (e) => {
    let name = document.querySelector("#name").value;
    let email = document.querySelector("#email").value;
    let password = document.querySelector("#password").value;
    console.log("Username:" + name);
    console.log("email:" + email);
    console.log("password:" + password);
    // Guard block in case the input is empty
    // Add proper validation later
    if (name === "" || email === "" || password === "") {
        e.preventDefault();
        const errorMessage = document.getElementById("errorMessage");
        errorMessage.innerHTML = "";
        if(name === "" ){
            errorMessage.innerHTML += "<div>Please input name</div>";
        }
        if(email === "" ){
            errorMessage.innerHTML += "<div>Please input email</div>";
        }
        if(password === "" ){
            errorMessage.innerHTML += "<div>Please input password</div>";
        }
        
        return errorMessage;
    }
   
});
