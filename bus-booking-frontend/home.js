const API_BASE_URL = "http://localhost:8080";

const fromCity = document.getElementById("fromCity");
const toCity = document.getElementById("toCity");
const travelDate = document.getElementById("travelDate");

const searchBtn = document.getElementById("searchBtn");
const swapBtn = document.getElementById("swapBtn");

const resultsSection =
    document.getElementById("resultsSection");

const resultRoute =
    document.getElementById("resultRoute");

const busResults =
    document.getElementById("busResults");

const popup =
    document.getElementById("popup");

const popupMessage =
    document.getElementById("popupMessage");

const logoutBtn =
    document.getElementById("logoutBtn");


// Today's date
const today =
    new Date().toISOString().split("T")[0];

travelDate.min = today;
travelDate.value = today;


// Popup
function showPopup(message) {

    popupMessage.textContent = message;
    popup.classList.add("show");

    setTimeout(() => {
        popup.classList.remove("show");
    }, 3000);
}


// Swap cities
swapBtn.addEventListener("click", () => {

    const from = fromCity.value;
    const to = toCity.value;

    fromCity.value = to;
    toCity.value = from;
});


// Search buses
searchBtn.addEventListener("click", searchBuses);


async function searchBuses() {

    const source = fromCity.value;
    const destination = toCity.value;
    const date = travelDate.value;


    if (!source || !destination || !date) {

        showPopup(
            "Please select departure, destination and travel date."
        );

        return;
    }


    if (source === destination) {

        showPopup(
            "Source and destination cannot be the same."
        );

        return;
    }


    searchBtn.disabled = true;
    searchBtn.textContent = "Searching...";


    busResults.innerHTML = `
        <p class="loading">
            Finding available buses...
        </p>
    `;

    resultsSection.classList.remove("hidden");


    try {

        const response = await fetch(
            `${API_BASE_URL}/api/schedules/search` +
            `?source=${encodeURIComponent(source)}` +
            `&destination=${encodeURIComponent(destination)}` +
            `&travelDate=${date}`
        );


        if (!response.ok) {
            throw new Error("Unable to search buses.");
        }


        const schedules =
            await response.json();


        console.log(
            "Schedules:",
            schedules
        );


        localStorage.setItem(
            "searchSource",
            source
        );

        localStorage.setItem(
            "searchDestination",
            destination
        );

        localStorage.setItem(
            "searchTravelDate",
            date
        );

        localStorage.setItem(
            "searchResults",
            JSON.stringify(schedules)
        );


        resultRoute.textContent =
            `${source} → ${destination}`;


        if (!schedules.length) {

            busResults.innerHTML = `
                <div class="no-results">
                    <h3>No buses available</h3>
                    <p>
                        No buses found for this route and date.
                    </p>
                </div>
            `;

            return;
        }


        busResults.innerHTML = "";


        // Get actual seat availability
        for (const schedule of schedules) {

            const seatResponse =
                await fetch(
                    `${API_BASE_URL}/api/seats/schedule/${schedule.id}`
                );


            if (!seatResponse.ok) {
                throw new Error(
                    "Unable to load seat availability."
                );
            }


            const seats =
                await seatResponse.json();


            const availableSeats =
                seats.filter(
                    seat => seat.available
                ).length;


            createBusCard(
                schedule,
                availableSeats
            );
        }


    } catch (error) {

        console.error(
            "Search error:",
            error
        );


        busResults.innerHTML = `
            <div class="no-results">
                <h3>Something went wrong</h3>
                <p>
                    Unable to load buses. Please try again.
                </p>
            </div>
        `;


    } finally {

        searchBtn.disabled = false;

        searchBtn.innerHTML =
            `Search Buses <span>→</span>`;
    }
}


// Create bus card
function createBusCard(
    schedule,
    availableSeats
) {

    const card =
        document.createElement("div");

    card.className =
        "bus-card";


    const departure =
        formatTime(
            schedule.departureTime
        );

    const arrival =
        formatTime(
            schedule.arrivalTime
        );


    card.innerHTML = `

        <div class="bus-main-info">

            <h3>
                ${schedule.bus.busNumber}
            </h3>

            <p>
                ${schedule.bus.busName}
            </p>

            <span>
                ${schedule.bus.busType}
            </span>

        </div>


        <div class="bus-timing">

            <div>

                <strong>
                    ${departure}
                </strong>

                <span>
                    ${schedule.source}
                </span>

            </div>


            <div class="route-arrow">
                →
            </div>


            <div>

                <strong>
                    ${arrival}
                </strong>

                <span>
                    ${schedule.destination}
                </span>

            </div>

        </div>


        <div class="bus-availability">

            <strong>
                ${availableSeats} seats
            </strong>

            <span>
                ${
                    availableSeats > 0
                        ? "Available"
                        : "Sold Out"
                }
            </span>

        </div>


        <div class="bus-action">

            <button
                type="button"
                class="select-seat-btn"
                ${availableSeats === 0 ? "disabled" : ""}
            >

                ${
                    availableSeats > 0
                        ? "Select Seats →"
                        : "Sold Out"
                }

            </button>

        </div>
    `;


    const selectButton =
        card.querySelector(
            ".select-seat-btn"
        );


    if (availableSeats > 0) {

        selectButton.addEventListener(
            "click",
            () => {

                localStorage.setItem(
                    "selectedScheduleId",
                    schedule.id
                );


                localStorage.setItem(
                    "selectedSchedule",
                    JSON.stringify(schedule)
                );


                window.location.href =
                    "seats.html";
            }
        );
    }


    busResults.appendChild(card);
}


// Format time
function formatTime(time) {

    const [hours, minutes] =
        time.split(":");

    const date =
        new Date();

    date.setHours(
        Number(hours),
        Number(minutes)
    );


    return date.toLocaleTimeString(
        "en-IN",
        {
            hour: "numeric",
            minute: "2-digit"
        }
    );
}


// Logout
logoutBtn.addEventListener(
    "click",
    () => {

        localStorage.clear();

        window.location.href =
            "index.html";
    }
);