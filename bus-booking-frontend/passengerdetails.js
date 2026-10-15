const API_URL = "https://on-time-travels.onrender.com";

const token = localStorage.getItem("authToken");

if (!token) {
    window.location.href = "index.html";
}


const selectedSeats =
    JSON.parse(
        localStorage.getItem("selectedSeatData") || "[]"
    );


const scheduleId =
    localStorage.getItem("selectedScheduleId");


const passengerList =
    document.getElementById("passengerList");

const seatCount =
    document.getElementById("seatCount");

const totalFare =
    document.getElementById("totalFare");

const passengerForm =
    document.getElementById("passengerForm");

const journeyText =
    document.getElementById("journeyText");

const backBtn =
    document.getElementById("backBtn");


/* --------------------------------
   CHECK SELECTED SEATS
-------------------------------- */

if (!scheduleId || selectedSeats.length === 0) {

    window.location.href = "home.html";

}


/* --------------------------------
   SHOW BASIC DETAILS
-------------------------------- */

seatCount.textContent =
    selectedSeats.length;


const total =
    selectedSeats.reduce(
        (sum, seat) =>
            sum + Number(seat.fare),
        0
    );


totalFare.textContent =
    `₹${total}`;


/* --------------------------------
   GET JOURNEY DETAILS
-------------------------------- */

const source =
    localStorage.getItem("searchSource") || "";

const destination =
    localStorage.getItem("searchDestination") || "";

const travelDate =
    localStorage.getItem("searchTravelDate") || "";


journeyText.textContent =
    `${source} → ${destination}  •  ${travelDate}`;


/* --------------------------------
   CREATE PASSENGER FORMS
-------------------------------- */

function createPassengerForms() {

    passengerList.innerHTML = "";

    selectedSeats.forEach(
        (seat, index) => {

            const card =
                document.createElement("div");

            card.className =
                "passenger-card";


            card.innerHTML = `

                <div class="passenger-card-header">

                    <div class="passenger-title">

                        <div class="passenger-number">
                            ${index + 1}
                        </div>

                        <h3>
                            Passenger ${index + 1}
                        </h3>

                    </div>

                    <div class="seat-badge">
                        ${seat.seatNumber}
                    </div>

                </div>


                <div class="form-row">

                    <div class="form-group full">

                        <label>
                            PASSENGER NAME
                        </label>

                        <input
                            type="text"
                            class="passenger-name"
                            data-seat-id="${seat.seatId}"
                            placeholder="Enter passenger name"
                            autocomplete="off"
                        >

                    </div>


                    <div class="form-group">

                        <label>
                            GENDER
                        </label>

                        <select
                            class="passenger-gender"
                            data-seat-id="${seat.seatId}"
                        >

                            <option value="">
                                Select gender
                            </option>

                            <option value="MALE">
                                Male
                            </option>

                            <option value="FEMALE">
                                Female
                            </option>

                        </select>

                    </div>


                    <div class="form-group">

                        <label>
                            SEAT
                        </label>

                        <input
                            type="text"
                            value="${seat.seatNumber}"
                            readonly
                        >

                    </div>

                </div>

            `;


            passengerList.appendChild(card);

        }
    );

}


createPassengerForms();


/* --------------------------------
   BACK BUTTON
-------------------------------- */

backBtn.addEventListener(
    "click",
    () => {

        window.location.href =
            "seats.html";

    }
);


/* --------------------------------
   SUBMIT
-------------------------------- */

passengerForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const names =
            document.querySelectorAll(
                ".passenger-name"
            );


        const genders =
            document.querySelectorAll(
                ".passenger-gender"
            );


        const passengers = [];


        /* --------------------------------
           VALIDATE PASSENGER DETAILS
        -------------------------------- */

        for (
            let i = 0;
            i < selectedSeats.length;
            i++
        ) {

            const name =
                names[i].value.trim();

            const gender =
                genders[i].value;


            if (!name) {

                showPopup(
                    `Enter passenger ${i + 1} name.`
                );

                names[i].focus();

                return;
            }


            if (!gender) {

                showPopup(
                    `Select gender for passenger ${i + 1}.`
                );

                genders[i].focus();

                return;
            }


            passengers.push({

                seatId:
                    selectedSeats[i].seatId,

                seatNumber:
                    selectedSeats[i].seatNumber,

                passengerName:
                    name,

                passengerGender:
                    gender,

                fare:
                    selectedSeats[i].fare

            });

        }


        /* --------------------------------
           GENDER VERIFICATION
           
           Restriction applies only when
           exactly ONE seat is selected.
        -------------------------------- */

        if (selectedSeats.length === 1) {

            const allowed =
                await verifyGenderBeforePayment(
                    selectedSeats[0],
                    passengers[0].passengerGender
                );


            if (!allowed) {
                return;
            }
        }


        /* --------------------------------
           SAVE PASSENGER DETAILS
        -------------------------------- */

        localStorage.setItem(
            "passengerDetails",
            JSON.stringify(passengers)
        );


        /* --------------------------------
           NEXT STEP
        -------------------------------- */

        window.location.href =
            "payment.html";

    }
);


