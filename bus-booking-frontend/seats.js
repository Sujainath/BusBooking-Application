const API_BASE_URL = "https://on-time-travels.onrender.com";

const scheduleId = localStorage.getItem("selectedScheduleId");

if (!scheduleId) {
    window.location.href = "home.html";
}

const seatPlaceholder =
    document.getElementById("seatPlaceholder");

const seatLayout =
    document.getElementById("seatLayout");

const viewSeatBtn =
    document.getElementById("viewSeatBtn");

const lowerSleeperSeats =
    document.getElementById("lowerSleeperSeats");

const lowerSeaterSeats =
    document.getElementById("lowerSeaterSeats");

const upperSleeperSeats =
    document.getElementById("upperSleeperSeats");

const upperDoubleSleeperSeats =
    document.getElementById("upperDoubleSleeperSeats");

const selectedCount =
    document.getElementById("selectedCount");

const selectedSeatsText =
    document.getElementById("selectedSeats");

const totalFare =
    document.getElementById("totalFare");

const continueBtn =
    document.getElementById("continueBtn");

const popup =
    document.getElementById("popup");

const popupMessage =
    document.getElementById("popupMessage");

const backBtn =
    document.getElementById("backBtn");

let seats = [];
let selectedSeats = [];

const schedule =
    JSON.parse(
        localStorage.getItem("selectedSchedule") || "null"
    );

if (schedule) {

    document.getElementById("routeName").textContent =
        `${schedule.source} → ${schedule.destination}`;

    document.getElementById("busNumber").textContent =
        schedule.bus.busNumber;

    document.getElementById("busType").textContent =
        schedule.bus.busType;

    document.getElementById("travelDateText").textContent =
        formatDate(schedule.travelDate);
}


/* =========================================================
   VIEW SEATS
========================================================= */

viewSeatBtn.addEventListener("click", async () => {

    /*
     * Hide placeholder
     */
    seatPlaceholder.classList.add("hidden");

    /*
     * Show seat layout
     */
    seatLayout.classList.remove("hidden");

    /*
     * Change button text
     */
    viewSeatBtn.textContent =
        "Back to Buses";

    /*
     * Change button action
     */
    viewSeatBtn.onclick =
        () => {

            /*
             * Clear current seat selection
             */
            selectedSeats = [];

            /*
             * Go back to search results
             */
            window.location.href =
                "home.html";
        };

    /*
     * Load seats
     */
    await loadSeats();

    /*
     * Scroll to seat layout
     */
    seatLayout.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
});


/* =========================================================
   LOAD SEATS
========================================================= */

