loginForm.addEventListener("submit", (e) => {
    let email = document.querySelector("#loginEmail").value;
    let password = document.querySelector("#loginPassword").value;
    console.log("email:" + email);
    console.log("password:" + password);
    // Guard block in case the input is empty
    // Add proper validation later
    if (email === "" || password === "") {
        e.preventDefault();
        console.log("no email and password");
        const errorMessage = document.getElementById("errorMessage");
        errorMessage.innerHTML = "";
        
        if(email === "" ){
            errorMessage.innerHTML += "<div>Please input email</div>";
        }
        if(password === "" ){
            errorMessage.innerHTML += "<div>Please input password</div>";
        }
        
        return errorMessage;
    }
   
});