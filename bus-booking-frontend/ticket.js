const API_URL = "https://on-time-travels.onrender.com";

const token = localStorage.getItem("authToken");

if (!token) {
    window.location.href = "index.html";
}

const booking = JSON.parse(
    localStorage.getItem("completedBooking") || "null"
);

const payment = JSON.parse(
    localStorage.getItem("completedPayment") || "null"
);

const passengerDetails = JSON.parse(
    localStorage.getItem("passengerDetails") || "[]"
);

const schedule = JSON.parse(
    localStorage.getItem("selectedSchedule") || "null"
);

const popup = document.getElementById("popup");
const popupMessage = document.getElementById("popupMessage");

const homeBtn = document.getElementById("homeBtn");
const downloadBtn = document.getElementById("downloadBtn");
const cancelBtn = document.getElementById("cancelBtn");

if (!booking || !payment || !schedule) {
    showPopup("Booking information is missing.");

    setTimeout(() => {
        window.location.href = "home.html";
    }, 2000);
} else {

    loadTicket();
}


/* ========================================
   LOAD TICKET
======================================== */

function loadTicket() {

    document.getElementById("bookingReference").textContent =
        booking.bookingReference || "—";


    document.getElementById("source").textContent =
        schedule.source || "—";


    document.getElementById("destination").textContent =
        schedule.destination || "—";


    document.getElementById("departureTime").textContent =
        formatTime(schedule.departureTime);


    document.getElementById("arrivalTime").textContent =
        formatTime(schedule.arrivalTime);


    document.getElementById("travelDate").textContent =
        formatDate(schedule.travelDate);


    document.getElementById("busNumber").textContent =
        schedule.bus?.busNumber || "—";


    document.getElementById("busType").textContent =
        schedule.bus?.busType || "—";


    document.getElementById("bookingStatus").textContent =
        booking.status || "CONFIRMED";


    document.getElementById("seatNumbers").textContent =
        passengerDetails.length > 0
            ? passengerDetails
                .map(passenger => passenger.seatNumber)
                .join(", ")
            : "—";


    document.getElementById("totalAmount").textContent =
        `₹${booking.totalAmount || 0}`;


    document.getElementById("paymentReference").textContent =
        payment.paymentReference || "—";


    renderPassengers();
}


/* ========================================
   PASSENGERS
======================================== */

function renderPassengers() {

    const passengerList =
        document.getElementById("passengerList");

    passengerList.innerHTML = "";


    passengerDetails.forEach(
        (passenger, index) => {

            const row =
                document.createElement("div");

            row.className =
                "passenger-row";


            row.innerHTML = `
                <div class="passenger-number">
                    ${index + 1}
                </div>

                <div class="passenger-info">
                    <span>PASSENGER</span>
                    <strong>
                        ${escapeHtml(
                            passenger.passengerName
                        )}
                    </strong>
                </div>

                <div class="passenger-seat">
                    <span>SEAT</span>
                    <strong>
                        ${escapeHtml(
                            passenger.seatNumber
                        )}
                    </strong>
                </div>

                <div class="passenger-gender">
                    <span>GENDER</span>
                    <strong>
                        ${escapeHtml(
                            passenger.passengerGender
                        )}
                    </strong>
                </div>
            `;


            passengerList.appendChild(row);
        }
    );
}


/* ========================================
   DOWNLOAD TICKET
======================================== */

/* ========================================
   DOWNLOAD TICKET AS PDF
======================================== */

