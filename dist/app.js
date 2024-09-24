var firebaseConfig = {
    databaseURL: "https://teacherattendance-32c32-default-rtdb.firebaseio.com/"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
var database = firebase.database();

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

document.getElementById("create-account-link").onclick = function() {
    document.getElementById("login-page").style.display = "none";
    document.getElementById("create-account-page").style.display = "block";
};

document.getElementById("create-account-btn").onclick = function() {
    var newUsername = document.getElementById("new-username").value;
    var newPassword = document.getElementById("new-password").value;
    var newAccountType = document.getElementById("new-account-type").value;

    if (!newUsername || !newPassword) {
        displayError("Please fill in all fields.");
        return;
    }

    // Check if user already exists
    database.ref('users/' + newUsername).once('value').then(function(snapshot) {
        if (snapshot.exists()) {
            displayError("Account already exists.");
        } else {
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
        }
    });
};

document.getElementById("mark-in-btn").onclick = function() {
    document.getElementById("mark-in-name").value = sessionStorage.getItem("username");
    document.getElementById("mark-in-date").value = new Date().toLocaleDateString();
    document.getElementById("mark-in-time").value = new Date().toLocaleTimeString();
    document.getElementById("mark-in-form").style.display = "block";
};

document.getElementById("submit-mark-in-btn").onclick = function() {
    var username = sessionStorage.getItem("username");
    var subject = document.getElementById("mark-in-subject").value;
    var classType = document.getElementById("mark-in-class").value;
    var periods = document.getElementById("mark-in-periods").value;
    var phone = document.getElementById("mark-in-phone").value;
    var date = new Date().toLocaleDateString();
    var entryTime = new Date().toLocaleTimeString();

    // Save mark in data to the database
    database.ref('attendance/in/' + date + '/' + username).set({
        username: username,
        subject: subject,
        class: classType,
        entryTime: entryTime,
        periods: periods,
        phone: phone
    }).then(function() {
        alert("Mark In submitted");
        document.getElementById("mark-in-form").style.display = "none";
    }).catch(function(error) {
        displayError("Error submitting Mark In: " + error.message);
    });
};

document.getElementById("mark-out-btn").onclick = function() {
    document.getElementById("mark-out-name").value = sessionStorage.getItem("username");
    document.getElementById("mark-out-date").value = new Date().toLocaleDateString();
    document.getElementById("mark-out-time").value = new Date().toLocaleTimeString();
    document.getElementById("mark-out-form").style.display = "block";
};

document.getElementById("submit-mark-out-btn").onclick = function() {
    var username = sessionStorage.getItem("username");
    var subject = document.getElementById("mark-out-subject").value;
    var classType = document.getElementById("mark-out-class").value;
    var periods = document.getElementById("mark-out-periods").value;
    var phone = document.getElementById("mark-out-phone").value;
    var date = new Date().toLocaleDateString();
    var exitTime = new Date().toLocaleTimeString();

    // Save mark out data to the database
    database.ref('attendance/out/' + date + '/' + username).set({
        username: username,
        subject: subject,
        class: classType,
        exitTime: exitTime,
        periods: periods,
        phone: phone
    }).then(function() {
        alert("Mark Out submitted");
        document.getElementById("mark-out-form").style.display = "none";
    }).catch(function(error) {
        displayError("Error submitting Mark Out: " + error.message);
    });
};

document.getElementById("logout-btn-teacher").onclick = function() {
    sessionStorage.clear();
    document.getElementById("teacher-dashboard").style.display = "none";
    document.getElementById("login-page").style.display = "block";
};

document.getElementById("logout-btn-admin").onclick = function() {
    sessionStorage.clear();
    document.getElementById("admin-dashboard").style.display = "none";
    document.getElementById("login-page").style.display = "block";
};

function displayError(message) {
    var errorMessageDiv = document.getElementById("error-message");
    errorMessageDiv.innerText = message;
    errorMessageDiv.style.display = "block";
}

// Load attendance data for admin
function loadAttendanceData(type) {
    var date = new Date().toLocaleDateString();
    var tableBody = (type === "in") ? document.getElementById('mark-in-table').getElementsByTagName('tbody')[0] : document.getElementById('mark-out-table').getElementsByTagName('tbody')[0];

    // Clear existing data
    tableBody.innerHTML = '';

    // Load data from Firebase
    database.ref('attendance/' + type + '/' + date).once('value').then(function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
            var data = childSnapshot.val();
            var row = tableBody.insertRow();
            row.insertCell(0).innerText = data.username;
            row.insertCell(1).innerText = date;
            row.insertCell(2).innerText = (type === "in") ? data.entryTime : data.exitTime;
            row.insertCell(3).innerText = data.subject;
            row.insertCell(4).innerText = data.class;
            row.insertCell(5).innerText = data.periods;
            row.insertCell(6).innerText = data.phone;
        });
    });
}

// Load summary data for admin
function loadSummaryData() {
    var date = new Date().toLocaleDateString();
    var summaryTableBody = document.getElementById('summary-table').getElementsByTagName('tbody')[0];

    summaryTableBody.innerHTML = '';

    database.ref('attendance/in/' + date).once('value').then(function(inSnapshot) {
        var inData = {};
        inSnapshot.forEach(function(childSnapshot) {
            var data = childSnapshot.val();
            if (!inData[data.username]) {
                inData[data.username] = { totalTime: 0, classes: {} };
            }
            inData[data.username].classes[data.class] = { entryTime: data.entryTime, periods: data.periods };
        });

        database.ref('attendance/out/' + date).once('value').then(function(outSnapshot) {
            outSnapshot.forEach(function(childSnapshot) {
                var data = childSnapshot.val();
                if (inData[data.username]) {
                    var entryTime = inData[data.username].classes[data.class]?.entryTime;
                    if (entryTime) {
                        var entryDateTime = new Date(date + ' ' + entryTime);
                        var exitDateTime = new Date(date + ' ' + data.exitTime);
                        var timeTaught = (exitDateTime - entryDateTime) / 60000; // Time in minutes
                        inData[data.username].totalTime += timeTaught;
                    }
                }
            });

            for (var username in inData) {
                var summaryRow = summaryTableBody.insertRow();
                summaryRow.insertCell(0).innerText = username;
                summaryRow.insertCell(1).innerText = `${inData[username].totalTime} minutes`;
            }
        });
    });
}

document.getElementById("print-btn").onclick = function() {
    window.print();
};
