var firebaseConfig = {
    databaseURL: "https://teacherattendance-32c32-default-rtdb.firebaseio.com/"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
var database = firebase.database();

// Check for session data and load dashboard
function checkUserStatus() {
    var username = sessionStorage.getItem("username");
    var accountType = sessionStorage.getItem("accountType");

    if (username && accountType) {
        if (accountType === "admin") {
            document.getElementById("admin-dashboard").style.display = "block";
            loadAttendanceData("in");
            loadAttendanceData("out");
            loadSummaryData();
        } else {
            document.getElementById("teacher-dashboard").style.display = "block";
        }
        document.getElementById("login-page").style.display = "none";
    }
}

checkUserStatus();

// Login Functionality
document.getElementById("login-btn").onclick = function() {
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;

    if (!username || !password) {
        displayError("Please enter username and password.");
        return;
    }

    database.ref('users/' + username).once('value').then(function(snapshot) {
        if (!snapshot.exists()) {
            displayError("Account doesn't exist.");
        } else {
            var userData = snapshot.val();
            if (userData.password === password) {
                sessionStorage.setItem("username", username);
                sessionStorage.setItem("accountType", userData.accountType);
                if (userData.accountType === "admin") {
                    document.getElementById("admin-dashboard").style.display = "block";
                    loadAttendanceData("in");
                    loadAttendanceData("out");
                    loadSummaryData();
                } else {
                    document.getElementById("teacher-dashboard").style.display = "block";
                }
                document.getElementById("login-page").style.display = "none";
            } else {
                displayError("Incorrect password.");
            }
        }
    });
};

// Create Account Functionality
document.getElementById("create-account-link").onclick = function() {
    document.getElementById("login-page").style.display = "none";
    document.getElementById("create-account-page").style.display = "block";
};

document.getElementById("create-account-btn").onclick = function() {
    var newUsername = document.getElementById("new-username").value;
    var newPassword = document.getElementById("new-password").value;
    var newAccountType = document.getElementById("new-account-type").value;

    // Check if all fields are filled
    if (!newUsername || !newPassword || !newAccountType) {
        displayError("Please fill in all fields.");
        return;
    }

    // Check if the username already exists in the database
    database.ref('users/' + newUsername).once('value').then(function(snapshot) {
        if (snapshot.exists()) {
            displayError("Account already exists with that username.");
        } else {
            // Create the new user in the database
            database.ref('users/' + newUsername).set({
                username: newUsername,
                password: newPassword,
                accountType: newAccountType
            }).then(function() {
                alert("Account created successfully! You can now log in.");
                document.getElementById("create-account-page").style.display = "none";
                document.getElementById("login-page").style.display = "block";
            }).catch(function(error) {
                displayError("Error creating account: " + error.message);
            });
        }
    });
};

// Mark In/Out Functionality (Teacher)
document.getElementById("mark-in-btn").onclick = function() {
    showMarkInForm();
};

document.getElementById("mark-out-btn").onclick = function() {
    showMarkOutForm();
};

document.getElementById("submit-mark-in-btn").onclick = function() {
    var name = sessionStorage.getItem("username");
    var date = new Date().toLocaleDateString();
    var time = new Date().toLocaleTimeString();
    var subject = document.getElementById("mark-in-subject").value;
    var classTaught = document.getElementById("mark-in-class").value;
    var periods = document.getElementById("mark-in-periods").value;
    var phone = document.getElementById("mark-in-phone").value;

    if (!subject || !classTaught || !periods || !phone) {
        alert("Please fill in all fields.");
        return;
    }

    database.ref("markInSubmissions").push({
        name: name,
        date: date,
        time: time,
        subject: subject,
        classTaught: classTaught,
        periods: periods,
        phone: phone
    });

    alert("Mark In submitted successfully.");
    hideMarkInForm();
};

document.getElementById("submit-mark-out-btn").onclick = function() {
    var name = sessionStorage.getItem("username");
    var date = new Date().toLocaleDateString();
    var time = new Date().toLocaleTimeString();
    var subject = document.getElementById("mark-out-subject").value;
    var classTaught = document.getElementById("mark-out-class").value;
    var periods = document.getElementById("mark-out-periods").value;
    var phone = document.getElementById("mark-out-phone").value;

    if (!subject || !classTaught || !periods || !phone) {
        alert("Please fill in all fields.");
        return;
    }

    database.ref("markOutSubmissions").push({
        name: name,
        date: date,
        time: time,
        subject: subject,
        classTaught: classTaught,
        periods: periods,
        phone: phone
    });

    alert("Mark Out submitted successfully.");
    hideMarkOutForm();
};

// Load attendance data (Admin)
function loadAttendanceData(type) {
    var ref = type === "in" ? "markInSubmissions" : "markOutSubmissions";
    database.ref(ref).once('value').then(function(snapshot) {
        var data = snapshot.val();
        var tableBody = document.querySelector(`#${type === "in" ? "mark-in" : "mark-out"}-table tbody`);
        tableBody.innerHTML = ""; // Clear table first
        for (var key in data) {
            var rowData = data[key];
            var row = document.createElement("tr");
            for (var prop in rowData) {
                var td = document.createElement("td");
                td.textContent = rowData[prop];
                row.appendChild(td);
            }
            tableBody.appendChild(row);
        }
    });
}

// Load summary data (Admin)
function loadSummaryData() {
    // Add summary data loading logic here
}

function displayError(message) {
    var errorDiv = document.getElementById("error-message");
    errorDiv.style.display = "block";
    errorDiv.textContent = message;
}

function showMarkInForm() {
    document.getElementById("mark-in-form").style.display = "block";
}

function hideMarkInForm() {
    document.getElementById("mark-in-form").style.display = "none";
}

function showMarkOutForm() {
    document.getElementById("mark-out-form").style.display = "block";
}

function hideMarkOutForm() {
    document.getElementById("mark-out-form").style.display = "none";
}

// Logout functionality for both Admin and Teacher
document.getElementById("logout-btn-admin").onclick = function() {
    sessionStorage.clear();
    document.getElementById("admin-dashboard").style.display = "none";
    document.getElementById("login-page").style.display = "block";
};

document.getElementById("logout-btn-teacher").onclick = function() {
    sessionStorage.clear();
    document.getElementById("teacher-dashboard").style.display = "none";
    document.getElementById("login-page").style.display = "block";
};

// Print page functionality
function printPage() {
    document.querySelectorAll("button").forEach(button => {
        button.style.display = 'none';
    });
    window.print();
    document.querySelectorAll("button").forEach(button => {
        button.style.display = '';
    });
}

document.getElementById('print-btn').addEventListener('click', printPage);
