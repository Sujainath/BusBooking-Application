const API_BASE_URL = "https://on-time-travels.onrender.com";

const authToken = localStorage.getItem("authToken");
const userRole = localStorage.getItem("userRole");
const adminName = localStorage.getItem("fullName") || "Sujainath";

let currentSection = "overview";
let bookingsCache = [];
let busesCache = [];
let schedulesCache = [];
let activeBusesCache = [];

document.getElementById("currentYear").textContent =
    new Date().getFullYear();

document.getElementById("welcomeName").textContent = adminName;
document.getElementById("sidebarAdminName").textContent = adminName;

if (!authToken || userRole !== "ADMIN") {
    window.location.replace("index.html");
}

const errorMessage = document.getElementById("errorMessage");

// ==========================================
// GENERAL HELPERS
// ==========================================

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = "block";
}

function clearError() {
    errorMessage.textContent = "";
    errorMessage.style.display = "none";
}

function showToast(message, type = "success") {
    let toast = document.getElementById("adminToast");

    if (!toast) {
        toast = document.createElement("div");
        toast.id = "adminToast";
        toast.className = "admin-toast";
        toast.setAttribute("role", "status");
        toast.setAttribute("aria-live", "polite");
        document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.className = `admin-toast ${type} show`;

    if (toast.hideTimer) {
        clearTimeout(toast.hideTimer);
    }

    toast.hideTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}
function showConfirmModal({
    title = "Are you sure?",
    message = "Do you want to continue?",
    confirmText = "Confirm",
    cancelText = "Cancel",
    danger = false
} = {}) {
    return new Promise((resolve) => {
        // Prevent duplicate confirmation popups
        document.getElementById("customConfirmOverlay")?.remove();

        const overlay = document.createElement("div");
        overlay.id = "customConfirmOverlay";

        overlay.style.cssText = `
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.60);
            backdrop-filter: blur(5px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 99999;
            padding: 20px;
        `;

        const modal = document.createElement("div");
        modal.style.cssText = `
            width: 100%;
            max-width: 420px;
            background: #ffffff;
            color: #1f2937;
            border-radius: 16px;
            padding: 26px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.30);
            font-family: Arial, sans-serif;
        `;

        const heading = document.createElement("h3");
        heading.textContent = title;
        heading.style.cssText = `
            margin: 0 0 12px;
            font-size: 21px;
            font-weight: 700;
        `;

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
            padding: 11px 18px;
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
            padding: 11px 18px;
            border: none;
            border-radius: 9px;
            background: ${danger ? "#dc2626" : "#2563eb"};
            color: #ffffff;
            font-weight: 600;
            cursor: pointer;
        `;

        function closeModal(result) {
            document.removeEventListener("keydown", handleKeydown);
            overlay.remove();
            resolve(result);
        }

        function handleKeydown(event) {
            if (event.key === "Escape") {
                closeModal(false);
            }

            if (event.key === "Enter") {
                closeModal(true);
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

        confirmButton.focus();
    });
}

function escapeHtml(value) {
    return String(value ?? "—").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

function formatNumber(value) {
    if (value === null || value === undefined || value === "") {
        return "—";
    }

    const number = Number(value);

    return Number.isFinite(number)
        ? number.toLocaleString("en-IN")
        : String(value);
}

function formatCurrency(value) {
    if (value === null || value === undefined || value === "") {
        return "—";
    }

    const number = Number(value);

    if (!Number.isFinite(number)) {
        return String(value);
    }

    return number.toLocaleString("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2
    });
}

function formatTime(value) {
    if (!value) return "—";
    return String(value).slice(0, 5);
}

function findValue(data, possibleKeys) {
    if (!data || typeof data !== "object") {
        return undefined;
    }

    for (const key of possibleKeys) {
        const match = Object.entries(data).find(
            ([actualKey]) =>
                actualKey.toLowerCase() === key.toLowerCase()
        );

        if (match) return match[1];
    }

    return undefined;
}

function getTodayDate() {
    const today = new Date();

    return [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, "0"),
        String(today.getDate()).padStart(2, "0")
    ].join("-");
}

async function apiRequest(path, method = "GET", body = null) {
    const options = {
        method,
        headers: {
            Authorization: `Bearer ${authToken}`,
            Accept: "application/json"
        }
    };

    if (body !== null) {
        options.headers["Content-Type"] = "application/json";
        options.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE_URL}${path}`, options);
    const responseText = await response.text();

    let data = {};

    try {
        data = responseText ? JSON.parse(responseText) : {};
    } catch {
        data = { message: responseText };
    }

    if (response.status === 401 || response.status === 403) {
        throw new Error(
            "Admin access denied or login expired. Please log in again."
        );
    }

    if (!response.ok) {
        throw new Error(
            data.message ||
            data.error ||
            `Request failed (${response.status}).`
        );
    }

    return data;
}

async function apiGet(path) {
    return apiRequest(path);
}

// ==========================================
// DASHBOARD SUMMARY
// ==========================================

async function loadDashboardSummary() {
    clearError();

    const refreshButton = document.getElementById("refreshButton");
    const originalText = refreshButton.textContent;

    refreshButton.disabled = true;
    refreshButton.textContent = "Loading...";

    try {
        const data = await apiGet("/api/admin/dashboard/summary");

        document.getElementById("totalBookings").textContent =
            formatNumber(findValue(data, [
                "totalBookings",
                "bookingCount",
                "bookings"
            ]));

        document.getElementById("totalUsers").textContent =
            formatNumber(findValue(data, [
                "totalUsers",
                "userCount",
                "users"
            ]));

        document.getElementById("totalBuses").textContent =
            formatNumber(findValue(data, [
                "totalBuses",
                "busCount",
                "buses"
            ]));

        document.getElementById("totalRevenue").textContent =
            formatCurrency(findValue(data, [
                "totalRevenue",
                "revenue",
                "totalBookingAmount"
            ]));
    } catch (error) {
        console.error("Dashboard summary error:", error);
        showError(error.message || "Unable to load dashboard summary.");
    } finally {
        refreshButton.disabled = false;
        refreshButton.textContent = originalText;
    }
}

// ==========================================
// BOOKING MANAGEMENT
// ==========================================

function renderBookings(bookings, limit = null) {
    const content = document.getElementById("detailsContent");

    if (!Array.isArray(bookings)) {
        content.innerHTML = `
            <div class="empty-state">
                Unexpected booking API response.
            </div>
        `;
        return;
    }

    if (bookings.length === 0) {
        content.innerHTML = `
            <div class="empty-state">No bookings found.</div>
        `;
        return;
    }

    const sortedBookings = [...bookings].sort((a, b) =>
        String(b.bookedAt || "").localeCompare(String(a.bookedAt || ""))
    );

    const displayedBookings = limit
        ? sortedBookings.slice(0, limit)
        : sortedBookings;

    const rows = displayedBookings.map(booking => {
        const seats = Array.isArray(booking.seatNumbers)
            ? booking.seatNumbers.join(", ")
            : "—";

        const passengerNames = Array.isArray(booking.passengerNames)
            ? booking.passengerNames.join(", ")
            : booking.customerName || "—";

        const status = String(
            booking.status || "UNKNOWN"
        ).toUpperCase();

        const statusClass = status === "CONFIRMED"
            ? "confirmed"
            : status === "CANCELLED"
                ? "cancelled"
                : "other";

        return `
            <tr>
                <td>${escapeHtml(booking.bookingReference)}</td>

                <td>
                    <strong>${escapeHtml(booking.customerName)}</strong><br>
                    <small>${escapeHtml(booking.customerEmail)}</small>
                </td>

                <td>
                    ${escapeHtml(booking.source)}
                    → ${escapeHtml(booking.destination)}
                </td>

                <td>${escapeHtml(booking.travelDate)}</td>
                <td>${escapeHtml(seats)}</td>
                <td>${escapeHtml(passengerNames)}</td>
                <td>${escapeHtml(formatCurrency(booking.totalAmount))}</td>

                <td>
                    <span class="booking-status ${statusClass}">
                        ${escapeHtml(status)}
                    </span>
                </td>
            </tr>
        `;
    }).join("");

    content.innerHTML = `
        <div class="admin-table-wrap">
            <table class="admin-data-table">
                <thead>
                    <tr>
                        <th>Booking Ref</th>
                        <th>Customer</th>
                        <th>Route</th>
                        <th>Travel Date</th>
                        <th>Seats</th>
                        <th>Passengers</th>
                        <th>Amount</th>
                        <th>Status</th>
                    </tr>
                </thead>

                <tbody>${rows}</tbody>
            </table>
        </div>

        <p class="table-summary">
            Showing ${displayedBookings.length} of ${bookings.length} bookings
        </p>
    `;
}

async function loadBookings(section) {
    const content = document.getElementById("detailsContent");

    content.innerHTML = `
        <div class="empty-state">Loading bookings...</div>
    `;

    try {
        bookingsCache = await apiGet("/api/admin/bookings");

        if (!Array.isArray(bookingsCache)) {
            throw new Error("Booking API did not return a list.");
        }

        if (currentSection !== section) return;

        renderBookings(
            bookingsCache,
            section === "overview" ? 8 : null
        );
    } catch (error) {
        console.error("Booking list error:", error);

        if (currentSection === section) {
            content.innerHTML = `
                <div class="empty-state">
                    <strong>Could not load bookings.</strong>
                    <p>${escapeHtml(error.message)}</p>
                </div>
            `;
        }
    }
}

// ==========================================
// BUS MANAGEMENT
// ==========================================

async function loadBuses() {
    const content = document.getElementById("detailsContent");

    content.innerHTML = `
        <div class="empty-state">Loading buses...</div>
    `;

    try {
        busesCache = await apiGet("/api/admin/buses");

        if (!Array.isArray(busesCache)) {
            throw new Error("Bus API did not return a list.");
        }

        if (currentSection !== "buses") return;

        renderBuses();
    } catch (error) {
        console.error("Bus list error:", error);

        if (currentSection === "buses") {
            content.innerHTML = `
                <div class="empty-state">
                    <strong>Could not load buses.</strong>
                    <p>${escapeHtml(error.message)}</p>
                </div>
            `;
        }
    }
}

function renderBuses() {
    const content = document.getElementById("detailsContent");

    const rows = busesCache.map(bus => {
        const active = bus.active === true;
        const status = active ? "ACTIVE" : "INACTIVE";
        const statusClass = active ? "confirmed" : "cancelled";

        return `
            <tr>
                <td>${escapeHtml(bus.busNumber)}</td>
                <td>${escapeHtml(bus.busName)}</td>
                <td>${escapeHtml(bus.busType)}</td>
                <td>${escapeHtml(bus.registrationNumber)}</td>
                <td>${escapeHtml(formatNumber(bus.totalSeats))}</td>

                <td>
                    <span class="booking-status ${statusClass}">
                        ${status}
                    </span>
                </td>

                <td>
                    <button type="button"
                        class="bus-action-btn edit-bus-btn"
                        data-id="${escapeHtml(bus.id)}">
                        Edit
                    </button>

                    <button type="button"
                        class="bus-action-btn ${
                            active
                                ? "deactivate-bus-btn"
                                : "activate-bus-btn"
                        }"
                        data-id="${escapeHtml(bus.id)}"
                        data-active="${active}">
                        ${active ? "Deactivate" : "Activate"}
                    </button>
                </td>
            </tr>
        `;
    }).join("");

    content.innerHTML = `
        <div class="bus-toolbar">
            <div>
                <strong> ${busesCache.length} registered buses</strong>
                <p>Manage bus details and availability.</p>
            </div>

            <button type="button"
                id="addBusButton"
                class="primary-action-btn">
                + Add Bus
            </button>
        </div>

        <div id="busFormContainer"></div>

        ${
            busesCache.length === 0
                ? `
                    <div class="empty-state">
                        No buses found. Add your first bus.
                    </div>
                `
                : `
                    <div class="admin-table-wrap">
                        <table class="admin-data-table">
                            <thead>
                                <tr>
                                    <th>Bus Number</th>
                                    <th>Bus Name</th>
                                    <th>Bus Type</th>
                                    <th>Registration Number</th>
                                    <th>Total Seats</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>${rows}</tbody>
                        </table>
                    </div>
                `
        }
    `;

    document.getElementById("addBusButton")
        .addEventListener("click", () => renderBusForm());

    content.querySelectorAll(".edit-bus-btn").forEach(button => {
        button.addEventListener("click", () => {
            const bus = busesCache.find(
                item => String(item.id) === button.dataset.id
            );

            if (bus) renderBusForm(bus);
        });
    });

    content.querySelectorAll(
        ".activate-bus-btn, .deactivate-bus-btn"
    ).forEach(button => {
        button.addEventListener("click", async () => {
            const busId = button.dataset.id;
            const currentlyActive = button.dataset.active === "true";
            const nextActive = !currentlyActive;

            const confirmationMessage = nextActive
                ? "Activate this bus?"
                : "Deactivate this bus? It may affect future schedule availability.";

            const confirmed = await showConfirmModal({
    title: nextActive ? "Activate Bus" : "Deactivate Bus",
    message: confirmationMessage,
    confirmText: nextActive ? "Activate" : "Deactivate",
    cancelText: "Cancel"
});

if (!confirmed) return;
            button.disabled = true;

            try {
                await apiRequest(
                    `/api/admin/buses/${encodeURIComponent(busId)}/status?active=${nextActive}`,
                    "PATCH"
                );

                await loadBuses();
                await loadDashboardSummary();

                showToast(
                    nextActive
                        ? "Bus activated successfully!"
                        : "Bus deactivated successfully!",
                    "success"
                );
            } catch (error) {
                console.error("Update bus status error:", error);

                showToast(
                    error.message || "Unable to update bus status.",
                    "error"
                );

                button.disabled = false;
            }
        });
    });
}

function renderBusForm(bus = null) {
    const container = document.getElementById("busFormContainer");
    const editing = Boolean(bus);

    container.innerHTML = `
        <form id="busForm" class="bus-form">
            <h4>${editing ? "Edit Bus" : "Add New Bus"}</h4>

            <div class="bus-form-grid">
                <label>
                    Bus Number
                    <input name="busNumber" required maxlength="30"
                        value="${escapeHtml(editing ? bus.busNumber : "")}"
                        placeholder="Example: OT004">
                </label>

                <label>
                    Bus Name
                    <input name="busName" required maxlength="100"
                        value="${escapeHtml(editing ? bus.busName : "")}"
                        placeholder="Example: On Time Travels">
                </label>

                <label>
                    Bus Type
                    <select name="busType" required>
                        <option value="">Select bus type</option>

                        <option value="AC Sleeper"
                            ${editing && bus.busType === "AC Sleeper" ? "selected" : ""}>
                            AC Sleeper
                        </option>

                        <option value="AC Seater"
                            ${editing && bus.busType === "AC Seater" ? "selected" : ""}>
                            AC Seater
                        </option>

                        <option value="AC Sleeper/Seater"
                            ${editing && bus.busType === "AC Sleeper/Seater" ? "selected" : ""}>
                            AC Sleeper/Seater
                        </option>
                    </select>
                </label>

                <label>
                    Registration Number
                    <input name="registrationNumber" required maxlength="30"
                        value="${escapeHtml(editing ? bus.registrationNumber : "")}"
                        placeholder="Example: KA01AB1234">
                </label>

                <label>
                    Total Seats
                    <input name="totalSeats" type="number"
                        required min="1" max="100"
                        value="${editing ? escapeHtml(bus.totalSeats) : "46"}">
                </label>
            </div>

            ${
                editing
                    ? `
                        <p class="bus-form-message">
                            Keep the current seat count. Changing it requires
                            updating the existing seat records separately.
                        </p>
                    `
                    : ""
            }

            <div class="bus-form-actions">
                <button type="submit" class="primary-action-btn">
                    ${editing ? "Save Changes" : "Add Bus"}
                </button>

                <button type="button"
                    id="cancelBusForm"
                    class="bus-action-btn">
                    Cancel
                </button>
            </div>

            <p id="busFormMessage"
                class="bus-form-message"
                role="status"></p>
        </form>
    `;

    const form = document.getElementById("busForm");

    document.getElementById("cancelBusForm")
        .addEventListener("click", () => {
            container.innerHTML = "";
        });

    form.addEventListener("submit", async event => {
        event.preventDefault();

        const submitButton = form.querySelector(
            'button[type="submit"]'
        );

        const message = document.getElementById("busFormMessage");
        const formData = new FormData(form);

        const busData = {
            busNumber: String(formData.get("busNumber") || "").trim(),
            busName: String(formData.get("busName") || "").trim(),
            busType: String(formData.get("busType") || "").trim(),
            registrationNumber: String(
                formData.get("registrationNumber") || ""
            ).trim(),
            totalSeats: Number(formData.get("totalSeats"))
        };

        if (
            !busData.busNumber ||
            !busData.busName ||
            !busData.busType ||
            !busData.registrationNumber ||
            !Number.isInteger(busData.totalSeats) ||
            busData.totalSeats < 1 ||
            busData.totalSeats > 100
        ) {
            message.textContent = "Please enter valid bus details.";
            return;
        }

        if (
            editing &&
            busData.totalSeats !== Number(bus.totalSeats)
        ) {
            message.textContent =
                "Keep the existing seat count. Update seat records separately before changing it.";

            showToast(
                "Total seat count cannot be changed from this form.",
                "error"
            );

            return;
        }

        submitButton.disabled = true;
        message.textContent = "Saving bus...";

        try {
            if (editing) {
                await apiRequest(
                    `/api/admin/buses/${encodeURIComponent(bus.id)}`,
                    "PUT",
                    busData
                );
            } else {
                await apiRequest(
                    "/api/admin/buses",
                    "POST",
                    busData
                );
            }

            container.innerHTML = "";

            await loadBuses();
            await loadDashboardSummary();

            showToast(
                editing
                    ? "Bus details updated successfully!"
                    : "Bus added successfully!",
                "success"
            );
        } catch (error) {
            console.error("Save bus error:", error);

            message.textContent =
                error.message || "Unable to save bus.";

            showToast(
                error.message || "Unable to save bus.",
                "error"
            );

            submitButton.disabled = false;
        }
    });
}

// ==========================================
// SCHEDULE MANAGEMENT
// ==========================================

async function loadSchedules() {
    const content = document.getElementById("detailsContent");

    content.innerHTML = `
        <div class="empty-state">Loading schedules...</div>
    `;

    try {
        const [schedules, buses] = await Promise.all([
            apiGet("/api/admin/schedules"),
            apiGet("/api/admin/buses")
        ]);

        if (!Array.isArray(schedules) || !Array.isArray(buses)) {
            throw new Error(
                "Schedule or bus API did not return a list."
            );
        }

        schedulesCache = schedules;
        activeBusesCache = buses.filter(bus => bus.active === true);

        if (currentSection !== "schedules") return;

        renderSchedules();
    } catch (error) {
        console.error("Schedule list error:", error);

        if (currentSection === "schedules") {
            content.innerHTML = `
                <div class="empty-state">
                    <strong>Could not load schedules.</strong>
                    <p>${escapeHtml(error.message)}</p>

                    <button type="button"
                        id="retrySchedulesButton"
                        class="primary-action-btn">
                        Retry
                    </button>
                </div>
            `;

            document.getElementById("retrySchedulesButton")
                ?.addEventListener("click", loadSchedules);
        }
    }
}

function renderSchedules() {
    const content = document.getElementById("detailsContent");

    const sortedSchedules = [...schedulesCache].sort((a, b) => {
        const dateCompare = String(a.travelDate || "")
            .localeCompare(String(b.travelDate || ""));

        if (dateCompare !== 0) return dateCompare;

        return String(a.departureTime || "")
            .localeCompare(String(b.departureTime || ""));
    });

    const rows = sortedSchedules.map(schedule => {
        const bus = schedule.bus || {};
        const active = schedule.active === true;

        return `
            <tr>
                <td>
                    ${escapeHtml(
                        bus.busNumber || `Bus #${bus.id || "—"}`
                    )}
                </td>

                <td>
                    ${escapeHtml(schedule.source)}
                    → ${escapeHtml(schedule.destination)}
                </td>

                <td>${escapeHtml(schedule.travelDate)}</td>
                <td>${escapeHtml(formatTime(schedule.departureTime))}</td>
                <td>${escapeHtml(formatTime(schedule.arrivalTime))}</td>

                <td>
                    <span class="booking-status ${
                        active ? "confirmed" : "cancelled"
                    }">
                        ${active ? "ACTIVE" : "INACTIVE"}
                    </span>
                </td>

                <td>
                    <button type="button"
                        class="bus-action-btn edit-schedule-btn"
                        data-id="${escapeHtml(schedule.id)}">
                        Edit
                    </button>

                    <button type="button"
                        class="bus-action-btn ${
                            active
                                ? "deactivate-schedule-btn"
                                : "activate-schedule-btn"
                        }"
                        data-id="${escapeHtml(schedule.id)}"
                        data-active="${active}">
                        ${active ? "Deactivate" : "Activate"}
                    </button>
                </td>
            </tr>
        `;
    }).join("");

    content.innerHTML = `
        <div class="bus-toolbar">
            <div>
                <strong>${schedulesCache.length} schedules</strong>
                <p>Manage routes, travel dates and departure times.</p>
            </div>

            <button type="button"
                id="addScheduleButton"
                class="primary-action-btn">
                + Add Schedule
            </button>
        </div>

        <div id="scheduleFormContainer"></div>

        ${
            schedulesCache.length === 0
                ? `
                    <div class="empty-state">
                        No schedules found. Add your first schedule.
                    </div>
                `
                : `
                    <div class="admin-table-wrap">
                        <table class="admin-data-table">
                            <thead>
                                <tr>
                                    <th>Bus</th>
                                    <th>Route</th>
                                    <th>Travel Date</th>
                                    <th>Departure</th>
                                    <th>Arrival</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>${rows}</tbody>
                        </table>
                    </div>
                `
        }
    `;

    document.getElementById("addScheduleButton")
        .addEventListener("click", () => {
            renderScheduleForm();
        });

    content.querySelectorAll(".edit-schedule-btn")
        .forEach(button => {
            button.addEventListener("click", () => {
                const schedule = schedulesCache.find(
                    item => String(item.id) === button.dataset.id
                );

                if (schedule) renderScheduleForm(schedule);
            });
        });

    content.querySelectorAll(
        ".activate-schedule-btn, .deactivate-schedule-btn"
    ).forEach(button => {
        button.addEventListener("click", async () => {
            const scheduleId = button.dataset.id;
            const nextActive = button.dataset.active !== "true";

            const action = nextActive ? "Activate" : "Deactivate";

           const confirmed = await showConfirmModal({
    title: `${action} Schedule?`,
    message: `Are you sure you want to ${action.toLowerCase()} this schedule?`,
    confirmText: action,
    cancelText: "Cancel",
    danger: !nextActive
});

if (!confirmed) {
    return;
}

            button.disabled = true;

            try {
                await apiRequest(
                    `/api/admin/schedules/${encodeURIComponent(scheduleId)}/status?active=${nextActive}`,
                    "PATCH"
                );

                await loadSchedules();

                showToast(
                    nextActive
                        ? "Schedule activated successfully!"
                        : "Schedule deactivated successfully!",
                    "success"
                );
            } catch (error) {
                console.error("Schedule status update error:", error);

                showToast(
                    error.message || "Unable to update schedule status.",
                    "error"
                );

                button.disabled = false;
            }
        });
    });
}

function renderScheduleForm(schedule = null) {
    const container = document.getElementById("scheduleFormContainer");
    const editing = Boolean(schedule);
    const busId = schedule?.bus?.id ?? "";
    const minDate = getTodayDate();

    if (!editing && activeBusesCache.length === 0) {
        showToast(
            "Add or activate a bus before creating a schedule.",
            "error"
        );
        return;
    }

    const availableBuses = editing
        ? [schedule.bus].filter(Boolean)
        : activeBusesCache;

    const busOptions = availableBuses.map(bus => `
        <option value="${escapeHtml(bus.id)}"
            ${
                String(bus.id) === String(busId)
                    ? "selected"
                    : ""
            }>
            ${escapeHtml(bus.busNumber || `Bus #${bus.id}`)}
            ${
                bus.busName
                    ? ` — ${escapeHtml(bus.busName)}`
                    : ""
            }
        </option>
    `).join("");

    container.innerHTML = `
        <form id="scheduleForm" class="bus-form">
            <h4>${editing ? "Edit Schedule" : "Add New Schedule"}</h4>

            <div class="bus-form-grid">
                <label>
                    Bus
                    <select name="busId" required
                        ${editing ? "disabled" : ""}>
                        <option value="">Select active bus</option>
                        ${busOptions}
                    </select>

                    ${
                        editing
                            ? `
                                <small>
                                    Bus cannot be changed for an existing
                                    schedule.
                                </small>
                            `
                            : ""
                    }
                </label>

                <label>
                    Source
                    <input name="source"
                        required
                        maxlength="100"
                        value="${escapeHtml(schedule?.source || "")}"
                        placeholder="Example: Bangalore">
                </label>

                <label>
                    Destination
                    <input name="destination"
                        required
                        maxlength="100"
                        value="${escapeHtml(schedule?.destination || "")}"
                        placeholder="Example: Chennai">
                </label>

                <label>
                    Travel Date
                    <input name="travelDate"
                        type="date"
                        required
                        min="${minDate}"
                        value="${escapeHtml(schedule?.travelDate || minDate)}">
                </label>

                <label>
                    Departure Time
                    <input name="departureTime"
                        type="time"
                        required
                        value="${escapeHtml(
                            schedule
                                ? formatTime(schedule.departureTime)
                                : "20:00"
                        )}">
                </label>
            </div>

            <p class="bus-form-message">
                Arrival time is calculated automatically as 10 hours
                after departure.
            </p>

            <div class="bus-form-actions">
                <button type="submit" class="primary-action-btn">
                    ${editing ? "Save Changes" : "Create Schedule"}
                </button>

                <button type="button"
                    id="cancelScheduleForm"
                    class="bus-action-btn">
                    Cancel
                </button>
            </div>

            <p id="scheduleFormMessage"
                class="bus-form-message"
                role="status"></p>
        </form>
    `;

    const form = document.getElementById("scheduleForm");
    const message = document.getElementById("scheduleFormMessage");

    document.getElementById("cancelScheduleForm")
        .addEventListener("click", () => {
            container.innerHTML = "";
        });

    form.addEventListener("submit", async event => {
        event.preventDefault();

        const submitButton = form.querySelector(
            'button[type="submit"]'
        );

        const formData = new FormData(form);

        const source = String(
            formData.get("source") || ""
        ).trim();

        const destination = String(
            formData.get("destination") || ""
        ).trim();

        const travelDate = String(
            formData.get("travelDate") || ""
        );

        const departureTime = String(
            formData.get("departureTime") || ""
        );

        const selectedBusId = editing
            ? busId
            : String(formData.get("busId") || "");

        if (!source || !destination) {
            message.textContent =
                "Source and destination are required.";
            return;
        }

        if (
            source.toLowerCase() === destination.toLowerCase()
        ) {
            message.textContent =
                "Source and destination must be different.";
            return;
        }

        if (!travelDate || travelDate < getTodayDate()) {
            message.textContent =
                "Past travel dates are not allowed.";
            return;
        }

        if (!departureTime || !selectedBusId) {
            message.textContent =
                "Please select a bus and departure time.";
            return;
        }

 const payload = {
    bus: {
        id: Number(selectedBusId)
    },
    source,
    destination,
    travelDate,
    departureTime:
        departureTime.length === 5
            ? `${departureTime}:00`
            : departureTime,
    active: true
};


console.log("Schedule payload:", JSON.stringify(payload, null, 2));
        submitButton.disabled = true;
        message.textContent = "Saving schedule...";

        try {
            if (editing) {
                await apiRequest(
                    `/api/admin/schedules/${encodeURIComponent(schedule.id)}`,
                    "PUT",
                    payload
                );
            } else {
                await apiRequest(
                    "/api/admin/schedules",
                    "POST",
                    payload
                );
            }

            container.innerHTML = "";

            await loadSchedules();

            showToast(
                editing
                    ? "Schedule updated successfully!"
                    : "Schedule created successfully!",
                "success"
            );
        } catch (error) {
            console.error("Save schedule error:", error);

            message.textContent =
                error.message || "Unable to save schedule.";

            showToast(
                error.message || "Unable to save schedule.",
                "error"
            );

            submitButton.disabled = false;
        }
    });
}

// ==========================================
// SIDEBAR NAVIGATION
// ==========================================

async function selectSection(section) {
    currentSection = section;

    document.querySelectorAll(".nav-link").forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.section === section
        );
    });

    const titles = {
        overview: {
            title: "Recent Bookings",
            subtitle: "Latest booking records from the system."
        },
        bookings: {
            title: "Booking Management",
            subtitle: "All customer booking records."
        },
        buses: {
            title: "Bus Management",
            subtitle: "Registered buses and bus information."
        },
        schedules: {
            title: "Schedule Management",
            subtitle: "Routes, travel dates and departure schedules."
        },
        users: {
            title: "User Management",
            subtitle: "Registered customer accounts."
        }
    };

    const selected = titles[section] || titles.overview;

    document.getElementById("detailsTitle").textContent =
        selected.title;

    document.getElementById("detailsSubtitle").textContent =
        selected.subtitle;

    const content = document.getElementById("detailsContent");

    if (section === "overview" || section === "bookings") {
        document.getElementById("quickActionsPanel").style.display =
            section === "overview" ? "" : "none";

        await loadBookings(section);
        return;
    }

    if (section === "buses") {
        document.getElementById("quickActionsPanel").style.display =
            "none";

        await loadBuses();
        return;
    }

    if (section === "schedules") {
        document.getElementById("quickActionsPanel").style.display =
            "none";

        await loadSchedules();
        return;
    }

    document.getElementById("quickActionsPanel").style.display =
        "none";

    content.innerHTML = `
        <div class="empty-state">
            <strong>${escapeHtml(selected.title)}</strong>
            <p>User management API integration is the next step.</p>
        </div>
    `;
}

// ==========================================
// EVENT LISTENERS
// ==========================================

document.querySelectorAll(".nav-link").forEach(button => {
    button.addEventListener("click", () => {
        selectSection(button.dataset.section);
    });
});

document.querySelectorAll(".quick-card[data-section]")
    .forEach(button => {
        button.addEventListener("click", () => {
            selectSection(button.dataset.section);
        });
    });

document.getElementById("refreshButton")
    .addEventListener("click", loadDashboardSummary);

document.getElementById("quickRefreshButton")
    .addEventListener("click", async () => {
        await loadDashboardSummary();

        if (
            currentSection === "overview" ||
            currentSection === "bookings"
        ) {
            await loadBookings(currentSection);
        } else if (currentSection === "buses") {
            await loadBuses();
        } else if (currentSection === "schedules") {
            await loadSchedules();
        }
    });

document.getElementById("logoutButton")
    .addEventListener("click", () => {
        [
            "authToken",
            "userId",
            "fullName",
            "userEmail",
            "userRole",
            "token"
        ].forEach(key => localStorage.removeItem(key));

        window.location.replace("index.html");
    });

// ==========================================
// INITIAL LOAD
// ==========================================

if (authToken && userRole === "ADMIN") {
    loadDashboardSummary();
    selectSection("overview");
}
