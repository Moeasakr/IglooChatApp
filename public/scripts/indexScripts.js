const usernameForm = document.forms.form;

usernameForm.addEventListener("submit", (e) => {
    let username = document.querySelector("#name").value;
    console.log("Username:" + username);
    // Guard block in case the input is empty
    // Add proper validation later
    if (username === "") return e.preventDefault();
});
