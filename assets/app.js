
// =====================================
// STUDENT INFORMATION MANAGEMENT SYSTEM
// =====================================

const STORAGE_KEY = "sims_students_v1";

// SAMPLE STUDENT RECORDS
const sampleStudents = [
    {
        id: "STU-001",
        name: "Juan Dela Cruz",
        course: "BSIT",
        year: "1st Year",
        email: "juan@example.com",
        status: "Enrolled",
        address: ""
    },
    {
        id: "STU-002",
        name: "Maria Santos",
        course: "BSCS",
        year: "2nd Year",
        email: "maria@example.com",
        status: "Enrolled",
        address: ""
    },
    {
        id: "STU-003",
        name: "Carlo Reyes",
        course: "BSA",
        year: "3rd Year",
        email: "carlo@example.com",
        status: "Graduated",
        address: ""
    }
];

// GET STUDENT RECORDS
function getStudents() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);

        return saved === null
            ? sampleStudents.slice()
            : JSON.parse(saved);

    } catch (error) {
        console.error("Unable to read records:", error);
        return [];
    }
}

// SAVE STUDENT RECORDS
function saveStudents(students) {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(students)
    );
}

// PREVENT HTML INJECTION
function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    }[char]));
}

// STATUS CLASS
function statusClass(status) {
    return "status-" + status.toLowerCase().replaceAll(" ", "-");
}

// =====================================
// DASHBOARD
// =====================================

function renderDashboard() {

    const students = getStudents();

    document.getElementById("totalCount").textContent =
        students.length;

    document.getElementById("enrolledCount").textContent =
        students.filter(s => s.status === "Enrolled").length;

    document.getElementById("graduatedCount").textContent =
        students.filter(s => s.status === "Graduated").length;

    const body = document.getElementById("recentStudents");

    body.innerHTML = students.slice(-5).reverse().map(s => `
        <tr>
            <td>${escapeHTML(s.id)}</td>
            <td>${escapeHTML(s.name)}</td>
            <td>${escapeHTML(s.course)}</td>
            <td>
                <span class="badge-status ${statusClass(s.status)}">
                    ${escapeHTML(s.status)}
                </span>
            </td>
        </tr>
    `).join("");

    document.getElementById("recentEmpty")
        .classList.toggle("d-none", students.length !== 0);
}

// =====================================
// REGISTRATION ALERT
// =====================================

function showAlert(message, type = "success") {

    const alert = document.getElementById("formAlert");

    alert.className = `alert alert-${type}`;
    alert.textContent = message;
}

// =====================================
// REGISTER STUDENT
// =====================================

function initRegistration() {

    const form = document.getElementById("studentForm");

    if (!form) return;

    form.addEventListener("submit", function(event) {

        event.preventDefault();
        event.stopPropagation();

        if (!form.checkValidity()) {

            form.classList.add("was-validated");

            showAlert(
                "Please correct the highlighted fields.",
                "danger"
            );

            return;
        }

        const data = new FormData(form);

        const students = getStudents();

        const id = data.get("studentId")
            .trim()
            .toUpperCase();

        // CHECK DUPLICATE ID
        if (students.some(s => s.id.toUpperCase() === id)) {

            document.getElementById("studentId")
                .setCustomValidity("Duplicate ID");

            form.classList.add("was-validated");

            showAlert(
                "That Student ID is already registered.",
                "danger"
            );

            return;
        }

        // CREATE STUDENT OBJECT
        const student = {
            id: id,
            name: data.get("fullName").trim(),
            course: data.get("course"),
            year: data.get("yearLevel"),
            email: data.get("email").trim(),
            status: data.get("status"),
            address: data.get("address").trim()
        };

        // SAVE STUDENT
        students.push(student);

        saveStudents(students);

        form.reset();

        form.classList.remove("was-validated");

        document.getElementById("studentId")
            .setCustomValidity("");

        showAlert(
            `Student ${student.name} was saved successfully.`,
            "success"
        );

    });

    // CLEAR DUPLICATE ID ERROR WHEN USER TYPES
    document.getElementById("studentId")
        .addEventListener("input", function(event) {

            event.target.setCustomValidity("");

        });

    // RESET FORM
    form.addEventListener("reset", function() {

        form.classList.remove("was-validated");

        const alert = document.getElementById("formAlert");

        alert.className = "alert d-none";

    });
}

// =====================================
// MANAGE STUDENTS
// =====================================