/* =========================================================
   FRONTEND GENDER VERIFICATION
========================================================= */

async function verifyGenderBeforePayment(
    selectedSeat,
    passengerGender
) {

    /*
     * LB / UB are single sleepers.
     * No gender restriction.
     */

    if (
        selectedSeat.seatNumber.startsWith("LB") ||
        selectedSeat.seatNumber.startsWith("UB")
    ) {

        return true;
    }


    /*
     * Find the adjacent / paired seat.
     */

    const pairedSeatNumber =
        getPairedSeatNumber(
            selectedSeat.seatNumber
        );


    /*
     * If there is no paired seat,
     * allow booking.
     */

    if (!pairedSeatNumber) {

        return true;
    }


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/api/seats/schedule/${scheduleId}`
            );


        if (!response.ok) {

            showPopup(
                "Unable to verify seat gender. Please try again."
            );

            return false;
        }


        const seats =
            await response.json();


        const pairedSeat =
            seats.find(
                seat =>
                    seat.seatNumber ===
                    pairedSeatNumber
            );


        /*
         * Paired seat does not exist
         * or is available.
         */

        if (
            !pairedSeat ||
            pairedSeat.available
        ) {

            return true;
        }


        /*
         * No gender information.
         */

        if (
            !pairedSeat.bookedPassengerGender
        ) {

            return true;
        }


        /*
         * Same gender -> allow.
         */

        if (
            pairedSeat.bookedPassengerGender ===
            passengerGender
        ) {

            return true;
        }


        /* --------------------------------
           DIFFERENT GENDER
        -------------------------------- */

        const bookedGender =
            pairedSeat.bookedPassengerGender ===
            "FEMALE"
                ? "female"
                : "male";


        showPopup(
            `Gender verification: ${pairedSeatNumber} is occupied by a ${bookedGender} passenger. Please select the same gender.`
        );


        return false;

    } catch (error) {

        console.error(
            "Gender verification error:",
            error
        );


        showPopup(
            "Unable to verify seat gender. Please try again."
        );


        return false;
    }
}


/* =========================================================
   GET PAIRED SEAT
========================================================= */

function getPairedSeatNumber(seatNumber) {

    /*
     * SEATER
     *
     * SS01 <-> SS02
     * SS03 <-> SS04
     * SS05 <-> SS06
     * etc.
     */

    if (
        seatNumber.startsWith("SS")
    ) {

        const number =
            parseInt(
                seatNumber.substring(2),
                10
            );


        if (number % 2 === 1) {

            return (
                "SS" +
                String(number + 1)
                    .padStart(2, "0")
            );

        } else {

            return (
                "SS" +
                String(number - 1)
                    .padStart(2, "0")
            );
        }
    }


    /*
     * DOUBLE SLEEPER
     *
     * DUB01 <-> DUB02
     * DUB03 <-> DUB04
     * DUB05 <-> DUB06
     * etc.
     */

    if (
        seatNumber.startsWith("DUB")
    ) {

        const number =
            parseInt(
                seatNumber.substring(3),
                10
            );


        if (number % 2 === 1) {

            return (
                "DUB" +
                String(number + 1)
                    .padStart(2, "0")
            );

        } else {

            return (
                "DUB" +
                String(number - 1)
                    .padStart(2, "0")
            );
        }
    }


    /*
     * Other seats have no gender
     * adjacency restriction.
     */

    return null;
}


/* --------------------------------
   POPUP
-------------------------------- */

function showPopup(message) {

    const popup =
        document.getElementById("popup");

    const popupMessage =
        document.getElementById("popupMessage");


    popupMessage.textContent =
        message;

    popup.classList.add("show");


    setTimeout(
        () => {

            popup.classList.remove("show");

        },
        3000
    );

}
