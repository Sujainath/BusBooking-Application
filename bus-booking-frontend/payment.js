const API_BASE_URL = "http://localhost:8080";

const token = localStorage.getItem("authToken");
const userId = localStorage.getItem("userId");

if (!token || !userId) {
    window.location.href = "index.html";
}

const scheduleId =
    localStorage.getItem("selectedScheduleId");

const passengerDetails = JSON.parse(
    localStorage.getItem("passengerDetails") || "[]"
);

const selectedSeatData = JSON.parse(
    localStorage.getItem("selectedSeatData") || "[]"
);

const source =
    localStorage.getItem("searchSource") || "";

const destination =
    localStorage.getItem("searchDestination") || "";

const travelDate =
    localStorage.getItem("searchTravelDate") || "";

const sourceElement =
    document.getElementById("source");

const destinationElement =
    document.getElementById("destination");

const travelDateElement =
    document.getElementById("travelDate");

const selectedSeatsElement =
    document.getElementById("selectedSeats");

const totalAmountElement =
    document.getElementById("totalAmount");

const payNowBtn =
    document.getElementById("payNowBtn");

const backBtn =
    document.getElementById("backBtn");

const paymentPopup =
    document.getElementById("paymentPopup");

const paymentPopupTitle =
    document.getElementById("paymentPopupTitle");

const paymentPopupMessage =
    document.getElementById("paymentPopupMessage");


// ========================================
// PAGE DATA
// ========================================

sourceElement.textContent =
    source || "—";

destinationElement.textContent =
    destination || "—";

travelDateElement.textContent =
    formatDate(travelDate);

selectedSeatsElement.textContent =
    selectedSeatData.length > 0
        ? selectedSeatData
            .map(seat => seat.seatNumber)
            .join(", ")
        : "—";

const totalAmount =
    selectedSeatData.reduce(
        (total, seat) =>
            total + Number(seat.fare || 0),
        0
    );

totalAmountElement.textContent =
    `₹${totalAmount}`;


// ========================================
// BACK BUTTON
// ========================================

backBtn.addEventListener("click", () => {

    window.location.href =
        "passengerdetails.html";

});


// ========================================
// PAY NOW
// ========================================