function renderStudentTable() {

    const body = document.getElementById("studentTable");

    if (!body) return;

    let students = getStudents();

    const search = document
        .getElementById("studentSearch")
        .value.trim().toLowerCase();

    const course = document
        .getElementById("courseFilter").value;

    const status = document
        .getElementById("statusFilter").value;

    const sort = document
        .getElementById("sortStudents").value;

    // SEARCH AND FILTER
    students = students.filter(s => {

        const matchesSearch =
            !search ||
            [s.name, s.id, s.email, s.course]
                .some(value =>
                    String(value).toLowerCase().includes(search)
                );

        const matchesCourse =
            !course || s.course === course;

        const matchesStatus =
            !status || s.status === status;

        return matchesSearch &&
            matchesCourse &&
            matchesStatus;

    });

    // SORT STUDENTS
    students.sort((a, b) => {

        const fields = {
            name: "name",
            id: "id",
            course: "course",
            year: "year"
        };

        return String(a[fields[sort]])
            .localeCompare(String(b[fields[sort]]));

    });

    // DISPLAY STUDENTS
    body.innerHTML = students.map(s => `

        <tr>

            <td>${escapeHTML(s.id)}</td>

            <td class="fw-semibold">
                ${escapeHTML(s.name)}
            </td>

            <td>${escapeHTML(s.course)}</td>

            <td>${escapeHTML(s.year)}</td>

            <td>${escapeHTML(s.email)}</td>

            <td>
                <span class="badge-status ${statusClass(s.status)}">
                    ${escapeHTML(s.status)}
                </span>
            </td>

            <td class="text-nowrap">

                <button
                    class="btn btn-sm btn-outline-primary me-1"
                    data-edit="${escapeHTML(s.id)}">
                    Edit
                </button>

                <button
                    class="btn btn-sm btn-outline-danger"
                    data-delete="${escapeHTML(s.id)}">
                    Delete
                </button>

            </td>

        </tr>

    `).join("");

    document.getElementById("resultCount").textContent =
        `Showing ${students.length} of ${getStudents().length} students`;

    document.getElementById("tableEmpty")
        .classList.toggle("d-none", students.length !== 0);

}

// =====================================
// INITIALIZE MANAGE PAGE
// =====================================

function initManage() {

    const table = document.getElementById("studentTable");

    if (!table) return;

    // SEARCH
    document.getElementById("studentSearch")
        .addEventListener("input", renderStudentTable);

    // FILTER
    document.getElementById("courseFilter")
        .addEventListener("change", renderStudentTable);

    document.getElementById("statusFilter")
        .addEventListener("change", renderStudentTable);

    // SORT
    document.getElementById("sortStudents")
        .addEventListener("change", renderStudentTable);

    // EDIT AND DELETE
    table.addEventListener("click", function(event) {

        const deleteButton =
            event.target.closest("[data-delete]");

        const editButton =
            event.target.closest("[data-edit]");

        // DELETE STUDENT
        if (deleteButton) {

            const id = deleteButton.dataset.delete;

            if (!confirm(`Delete student ${id}?`)) return;

            const updatedStudents = getStudents()
                .filter(s => s.id !== id);

            saveStudents(updatedStudents);

            renderStudentTable();

        }

        // EDIT STUDENT
        if (editButton) {

            const id = editButton.dataset.edit;

            const students = getStudents();

            const student = students.find(s => s.id === id);

            if (!student) return;

            const name = prompt(
                "Update student name:",
                student.name
            );

            if (name === null) return;

            if (name.trim().length < 3) {

                alert("Name must have at least 3 characters.");

                return;
            }

            const email = prompt(
                "Update student email:",
                student.email
            );

            if (email === null) return;

            const emailPattern =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailPattern.test(email.trim())) {

                alert("Enter a valid email address.");

                return;
            }

            student.name = name.trim();

            student.email = email.trim();

            saveStudents(students);

            renderStudentTable();

        }

    });

    // DELETE ALL STUDENTS
    document.getElementById("clearAll")
        .addEventListener("click", function() {

            if (!getStudents().length) {

                alert("There are no records to delete.");

                return;
            }

            if (confirm("Delete ALL student records?")) {

                saveStudents([]);

                renderStudentTable();

            }

        });

    renderStudentTable();

}

// =====================================
// PAGE INITIALIZATION
// =====================================

document.addEventListener("DOMContentLoaded", function() {

    const page = document.body.dataset.page;

    if (page === "dashboard") {
        renderDashboard();
    }

    if (page === "register") {
        initRegistration();
    }

    if (page === "manage") {
        initManage();
    }

});
