const registerForm =
    document.getElementById("registerForm");

const popup =
    document.getElementById("popup");

const popupMessage =
    document.getElementById("popupMessage");

const popupClose =
    document.getElementById("popupClose");


// ==============================
// POPUP
// ==============================

function showPopup(message) {

    if (popupMessage) {
        popupMessage.textContent = message;
    }

    if (popup) {
        popup.classList.add("show");
    }

    setTimeout(() => {

        if (popup) {
            popup.classList.remove("show");
        }

    }, 3000);
}


if (popupClose) {

    popupClose.addEventListener(
        "click",
        () => {

            popup.classList.remove("show");

        }
    );

}


// ==============================
// REGISTER
// ==============================

registerForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        // ==========================
        // GET VALUES
        // ==========================

        const fullName =
            document
                .getElementById("fullName")
                .value
                .trim();


        const email =
            document
                .getElementById("email")
                .value
                .trim();


        const phone =
            document
                .getElementById("phone")
                .value
                .trim();


        const gender =
            document
                .getElementById("gender")
                .value;


        const password =
            document
                .getElementById("password")
                .value;


        const confirmPassword =
            document
                .getElementById("confirmPassword")
                .value;


        // ==========================
        // VALIDATION
        // ==========================

        if (
            !fullName ||
            !email ||
            !phone ||
            !gender ||
            !password ||
            !confirmPassword
        ) {

            showPopup(
                "Please fill in all fields."
            );

            return;
        }


        // ==========================
        // PHONE VALIDATION
        // ==========================

        if (!/^\d{10}$/.test(phone)) {

            showPopup(
                "Please enter a valid 10-digit phone number."
            );

            return;
        }


        // ==========================
        // PASSWORD VALIDATION
        // ==========================

        if (password.length < 6) {

            showPopup(
                "Password must contain at least 6 characters."
            );

            return;
        }


        if (
            password !==
            confirmPassword
        ) {

            showPopup(
                "Passwords do not match."
            );

            return;
        }


        // ==========================
        // BUTTON LOADING
        // ==========================

        const registerButton =
            document.querySelector(
                ".login-btn"
            );


        if (registerButton) {

            registerButton.disabled = true;

            registerButton.textContent =
                "Creating account...";

        }


        try {

            // ==========================
            // BACKEND REQUEST
            // ==========================

            const response =
                await fetch(
                    "http://localhost:8080/api/auth/register",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            fullName:
                                fullName,

                            email:
                                email,

                            phone:
                                phone,

                            /*
                             * Backend User.Gender enum:
                             * MALE / FEMALE
                             */

                            gender:
                                gender.toUpperCase(),

                            password:
                                password

                        })
                    }
                );


            // ==========================
            // IMPORTANT
            // DO NOT USE response.json()
            // DIRECTLY
            // ==========================

            const responseText =
                await response.text();


            console.log(
                "Register status:",
                response.status
            );


            console.log(
                "Register response:",
                responseText
            );


            let data = null;


            // ==========================
            // PARSE ONLY IF BODY EXISTS
            // ==========================

            if (
                responseText &&
                responseText.trim() !== ""
            ) {

                try {

                    data =
                        JSON.parse(
                            responseText
                        );

                } catch (jsonError) {

                    console.warn(
                        "Response is not JSON."
                    );

                    data =
                        responseText;

                }

            }


            // ==========================
            // ERROR
            // ==========================

            if (!response.ok) {

                let errorMessage =
                    "Registration failed.";


                if (
                    data &&
                    typeof data === "object"
                ) {

                    errorMessage =
                        data.message ||
                        data.error ||
                        "Registration failed.";

                }


                if (
                    typeof data === "string" &&
                    data.trim() !== ""
                ) {

                    errorMessage =
                        data;

                }


                throw new Error(
                    errorMessage
                );
            }


            // ==========================
            // SUCCESS
            // ==========================

            showPopup(
                "Account created successfully."
            );


            // ==========================
            // RESET FORM
            // ==========================

            registerForm.reset();


            // ==========================
            // GO TO LOGIN
            // ==========================

            setTimeout(() => {

                window.location.href =
                    "index.html";

            }, 1500);


        } catch (error) {

            console.error(
                "Registration error:",
                error
            );


            showPopup(
                error.message ||
                "Unable to create account."
            );


        } finally {

            if (registerButton) {

                registerButton.disabled =
                    false;

                registerButton.textContent =
                    "Create Account";

            }

        }

    }
);
