
const API_BASE_URL = "https://on-time-travels.onrender.com";
/* =========================================
   ELEMENTS
========================================= */

const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

const popup = document.getElementById("popup");
const popupMessage = document.getElementById("popupMessage");

/* =========================================
   POPUP
========================================= */

function showPopup(message) {
    if (!popup || !popupMessage) {
        alert(message);
        return;
    }

    popupMessage.textContent = message;
    popup.classList.add("show");

    setTimeout(() => {
        popup.classList.remove("show");
    }, 2500);
}

/* =========================================
   PASSENGER LOGIN
========================================= */

if (loginForm) {
    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        if (!email) {
            showPopup("Please enter your email address.");
            return;
        }

        if (!password) {
            showPopup("Please enter your password.");
            return;
        }

        const submitButton = loginForm.querySelector(
            'button[type="submit"]'
        );

        if (submitButton) {
            submitButton.disabled = true;
            submitButton.dataset.originalText = submitButton.textContent;
            submitButton.textContent = "Signing in...";
        }

        try {
            const response = await fetch(
                 "https://on-time-travels.onrender.com/api/auth/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email: email,
                        password: password
                    })
                }
            );

            const responseText = await response.text();
            let data = null;

            console.log("Login status:", response.status);
            console.log("Login response:", responseText);

            if (responseText.trim() !== "") {
                try {
                    data = JSON.parse(responseText);
                } catch {
                    data = responseText;
                }
            }

            if (!response.ok) {
                let errorMessage = "Invalid email or password.";

                if (data && typeof data === "object") {
                    errorMessage =
                        data.message || data.error || errorMessage;
                } else if (
                    typeof data === "string" &&
                    data.trim() !== ""
                ) {
                    errorMessage = data;
                }

                throw new Error(errorMessage);
            }

            let token = null;

            if (data && typeof data === "object") {
                token =
                    data.token ||
                    data.authToken ||
                    data.accessToken ||
                    data.jwt;
            }

            if (
                !token &&
                typeof data === "string" &&
                data.trim() !== ""
            ) {
                token = data.trim();
            }

            if (!token) {
                throw new Error(
                    "Login successful, but authentication token was not received."
                );
            }

            localStorage.setItem("authToken", token);

            if (data && data.userId != null) {
                localStorage.setItem("userId", data.userId);
            }

            if (data && data.fullName) {
                localStorage.setItem("fullName", data.fullName);
            }

            if (data && data.email) {
                localStorage.setItem("userEmail", data.email);
            }

            // Mark this session as a passenger session.
            localStorage.setItem("userRole", data.role || "USER");
            localStorage.removeItem("token");

            showPopup("Login successful.");

            setTimeout(() => {
                window.location.replace("home.html");
            }, 800);

        } catch (error) {
            console.error("Login error:", error);

            showPopup(
                error.message || "Login failed. Please try again."
            );

        } finally {
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent =
                    submitButton.dataset.originalText || "Sign in";
            }
        }
    });
}

/* =========================================
   ADMIN LOGIN MODAL ELEMENTS
========================================= */

const adminLoginButton =
    document.getElementById("adminLoginLink");

const adminModal =
    document.getElementById("adminLoginModal");

const adminLoginForm =
    document.getElementById("adminLoginForm");

const closeAdminModalButton =
    document.getElementById("closeAdminModal");

const adminNameInput =
    document.getElementById("adminName");

const adminKeyInput =
    document.getElementById("adminKey");

const adminError =
    document.getElementById("adminLoginError");

const adminSubmitButton =
    document.getElementById("adminSubmitButton");

/* =========================================
   ADMIN MODAL HELPERS
========================================= */

function openAdminModal() {
    if (
        !adminModal ||
        !adminLoginForm ||
        !adminError ||
        !adminNameInput
    ) {
        showPopup("Admin login form is missing from index.html.");
        console.error("Admin modal HTML elements were not found.");
        return;
    }

    adminLoginForm.reset();

    adminError.textContent = "";
    adminError.style.display = "none";

    adminModal.classList.add("show");
    adminNameInput.focus();
}

function closeAdminLoginModal() {
    if (adminModal) {
        adminModal.classList.remove("show");
    }
}

function showAdminError(message) {
    if (!adminError) {
        showPopup(message);
        return;
    }

    adminError.textContent = message;
    adminError.style.display = "block";
}

/* =========================================
   ADMIN LOGIN EVENTS
========================================= */

if (adminLoginButton) {
    adminLoginButton.addEventListener("click", openAdminModal);
}

if (closeAdminModalButton) {
    closeAdminModalButton.addEventListener(
        "click",
        closeAdminLoginModal
    );
}

if (adminModal) {
    adminModal.addEventListener("click", function (event) {
        if (event.target === adminModal) {
            closeAdminLoginModal();
        }
    });
}

document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
        closeAdminLoginModal();
    }
});

/* =========================================
   ADMIN LOGIN API
========================================= */

if (adminLoginForm) {
    adminLoginForm.addEventListener(
        "submit",
        async function (event) {
            event.preventDefault();

            const adminName = adminNameInput.value.trim();
            const adminKey = adminKeyInput.value.trim();

            if (!adminName) {
                showAdminError("Please enter the admin name.");
                return;
            }

            if (!adminKey) {
                showAdminError("Please enter the admin key.");
                return;
            }

            if (!/^\d+$/.test(adminKey)) {
                showAdminError(
                    "Admin key must contain numbers only."
                );
                return;
            }

            if (adminSubmitButton) {
                adminSubmitButton.disabled = true;
                adminSubmitButton.textContent = "Verifying...";
            }

            adminError.textContent = "";
            adminError.style.display = "none";

            try {
                const response = await fetch(
                    `${API_BASE_URL}/api/auth/admin/login`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            adminName: adminName,
                            adminKey: adminKey
                        })
                    }
                );

                const responseText = await response.text();
                let data = {};

                try {
                    data = responseText
                        ? JSON.parse(responseText)
                        : {};
                } catch {
                    data = { message: responseText };
                }

                if (!response.ok) {
                    throw new Error(
                        data.message ||
                        data.error ||
                        "Admin login failed. Please check your details."
                    );
                }

                if (!data.token) {
                    throw new Error(
                        "Authentication token was not received."
                    );
                }

                if (data.role !== "ADMIN") {
                    throw new Error("Admin access denied.");
                }

                // Store the admin session for the dashboard.
                localStorage.setItem("authToken", data.token);

                if (data.userId != null) {
                    localStorage.setItem("userId", data.userId);
                }

                localStorage.setItem("fullName", "Sujainath");
                localStorage.setItem("userEmail", data.email || "");
                localStorage.setItem("userRole", "ADMIN");

                // Remove the legacy token key.
                localStorage.removeItem("token");

                closeAdminLoginModal();

                window.location.replace("admindashboard.html");

            } catch (error) {
                console.error("Admin login error:", error);

                showAdminError(
                    error.message ||
                    "Admin login failed. Please try again."
                );

            } finally {
                if (adminSubmitButton) {
                    adminSubmitButton.disabled = false;
                    adminSubmitButton.textContent =
                        "Login to Dashboard";
                }
            }
        }
    );
}