payNowBtn.addEventListener(
    "click",
    async () => {

        if (payNowBtn.disabled) {
            return;
        }

        if (!scheduleId) {

            showError(
                "Journey information is missing."
            );

            return;
        }

        if (!selectedSeatData.length) {

            showError(
                "No seats selected."
            );

            return;
        }

        if (!passengerDetails.length) {

            showError(
                "Passenger details are missing."
            );

            return;
        }

        if (
            selectedSeatData.length !==
            passengerDetails.length
        ) {

            showError(
                "Passenger details do not match selected seats."
            );

            return;
        }


        payNowBtn.disabled = true;

        payNowBtn.innerHTML =
            "Checking...";


        try {

            // ====================================
            // CREATE BOOKING
            // Gender verification happens here
            // ====================================

            const bookingRequest = {

                userId: Number(userId),

                scheduleId: Number(scheduleId),

                seatIds:
                    selectedSeatData.map(
                        seat =>
                            Number(seat.seatId)
                    ),

                passengerNames:
                    passengerDetails.map(
                        passenger =>
                            passenger.passengerName
                    ),

                passengerGenders:
                    passengerDetails.map(
                        passenger =>
                            passenger.passengerGender
                    )
            };


            console.log(
                "Booking request:",
                bookingRequest
            );


            const bookingResponse =
                await fetch(
                    `${API_BASE_URL}/api/bookings`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",

                            "Authorization":
                                `Bearer ${token}`
                        },

                        body:
                            JSON.stringify(
                                bookingRequest
                            )
                    }
                );


            const bookingText =
                await bookingResponse.text();


            let bookingData = null;


            if (bookingText.trim() !== "") {

                try {

                    bookingData =
                        JSON.parse(
                            bookingText
                        );

                } catch (error) {

                    console.error(
                        "Booking response is not JSON:",
                        bookingText
                    );

                    bookingData =
                        bookingText;
                }
            }


            // ====================================
            // BOOKING / GENDER ERROR
            // ====================================

            if (!bookingResponse.ok) {

                let message =
                    "Unable to create booking.";


                if (
                    bookingData &&
                    typeof bookingData === "object" &&
                    bookingData.message
                ) {

                    message =
                        bookingData.message;

                } else if (
                    typeof bookingData === "string" &&
                    bookingData.trim() !== ""
                ) {

                    message =
                        bookingData;
                }


                throw new Error(message);
            }


            console.log(
                "Booking created:",
                bookingData
            );


            // ====================================
            // CORRECT GENDER
            // NOW START SIMULATED PAYMENT
            // ====================================

            payNowBtn.innerHTML =
                "Processing...";


            showProcessingPopup();


            // 2.5 second simulated payment delay
            await delay(2500);


            // ====================================
            // PAYMENT
            // ====================================

            showPaymentPopup();


            const paymentResponse =
                await fetch(
                    `${API_BASE_URL}/api/payments/${bookingData.id}`,
                    {
                        method: "POST",

                        headers: {
                            "Authorization":
                                `Bearer ${token}`
                        }
                    }
                );


            const paymentText =
                await paymentResponse.text();


            let paymentData = null;


            if (paymentText.trim() !== "") {

                try {

                    paymentData =
                        JSON.parse(
                            paymentText
                        );

                } catch (error) {

                    console.error(
                        "Payment response is not JSON:",
                        paymentText
                    );

                    paymentData =
                        paymentText;
                }
            }


            // ====================================
            // PAYMENT ERROR
            // ====================================

            if (!paymentResponse.ok) {

                let message =
                    "Payment could not be completed.";


                if (
                    paymentData &&
                    typeof paymentData === "object" &&
                    paymentData.message
                ) {

                    message =
                        paymentData.message;

                } else if (
                    typeof paymentData === "string" &&
                    paymentData.trim() !== ""
                ) {

                    message =
                        paymentData;
                }


                throw new Error(message);
            }


            console.log(
                "Payment successful:",
                paymentData
            );


            // ====================================
            // SAVE BOOKING
            // ====================================

            localStorage.setItem(
                "completedBooking",
                JSON.stringify(
                    bookingData
                )
            );


            localStorage.setItem(
                "completedPayment",
                JSON.stringify(
                    paymentData
                )
            );


            // ====================================
            // SUCCESS
            // ====================================

            showSuccessPopup();


            await delay(1200);


            window.location.href =
                "ticket.html";


        } catch (error) {

            console.error(
                "Payment error:",
                error
            );


            hidePaymentPopup();


            // ====================================
            // GENDER ERROR / BOOKING ERROR
            // ====================================

            showError(
                error.message ||
                "Something went wrong. Please try again."
            );


            payNowBtn.disabled = false;


            payNowBtn.innerHTML =
                `Pay Now <span>→</span>`;
        }
    }
);


// ========================================
// POPUP STATES
// ========================================

function showProcessingPopup() {

    paymentPopup.classList.add("show");

    paymentPopupTitle.textContent =
        "Processing payment";

    paymentPopupMessage.textContent =
        "Please wait while we process your payment...";
}


function showPaymentPopup() {

    paymentPopup.classList.add("show");

    paymentPopupTitle.textContent =
        "Completing booking";

    paymentPopupMessage.textContent =
        "Payment successful. Confirming your booking...";
}


function showSuccessPopup() {

    paymentPopup.classList.add("show");

    paymentPopupTitle.textContent =
        "Booking confirmed";

    paymentPopupMessage.textContent =
        "Your payment was successful.";
}


function hidePaymentPopup() {

    paymentPopup.classList.remove(
        "show"
    );
}


function showError(message) {

    paymentPopup.classList.add("show");

    paymentPopupTitle.textContent =
        "Booking cannot continue";

    paymentPopupMessage.textContent =
        message;


    setTimeout(() => {

        paymentPopup.classList.remove(
            "show"
        );

    }, 3500);
}


// ========================================
// HELPERS
// ========================================

function delay(milliseconds) {

    return new Promise(resolve => {

        setTimeout(
            resolve,
            milliseconds
        );

    });
}


function formatDate(date) {

    if (!date) {
        return "—";
    }

    const value =
        new Date(date);


    return value.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
}