// Firebase configuration with only the database URL
var firebaseConfig = {
    databaseURL: "https://teacherattendance-32c32-default-rtdb.firebaseio.com/"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
var database = firebase.database();

// Function to check user login status
function checkUserStatus() {
    var username = sessionStorage.getItem("username");
    var accountType = sessionStorage.getItem("accountType");

    if (username && accountType) {
        if (accountType === "admin") {
            document.getElementById("admin-dashboard").style.display = "block";
            loadAttendanceData();
        } else {
            document.getElementById("teacher-dashboard").style.display = "block";
        }
        document.getElementById("login-page").style.display = "none";
    }
}

// Call the function on page load
checkUserStatus();

// Handle login button click
document.getElementById("login-btn").onclick = function() {
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;

    if (!username || !password) {
        displayError("Please enter username and password.");
        return;
    }

    // Check if the user exists in the database
    database.ref('users/' + username).once('value').then(function(snapshot) {
        if (!snapshot.exists()) {
            displayError("Account does not exist.");
        } else {
            var userData = snapshot.val();
            if (userData.password === password) {
                sessionStorage.setItem("username", username);
                sessionStorage.setItem("accountType", userData.accountType);
                if (userData.accountType === "admin") {
                    document.getElementById("admin-dashboard").style.display = "block";
                    loadAttendanceData();
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

// Handle create account link click
document.getElementById("create-account-link").onclick = function() {
    document.getElementById("login-page").style.display = "none";
    document.getElementById("create-account-page").style.display = "block";
};

// Handle create account button click
document.getElementById("create-account-btn").onclick = function() {
    var newUsername = document.getElementById("new-username").value;
    var newPassword = document.getElementById("new-password").value;
    var newAccountType = document.getElementById("new-account-type").value;

    if (!newUsername || !newPassword) {
        displayError("Please fill in all fields.");
        return;
    }

    // Save user data in the database
    database.ref('users/' + newUsername).set({
        username: newUsername,
        password: newPassword,
        accountType: newAccountType
    }).then(function() {
        alert("Account created! Please log in.");
        document.getElementById("create-account-page").style.display = "none";
        document.getElementById("login-page").style.display = "block";
    }).catch(function(error) {
        displayError("Error creating account: " + error.message);
    });
};

// Handle mark attendance button click
document.getElementById("mark-attendance-btn").onclick = function() {
    document.getElementById("attendance-name").value = sessionStorage.getItem("username");
    document.getElementById("entry-time").value = new Date().toLocaleTimeString();
    document.getElementById("date").value = new Date().toLocaleDateString();
    document.getElementById("attendance-form").style.display = "block";
};

// Handle submit attendance button click
document.getElementById("submit-attendance-btn").onclick = function() {
    var username = sessionStorage.getItem("username");
    var subject = document.getElementById("subject").value;
    var classType = document.getElementById("class").value;
    var exitTime = document.getElementById("exit-time").value;
    var periods = document.getElementById("periods").value;
    var date = new Date().toLocaleDateString();
    var entryTime = document.getElementById("entry-time").value;

    // Save attendance data to the database
    database.ref('attendance/' + date).push({
        username: username,
        subject: subject,
        class: classType,
        entryTime: entryTime,
        exitTime: exitTime,
        periods: periods // Save number of periods here
    }).then(function() {
        alert("Attendance submitted");
        sessionStorage.clear();
        document.getElementById("attendance-form").style.display = "none";
        document.getElementById("login-page").style.display = "block";
    }).catch(function(error) {
        displayError("Error submitting attendance: " + error.message);
    });
};

// Load attendance data for admin and listen for changes
function loadAttendanceData() {
    var date = new Date().toLocaleDateString();
    var tableBody = document.getElementById('attendance-table').getElementsByTagName('tbody')[0];

    // Clear existing data
    tableBody.innerHTML = '';

    // Listen for changes in the attendance data
    database.ref('attendance/' + date).on('value', function(snapshot) {
        tableBody.innerHTML = ''; // Clear existing data
        snapshot.forEach(function(childSnapshot) {
            var data = childSnapshot.val();
            var row = tableBody.insertRow();
            row.insertCell(0).innerText = data.username;
            row.insertCell(1).innerText = date;
            row.insertCell(2).innerText = data.subject;
            row.insertCell(3).innerText = data.class;
            row.insertCell(4).innerText = data.entryTime;
            row.insertCell(5).innerText = data.exitTime;
            row.insertCell(6).innerText = data.periods; // Display the number of periods
        });
    });
}

// Handle print button click
document.getElementById("print-btn").onclick = function() {
    window.print();
};

// Handle logout button click for teacher
document.getElementById("logout-btn-teacher").onclick = function() {
    sessionStorage.clear();
    document.getElementById("teacher-dashboard").style.display = "none";
    document.getElementById("login-page").style.display = "block";
};

// Handle logout button click for admin
document.getElementById("logout-btn-admin").onclick = function() {
    sessionStorage.clear();
    document.getElementById("admin-dashboard").style.display = "none";
    document.getElementById("login-page").style.display = "block";
};

// Display error messages
function displayError(message) {
    var errorMessageDiv = document.getElementById("error-message");
    errorMessageDiv.innerText = message;
    errorMessageDiv.style.display = "block";
}
