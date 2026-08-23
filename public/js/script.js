function validateForm()
{
    const name = document.getElementById("name").value.trim();

    const email = document.getElementById("email").value.trim();

    const pass = document.getElementById("password").value;

    const confirmPass =
        document.getElementById("confirmPassword").value;


    const nameErr =
        document.getElementById("name-error");

    const emailErr =
        document.getElementById("email-error");

    const passErr =
        document.getElementById("password-error");

    const confirmPassErr =
        document.getElementById("confirm-password-error");



    nameErr.textContent = "";

    emailErr.textContent = "";

    passErr.textContent = "";

    confirmPassErr.textContent = "";

    confirmPassErr.style.color = "#e74c3c";


    let isValid = true;



    if(name === "" || /\d/.test(name))
    {
        nameErr.textContent =
            "Please enter your name properly.";

        isValid = false;
    }


    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    if(!emailPattern.test(email))
    {
        emailErr.textContent =
            "Please enter a valid email address.";

        isValid = false;
    }




    if(pass === "" || pass.length < 6)
    {
        passErr.textContent =
            "Please enter a password with at least 6 characters.";

        isValid = false;
    }



    if(confirmPass === "")
    {
        confirmPassErr.textContent =
            "Please confirm your password.";

        isValid = false;
    }

    else if(pass !== confirmPass)
    {
        confirmPassErr.textContent =
            "Passwords do not match.";

        isValid = false;
    }



    return isValid;
}



function resetErrors()
{
    document.getElementById("name-error").textContent = "";

    document.getElementById("email-error").textContent = "";

    document.getElementById("password-error").textContent = "";

    document.getElementById("confirm-password-error").textContent = "";


    const backendErrors =
        document.querySelectorAll(".error");


    backendErrors.forEach(err =>
        err.style.display = "none"
    );



    const confirmPassword =
        document.getElementById("confirmPassword");

    if(confirmPassword)
    {
        confirmPassword.style.borderColor = "#dbe2ea";
    }
}



const password =
    document.getElementById("password");

const togglePassword =
    document.getElementById("togglePassword");


if(togglePassword)
{
    togglePassword.addEventListener("click", () =>
    {

        if(password.type === "password")
        {
            password.type = "text";

            togglePassword.classList.remove("fa-eye");

            togglePassword.classList.add("fa-eye-slash");
        }

        else
        {
            password.type = "password";

            togglePassword.classList.remove("fa-eye-slash");

            togglePassword.classList.add("fa-eye");
        }

    });
}



const confirmPassword =
    document.getElementById("confirmPassword");

const toggleConfirmPassword =
    document.getElementById("toggleConfirmPassword");


if(toggleConfirmPassword)
{
    toggleConfirmPassword.addEventListener("click", () =>
    {

        if(confirmPassword.type === "password")
        {
            confirmPassword.type = "text";

            toggleConfirmPassword.classList.remove("fa-eye");

            toggleConfirmPassword.classList.add("fa-eye-slash");
        }

        else
        {
            confirmPassword.type = "password";

            toggleConfirmPassword.classList.remove("fa-eye-slash");

            toggleConfirmPassword.classList.add("fa-eye");
        }

    });
}


if(confirmPassword)
{
    confirmPassword.addEventListener("input", () =>
    {

        const passwordValue =
            password.value;

        const confirmPasswordValue =
            confirmPassword.value;

        const confirmPassErr =
            document.getElementById(
                "confirm-password-error"
            );



        if(confirmPasswordValue === "")
        {
            confirmPassErr.textContent = "";

            confirmPassword.style.borderColor =
                "#dbe2ea";

            return;
        }



        if(passwordValue !== confirmPasswordValue)
        {
            confirmPassErr.textContent =
                "Passwords do not match.";

            confirmPassErr.style.color =
                "#e74c3c";

            confirmPassword.style.borderColor =
                "#ef4444";
        }



        else
        {
            confirmPassErr.textContent =
                "Passwords match.";

            confirmPassErr.style.color =
                "#16a34a";

            confirmPassword.style.borderColor =
                "#16a34a";
        }

    });
}