async function loadSeats() {

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/api/seats/schedule/${scheduleId}`
            );

        if (!response.ok) {

            throw new Error(
                "Unable to load seats."
            );
        }

        seats =
            await response.json();

        renderSeats();

    } catch (error) {

        console.error(error);

        showPopup(
            "Unable to load seat layout."
        );
    }
}


/* =========================================================
   RENDER ALL SEATS
========================================================= */

function renderSeats() {

    lowerSleeperSeats.innerHTML = "";
    lowerSeaterSeats.innerHTML = "";
    upperSleeperSeats.innerHTML = "";
    upperDoubleSleeperSeats.innerHTML = "";

    const lowerSleepers =
        seats.filter(
            seat =>
                seat.deck === "LOWER" &&
                seat.seatType === "SINGLE_SLEEPER"
        );

    const lowerSeaters =
        seats.filter(
            seat =>
                seat.deck === "LOWER" &&
                seat.seatType === "SEATER"
        );

    const upperSleepers =
        seats.filter(
            seat =>
                seat.deck === "UPPER" &&
                seat.seatType === "SINGLE_SLEEPER"
        );

    const upperDoubleSleepers =
        seats.filter(
            seat =>
                seat.deck === "UPPER" &&
                seat.seatType === "DOUBLE_SLEEPER"
        );


    lowerSleepers
        .sort(sortSeats)
        .forEach(
            seat => {

                lowerSleeperSeats.appendChild(
                    createSeat(seat)
                );

            }
        );


    lowerSeaters
        .sort(sortSeats)
        .forEach(
            seat => {

                lowerSeaterSeats.appendChild(
                    createSeat(seat)
                );

            }
        );


    upperSleepers
        .sort(sortSeats)
        .forEach(
            seat => {

                upperSleeperSeats.appendChild(
                    createSeat(seat)
                );

            }
        );


    upperDoubleSleepers
        .sort(sortSeats)
        .forEach(
            seat => {

                upperDoubleSleeperSeats.appendChild(
                    createSeat(seat)
                );

            }
        );


    updateSummary();
}


/* =========================================================
   CREATE ONE SEAT
========================================================= */

function createSeat(seat) {

    const box =
        document.createElement("div");

    box.className =
        "seat-box";


    const button =
        document.createElement("button");

    button.type =
        "button";

    button.className =
        "seat";


    /*
     * SEAT TYPE
     */

    if (seat.seatType === "SEATER") {

        button.classList.add(
            "seater"
        );

    } else {

        button.classList.add(
            "sleeper"
        );
    }


    button.dataset.id =
        seat.seatId;

    button.dataset.number =
        seat.seatNumber;


    /*
     * SEAT NUMBER
     */

    const number =
        document.createElement("span");

    number.textContent =
        seat.seatNumber;

    number.className =
        "seat-number";

    button.appendChild(
        number
    );


    /*
     * BOOKED / AVAILABLE
     */

    if (!seat.available) {

        button.classList.add(
            "booked"
        );

        button.disabled =
            true;


        /*
         * FEMALE PASSENGER
         *
         * Only SS and DUB seats
         * get female pink color.
         *
         * LB / UB remain normal red.
         */

        if (
            seat.bookedPassengerGender === "FEMALE" &&
            (
                seat.seatType === "SEATER" ||
                seat.seatType === "DOUBLE_SLEEPER"
            )
        ) {

            button.classList.add(
                "female-passenger"
            );
        }

    } else {

        button.classList.add(
            "available"
        );

        button.addEventListener(
            "click",
            () =>
                selectSeat(
                    seat,
                    button
                )
        );
    }


    /*
     * FARE
     */

    const fare =
        document.createElement("p");

    fare.textContent =
        `₹${seat.fare}`;


    box.appendChild(
        button
    );

    box.appendChild(
        fare
    );

    return box;
}


/* =========================================================
   SELECT / UNSELECT SEAT
========================================================= */

function selectSeat(
    seat,
    button
) {

    const alreadySelected =
        selectedSeats.some(
            item =>
                item.seatId ===
                seat.seatId
        );


    /*
     * UNSELECT
     */

    if (alreadySelected) {

        selectedSeats =
            selectedSeats.filter(
                item =>
                    item.seatId !==
                    seat.seatId
            );

        button.classList.remove(
            "selected"
        );

        button.classList.add(
            "available"
        );

        updateSummary();

        return;
    }


    /*
     * MAXIMUM 6 SEATS
     */

    if (
        selectedSeats.length >= 6
    ) {

        showPopup(
            "You can select maximum 6 seats."
        );

        return;
    }


    /*
     * SELECT
     */

    selectedSeats.push(
        seat
    );

    button.classList.remove(
        "available"
    );

    button.classList.add(
        "selected"
    );

    updateSummary();
}


/* =========================================================
   UPDATE BOOKING SUMMARY
========================================================= */

function updateSummary() {

    selectedCount.textContent =
        `${selectedSeats.length} / 6`;


    if (
        selectedSeats.length === 0
    ) {

        selectedSeatsText.textContent =
            "No seats selected";

        totalFare.textContent =
            "₹0";

        continueBtn.disabled =
            true;

        return;
    }


    selectedSeatsText.textContent =
        selectedSeats
            .map(
                seat =>
                    seat.seatNumber
            )
            .join(", ");


    const total =
        selectedSeats.reduce(
            (
                sum,
                seat
            ) =>
                sum +
                Number(
                    seat.fare
                ),
            0
        );


    totalFare.textContent =
        `₹${total}`;

    continueBtn.disabled =
        false;
}


/* =========================================================
   CONTINUE
========================================================= */

continueBtn.addEventListener(
    "click",
    () => {

        if (
            selectedSeats.length === 0
        ) {

            return;
        }


        localStorage.setItem(
            "selectedSeatIds",
            JSON.stringify(
                selectedSeats.map(
                    seat =>
                        seat.seatId
                )
            )
        );


        localStorage.setItem(
            "selectedSeatData",
            JSON.stringify(
                selectedSeats
            )
        );


        window.location.href =
            "passengerdetails.html";
    }
);


/* =========================================================
   BACK BUTTON
========================================================= */

backBtn.addEventListener(
    "click",
    () => {

        /*
         * If seats are already visible,
         * go back to bus search results.
         */

        if (
            !seatLayout.classList.contains(
                "hidden"
            )
        ) {

            window.location.href =
                "home.html";

            return;
        }


        /*
         * Otherwise normal back
         */

        window.location.href =
            "home.html";
    }
);


/* =========================================================
   SORT SEATS
========================================================= */

function sortSeats(
    a,
    b
) {

    const numberA =
        parseInt(
            a.seatNumber.match(
                /\d+/
            )[0]
        );

    const numberB =
        parseInt(
            b.seatNumber.match(
                /\d+/
            )[0]
        );

    return (
        numberA -
        numberB
    );
}


/* =========================================================
   DATE FORMAT
========================================================= */

function formatDate(
    date
) {

    if (!date) {

        return "";
    }

    const value =
        new Date(
            date
        );

    return value.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
}


/* =========================================================
   POPUP
========================================================= */

function showPopup(
    message
) {

    popupMessage.textContent =
        message;

    popup.classList.add(
        "show"
    );

    setTimeout(
        () => {

            popup.classList.remove(
                "show"
            );

        },
        2500
    );
}