downloadBtn.addEventListener(
    "click",
    async () => {

        if (!booking || !payment || !schedule) {

            showPopup(
                "Ticket information is missing."
            );

            return;
        }

        const ticketCard =
            document.querySelector(".ticket-card");

        if (!ticketCard) {

            showPopup(
                "Unable to create ticket PDF."
            );

            return;
        }

        downloadBtn.disabled = true;

        const originalText =
            downloadBtn.textContent;

        downloadBtn.textContent =
            "Downloading...";

        try {

            const bookingReference =
                booking.bookingReference ||
                "ticket";

            const options = {

                margin: 0,

                filename:
                    `On-Time-Travels-${bookingReference}.pdf`,

                image: {
                    type: "jpeg",
                    quality: 0.98
                },

                html2canvas: {
                    scale: 2,
                    useCORS: true,
                    backgroundColor: "#ffffff"
                },

                jsPDF: {
                    unit: "mm",
                    format: "a4",
                    orientation: "portrait"
                }
            };


            await html2pdf()
                .set(options)
                .from(ticketCard)
                .save();


        } catch (error) {

            console.error(
                "PDF download error:",
                error
            );

            showPopup(
                "Unable to download ticket PDF."
            );

        } finally {

            downloadBtn.disabled = false;

            downloadBtn.textContent =
                originalText;
        }
    }
);


/* ========================================
   HOME
======================================== */

homeBtn.addEventListener(
    "click",
    () => {

        window.location.href =
            "home.html";

    }
);


/* ========================================
   CANCEL BOOKING
======================================== */

cancelBtn.addEventListener(
    "click",
    async () => {

        if (!booking || !booking.id) {
            showPopup(
                "Booking information is missing."
            );
            return;
        }


        const departureDateTime =
            getDepartureDateTime();


        const now = new Date();


        if (
            departureDateTime &&
            departureDateTime.getTime() -
            now.getTime()
            <= 8 * 60 * 60 * 1000
        ) {

            showPopup(
                "Cancellation is allowed only until 8 hours before departure."
            );

            return;
        }


       const confirmed = await showConfirmModal({
    title: "Cancel Booking?",
    message: "Are you sure you want to cancel this booking? A 10% cancellation fee will be deducted from your refund.",
    confirmText: "Cancel Booking",
    cancelText: "Keep Booking",
    danger: true
});


        if (!confirmed) {
            return;
        }


        cancelBtn.disabled = true;

        cancelBtn.textContent =
            "Cancelling...";


        try {

            const response =
                await fetch(
                    `${API_BASE_URL}/api/cancellations/${booking.id}`,
                    {
                        method: "POST",

                        headers: {
                            "Authorization":
                                `Bearer ${token}`
                        }
                    }
                );


            const responseText =
                await response.text();


            let data = null;


            if (responseText.trim() !== "") {

                try {

                    data =
                        JSON.parse(
                            responseText
                        );

                } catch (error) {

                    data =
                        responseText;
                }
            }


            if (!response.ok) {

                let message =
                    "Unable to cancel booking.";

                if (
                    data &&
                    typeof data === "object" &&
                    data.message
                ) {

                    message =
                        data.message;

                } else if (
                    typeof data === "string" &&
                    data.trim() !== ""
                ) {

                    message =
                        data;
                }

                throw new Error(message);
            }


            showPopup(
                "Booking cancelled successfully."
            );


            booking.status =
                "CANCELLED";


            localStorage.setItem(
                "completedBooking",
                JSON.stringify(booking)
            );


            document.getElementById(
                "bookingStatus"
            ).textContent =
                "CANCELLED";


            cancelBtn.disabled = true;

            cancelBtn.textContent =
                "Booking Cancelled";


            setTimeout(() => {

                window.location.href =
                    "home.html";

            }, 1800);


        } catch (error) {

            console.error(
                "Cancellation error:",
                error
            );


            showPopup(
                error.message ||
                "Unable to cancel booking."
            );


            cancelBtn.disabled = false;

            cancelBtn.textContent =
                "Cancel Booking";
        }
    }
);


/* ========================================
   DEPARTURE DATE + TIME
======================================== */

function getDepartureDateTime() {

    if (
        !schedule ||
        !schedule.travelDate ||
        !schedule.departureTime
    ) {

        return null;
    }


    const date =
        schedule.travelDate;


    const time =
        schedule.departureTime;


    const value =
        new Date(
            `${date}T${time}`
        );


    if (
        Number.isNaN(
            value.getTime()
        )
    ) {

        return null;
    }


    return value;
}


/* ========================================
   FORMAT TIME
======================================== */

function formatTime(time) {

    if (!time) {
        return "—";
    }


    const parts =
        time.split(":");


    const hours =
        Number(parts[0]);


    const minutes =
        Number(parts[1]);


    const value =
        new Date();


    value.setHours(
        hours,
        minutes,
        0,
        0
    );


    return value.toLocaleTimeString(
        "en-IN",
        {
            hour: "numeric",
            minute: "2-digit"
        }
    );
}


/* ========================================
   FORMAT DATE
======================================== */

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


/* ========================================
   HTML ESCAPE
======================================== */

function escapeHtml(value) {

    if (value === null || value === undefined) {
        return "";
    }


    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}
function showConfirmModal({
    title = "Are you sure?",
    message = "Do you want to continue?",
    confirmText = "Confirm",
    cancelText = "Cancel",
    danger = false
} = {}) {
    return new Promise((resolve) => {
        document.getElementById("ticketConfirmOverlay")?.remove();

        const overlay = document.createElement("div");
        overlay.id = "ticketConfirmOverlay";
        overlay.style.cssText = `
            position: fixed;
            inset: 0;
            z-index: 99999;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            background: rgba(0, 0, 0, 0.65);
            backdrop-filter: blur(5px);
        `;

        const modal = document.createElement("div");
        modal.setAttribute("role", "dialog");
        modal.setAttribute("aria-modal", "true");
        modal.style.cssText = `
            width: 100%;
            max-width: 430px;
            box-sizing: border-box;
            padding: 26px;
            border-radius: 16px;
            background: #fff;
            color: #1f2937;
            box-shadow: 0 20px 60px rgba(0,0,0,.3);
            font-family: Arial, sans-serif;
        `;

        const heading = document.createElement("h3");
        heading.textContent = title;
        heading.style.cssText =
            "margin:0 0 12px;font-size:22px;";

        const description = document.createElement("p");
        description.textContent = message;
        description.style.cssText = `
            margin: 0 0 24px;
            color: #64748b;
            font-size: 15px;
            line-height: 1.6;
        `;

        const actions = document.createElement("div");
        actions.style.cssText = `
            display: flex;
            justify-content: flex-end;
            gap: 12px;
            flex-wrap: wrap;
        `;

        const cancelButton = document.createElement("button");
        cancelButton.type = "button";
        cancelButton.textContent = cancelText;
        cancelButton.style.cssText = `
            padding: 11px 16px;
            border: 1px solid #d1d5db;
            border-radius: 9px;
            background: #f3f4f6;
            color: #374151;
            font-weight: 600;
            cursor: pointer;
        `;

        const confirmButton = document.createElement("button");
        confirmButton.type = "button";
        confirmButton.textContent = confirmText;
        confirmButton.style.cssText = `
            padding: 11px 16px;
            border: none;
            border-radius: 9px;
            background: ${danger ? "#dc2626" : "#2563eb"};
            color: white;
            font-weight: 600;
            cursor: pointer;
        `;

        let closed = false;

        function closeModal(result) {
            if (closed) return;
            closed = true;
            document.removeEventListener("keydown", handleKeydown);
            overlay.remove();
            resolve(result);
        }

        function handleKeydown(event) {
            if (event.key === "Escape") {
                closeModal(false);
            }
        }

        cancelButton.addEventListener("click", () => closeModal(false));
        confirmButton.addEventListener("click", () => closeModal(true));

        overlay.addEventListener("click", (event) => {
            if (event.target === overlay) {
                closeModal(false);
            }
        });

        actions.append(cancelButton, confirmButton);
        modal.append(heading, description, actions);
        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        document.addEventListener("keydown", handleKeydown);
        cancelButton.focus();
    });
}


/* ========================================
   POPUP
======================================== */

function showPopup(message) {

    popupMessage.textContent =
        message;

    popup.classList.add("show");


    setTimeout(() => {

        popup.classList.remove("show");

    }, 3000);
}
