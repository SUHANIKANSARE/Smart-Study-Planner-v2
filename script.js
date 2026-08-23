import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";

const firebaseConfig = {
    apiKey: "AIzaSyB2FlkeqOusow8qNq9-zeR7erf3kpI1gAU",
    authDomain: "smart-study-planner-5f723.firebaseapp.com",
    projectId: "smart-study-planner-5f723",
    storageBucket: "smart-study-planner-5f723.firebasestorage.app",
    messagingSenderId: "1092762116428",
    appId: "1:1092762116428:web:69ac50ece80d7da382efe9"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");

// ===============================
// ADD NEW SUBJECT
// ===============================

const addSubjectBtn = document.getElementById("addSubjectBtn");

addSubjectBtn.addEventListener("click", async function () {

    const subjectName = prompt("📚 Enter subject name:");

    if (!subjectName || subjectName.trim() === "") {
        return;
    }

    const subject = subjectName.trim();

    try {

        // Save subject to Firebase
        const docRef = await addDoc(collection(db, "subjects"), {
            name: subject,
            createdAt: new Date().toISOString()
        });

        // Create subject card on website
        const subjectCard = document.createElement("div");
        subjectCard.className = "subject-card";

        subjectCard.innerHTML = `
            <h3>📚 ${subject}</h3>
            <p>Your study subject.</p>
            <button class="delete-subject-btn">❌ Delete</button>
`       ;
subjectCard.addEventListener("click", function () {
    openSubject(subject);
});

        // Delete subject button
        const deleteSubjectBtn =
            subjectCard.querySelector(".delete-subject-btn");

        deleteSubjectBtn.addEventListener("click", async function (event) {
            event.stopPropagation();

            const confirmDelete = confirm(
                "Are you sure you want to delete " + subject + "?"
             );

             if (!confirmDelete) {
                 return;
             }

             try {
                 await deleteDoc(doc(db, "subjects", docRef.id));

                 subjectCard.remove();

                 alert("✅ " + subject + " deleted successfully!");

            } catch (error) {
                console.error("Error deleting subject:", error);
                alert("❌ Subject delete करता आला नाही.");
            }
        });

        // Add new card before Add Subject button
        addSubjectBtn.parentElement.insertBefore(
            subjectCard,
            addSubjectBtn
        );

        alert("✅ " + subject + " added successfully!");

        console.log("Subject saved to Firebase:", docRef.id);

    } catch (error) {

        console.error("Error adding subject:", error);

        alert("❌ Subject add करता आला नाही.");
    }
});

// ===============================
// LOAD SUBJECTS FROM FIREBASE
// ===============================

async function loadSubjects() {
    try {
        const querySnapshot = await getDocs(collection(db, "subjects"));

        const subjectSection = addSubjectBtn.parentElement;

        // Existing subjects already shown in HTML
        const existingSubjects = Array.from(
            subjectSection.querySelectorAll(".subject-card h3")
        ).map(card => card.textContent.trim());

        querySnapshot.forEach((firebaseSubject) => {

            const subjectData = firebaseSubject.data();
            const subjectName = subjectData.name;

            // Don't create duplicate cards
            if (existingSubjects.some(name => name.includes(subjectName))) {
                return;
            }

            const subjectCard = document.createElement("div");
            subjectCard.className = "subject-card";

            subjectCard.innerHTML = `
                 <h3>📚 ${subjectName}</h3>
                 <p>Your study subject.</p>
                 <button class="delete-subject-btn">❌ Delete</button>
`           ;

             // Delete subject
             const deleteSubjectBtn =
                 subjectCard.querySelector(".delete-subject-btn");

            deleteSubjectBtn.addEventListener("click", async function (event) {
                 event.stopPropagation();

                const confirmDelete = confirm(
                    "Are you sure you want to delete " + subjectName + "?"
                );

                if (!confirmDelete) {
                    return;
                }

                try {
                    await deleteDoc(
                        doc(db, "subjects", firebaseSubject.id)
                    );

                    subjectCard.remove();

                    alert("✅ " + subjectName + " deleted successfully!");

                } catch (error) {
                    console.error("Error deleting subject:", error);
                    alert("❌ Subject delete करता आला नाही.");
                }
            });

            subjectSection.insertBefore(
                subjectCard,
                addSubjectBtn
            );
        });

    } catch (error) {
        console.error("Error loading subjects:", error);
    }
}

async function loadTasks() {
    taskList.innerHTML = "";

    const querySnapshot = await getDocs(collection(db, "tasks"));

    querySnapshot.forEach((firebaseTask) => {
        const taskData = firebaseTask.data();

        const newTask = document.createElement("li");

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = taskData.completed === true;

        const taskText = document.createTextNode(" " + taskData.title + " ");

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "❌";

        // Apply completed style when loading
        if (checkbox.checked) {
            newTask.style.setProperty(
                "text-decoration",
                "line-through",
                "important"
            );
        }

        // Checkbox
        checkbox.addEventListener("change", async function () {
            try {
                await updateDoc(
                    doc(db, "tasks", firebaseTask.id),
                    {
                        completed: checkbox.checked
                    }
                );

                if (checkbox.checked) {
                    newTask.style.setProperty(
                        "text-decoration",
                        "line-through",
                        "important"
                    );
                } else {
                    newTask.style.setProperty(
                        "text-decoration",
                        "none",
                        "important"
                    );
                }

                updateProgress();
                updateStatistics();
                updateSubjectProgress();

            } catch (error) {
                console.error("Error updating task:", error);
            }
        });

        // Delete
        deleteBtn.addEventListener("click", async function () {
            try {
                await deleteDoc(doc(db, "tasks", firebaseTask.id));

                newTask.remove();

                updateProgress();
                updateStatistics();
                updateSubjectProgress();

            } catch (error) {
                console.error("Error deleting task:", error);
            }
        });

        newTask.appendChild(checkbox);
        newTask.appendChild(taskText);
        newTask.appendChild(deleteBtn);

        taskList.appendChild(newTask);
    });
}
addTaskBtn.addEventListener("click", function() {
    const task = prompt("Enter your task:");

    if (task) {
        
        addDoc(collection(db, "tasks"), {
            title: task,
            description: task,
            date: new Date().toISOString().split("T")[0],
            completed: false
        })
        .then(() => {
            console.log("Task saved to Firebase!");
            loadTasks();
        })
        .catch((error) => {
            console.error("Error saving task:", error);
        });

        const newTask = document.createElement("li");

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";

        checkbox.addEventListener("change", function() {
            updateProgress();
            
            if (checkbox.checked) {
                newTask.style.textDecoration = "line-through";
            } else {
                newTask.style.textDecoration = "none";
            }

            updateProgress();
            updateStatistics();
            updateSubjectProgress();
});

newTask.appendChild(checkbox);
newTask.appendChild(document.createTextNode(" " + task + " "));
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "❌";

        deleteBtn.onclick = function() {
            newTask.remove();
            updateProgress();
            updateStatistics();
            updateSubjectProgress();
        };

        newTask.onclick = function() {
            newTask.style.textDecoration = "line-through";
            updateProgress();
        };

        newTask.appendChild(deleteBtn);
        taskList.appendChild(newTask);
    }
});

let timeLeft = 25 * 60;
let timerInterval;

const timerDisplay = document.getElementById("timer");
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resetBtn = document.getElementById("resetBtn");

function updateTimer() {
    let minutes = Math.floor(timeLeft / 60);
    let seconds = timeLeft % 60;

    timerDisplay.textContent =
        String(minutes).padStart(2, "0") + ":" +
        String(seconds).padStart(2, "0");
}

startBtn.onclick = function() {
    if (!timerInterval) {
        timerInterval = setInterval(function() {
            if (timeLeft > 0) {
                timeLeft--;
                updateTimer();
            } else {
                clearInterval(timerInterval);
                timerInterval = null;
                alert("Study time completed! 🎉");
            }
        }, 1000);
    }
};

pauseBtn.onclick = function() {
    clearInterval(timerInterval);
    timerInterval = null;
};

resetBtn.onclick = function() {
    clearInterval(timerInterval);
    timerInterval = null;
    timeLeft = 25 * 60;
    updateTimer();
};

updateTimer();
const checkboxes = document.querySelectorAll("#taskList input[type='checkbox']");

checkboxes.forEach(function(checkbox) {
    checkbox.addEventListener("change", function() {
        if (checkbox.checked) {
            checkbox.parentElement.style.textDecoration = "line-through";
        } else {
            checkbox.parentElement.style.textDecoration = "none";
        }

        updateProgress();
        updateStatistics();
    });
});

function updateProgress() {
    const tasks = document.querySelectorAll("#taskList li");
    const completedTasks = document.querySelectorAll("#taskList input[type='checkbox']:checked");

    const totalTasks = tasks.length;
    const completed = completedTasks.length;

    let percentage = totalTasks > 0
        ? Math.round((completed / totalTasks) * 100)
        : 0;

    document.getElementById("progressBar").value = percentage;
    document.getElementById("progressText").textContent =
        "Today's Progress: " + percentage + "%";
}

updateProgress();
const searchTask = document.getElementById("searchTask");

searchTask.addEventListener("input", function() {
    const searchText = searchTask.value.toLowerCase();
    const tasks = document.querySelectorAll("#taskList li");

    tasks.forEach(function(task) {
        const taskText = task.textContent.toLowerCase();

        if (taskText.includes(searchText)) {
            task.style.display = "";
        } else {
            task.style.display = "none";
        }
    });
});
const dailyGoal = document.getElementById("dailyGoal");

dailyGoal.addEventListener("input", function() {
    updateDailyGoal();
});

function updateDailyGoal() {
    const goal = Number(dailyGoal.value);
    const completedTasks = document.querySelectorAll("#taskList input[type='checkbox']:checked").length;

    if (goal > 0) {
        const percentage = Math.min(
            Math.round((completedTasks / goal) * 100),
            100
        );

        document.getElementById("progressBar").value = percentage;
        document.getElementById("progressText").textContent =
            "Daily Goal Progress: " + percentage + "%";
    }
}
function updateStatistics() {
    const tasks = document.querySelectorAll("#taskList li");
    const completedTasks = document.querySelectorAll("#taskList input[type='checkbox']:checked");

    document.getElementById("completedStats").textContent =
        "Completed Tasks: " + completedTasks.length;

    document.getElementById("pendingStats").textContent =
        "Pending Tasks: " + (tasks.length - completedTasks.length);
}

updateStatistics();
// ===============================
// STUDY REMINDER / ALARM
// ===============================

const reminderTime = document.getElementById("reminderTime");
const setReminderBtn = document.getElementById("setReminderBtn");
const reminderStatus = document.getElementById("reminderStatus");

let alarmTimeout = null;
let alarmAudioContext = null;

// Create alarm sound
function playAlarmSound() {
    try {
        const AudioContext =
            window.AudioContext || window.webkitAudioContext;

        alarmAudioContext = new AudioContext();

        const oscillator = alarmAudioContext.createOscillator();
        const gainNode = alarmAudioContext.createGain();

        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(
            880,
            alarmAudioContext.currentTime
        );

        gainNode.gain.setValueAtTime(
            0.5,
            alarmAudioContext.currentTime
        );

        oscillator.connect(gainNode);
        gainNode.connect(alarmAudioContext.destination);

        oscillator.start();

        // Stop after 10 seconds
        oscillator.stop(
            alarmAudioContext.currentTime + 10
        );

    } catch (error) {
        console.error("Alarm sound error:", error);
    }
}


// Set Reminder button
setReminderBtn.addEventListener("click", async function () {

    const selectedTime = reminderTime.value;

    if (!selectedTime) {
        reminderStatus.textContent =
            "⚠️ Please select a time.";
        return;
    }

    // Clear previous alarm
    if (alarmTimeout) {
        clearTimeout(alarmTimeout);
        alarmTimeout = null;
    }

    // Current date and selected time
    const now = new Date();

    const [hours, minutes] =
        selectedTime.split(":").map(Number);

    const alarmDate = new Date();

    alarmDate.setHours(hours);
    alarmDate.setMinutes(minutes);
    alarmDate.setSeconds(0);
    alarmDate.setMilliseconds(0);

    // If selected time already passed,
    // schedule it for tomorrow
    if (alarmDate <= now) {
        alarmDate.setDate(
            alarmDate.getDate() + 1
        );
    }

    const delay = alarmDate.getTime() - now.getTime();

    try {

        // Save alarm to Firebase Firestore
        await addDoc(collection(db, "alarms"), {
            time: selectedTime,
            enabled: true,
            alarmDate: alarmDate.toISOString(),
            createdAt: new Date().toISOString()
        });

        reminderStatus.textContent =
            "⏰ Alarm set for " +
            selectedTime;

        // Schedule browser alarm
        alarmTimeout = setTimeout(function () {

            playAlarmSound();

            alert(
                "⏰ Study Reminder!\n\n" +
                "It's time to study."
            );

            reminderStatus.textContent =
                "🔔 Alarm ringing!";

            alarmTimeout = null;

        }, delay);

        console.log(
            "Alarm scheduled:",
            alarmDate
        );

    } catch (error) {

        console.error(
            "Error saving alarm:",
            error
        );

        reminderStatus.textContent =
            "❌ Could not save alarm.";
    }
});
function updateSubjectProgress() {
    const csTasks = document.querySelectorAll("#taskList li");
    const completedTasks = document.querySelectorAll("#taskList input[type='checkbox']:checked");

    let total = csTasks.length;
    let completed = completedTasks.length;

    let percentage = total > 0
        ? Math.round((completed / total) * 100)
        : 0;

    document.getElementById("csProgress").value = percentage;
    document.getElementById("aiProgress").value = percentage;
    document.getElementById("cyberProgress").value = percentage;
}

updateSubjectProgress();
loadTasks();
loadSubjects();

// ===============================
// SUBJECT DETAILS
// ===============================

let currentSubject = "";
if (localStorage.getItem("currentSubject")) {
    currentSubject = localStorage.getItem("currentSubject");
}

// Open subject
function openSubject(subjectName) {
    currentSubject = subjectName;
    localStorage.setItem("currentSubject", currentSubject);

document.getElementById("subjectDetails").style.display = "block";

document.getElementById("selectedSubjectTitle").textContent =
        "📚 " + subjectName;

    loadSubjectData();

    
    // subject details
    document.getElementById("subjectDetails").scrollIntoView({
        behavior: "smooth"
    });
}

window.openSubject = openSubject;

// Add Important Topic
document.getElementById("addTopicBtn").addEventListener("click", function () {

    const input = document.getElementById("topicInput");
    const topic = input.value.trim();

    if (topic === "") {
        alert("Please enter a topic.");
        return;
    }

    const key = "topics_" + currentSubject;

    let topics = JSON.parse(localStorage.getItem(key)) || [];

    topics.push(topic);

    localStorage.setItem(key, JSON.stringify(topics));

    input.value = "";

    loadSubjectData();
});


// Add Important Question
document.getElementById("addQuestionBtn").addEventListener("click", function () {

    const input = document.getElementById("questionInput");
    const question = input.value.trim();

    if (question === "") {
        alert("Please enter a question.");
        return;
    }

    const key = "questions_" + currentSubject;

    let questions = JSON.parse(localStorage.getItem(key)) || [];

    questions.push(question);

    localStorage.setItem(key, JSON.stringify(questions));

    input.value = "";

    loadSubjectData();
});


// Save Notes
document.getElementById("saveNotesBtn").addEventListener("click", function () {

    const notes = document.getElementById("notesInput").value;

    localStorage.setItem(
        "notes_" + currentSubject,
        notes
    );

    document.getElementById("notesStatus").textContent =
        "✅ Notes saved successfully!";
});


// Load Subject Data
function loadSubjectData() {

    // Topics
    const topicList = document.getElementById("topicList");
    topicList.innerHTML = "";

    const topics =
        JSON.parse(localStorage.getItem("topics_" + currentSubject)) || [];

    topics.forEach(function (topic) {

    const li = document.createElement("li");

    li.textContent = "📌 " + topic + " ";

    const deleteBtn = document.createElement("button");

    deleteBtn.textContent = "❌ Delete";

    deleteBtn.onclick = function () {
        deleteTopic(topic);
    };

    li.appendChild(deleteBtn);

    topicList.appendChild(li);
});

    // Questions
    const questionList = document.getElementById("questionList");
    questionList.innerHTML = "";

    const questions =
        JSON.parse(localStorage.getItem("questions_" + currentSubject)) || [];

    questions.forEach(function (question) {

    const li = document.createElement("li");

    li.textContent = "❓ " + question + " ";

    const deleteBtn = document.createElement("button");

    deleteBtn.textContent = "❌ Delete";

    deleteBtn.onclick = function () {
        deleteQuestion(question);
    };

    li.appendChild(deleteBtn);

    questionList.appendChild(li);
});

    // Notes
    const savedNotes =
        localStorage.getItem("notes_" + currentSubject) || "";

    document.getElementById("notesInput").value = savedNotes;

    document.getElementById("notesStatus").textContent = "";
}

function deleteTopic(topicToDelete) {
    let topics = JSON.parse(
        localStorage.getItem("topics_" + currentSubject)
    ) || [];

    topics = topics.filter(function(topic) {
        return topic !== topicToDelete;
    });

    localStorage.setItem(
        "topics_" + currentSubject,
        JSON.stringify(topics)
    );

    loadSubjectData();
}
function deleteQuestion(questionToDelete) {

    let questions = JSON.parse(
        localStorage.getItem("questions_" + currentSubject)
    ) || [];

    questions = questions.filter(function(question) {
        return question !== questionToDelete;
    });

    localStorage.setItem(
        "questions_" + currentSubject,
        JSON.stringify(questions)
    );

    loadSubjectData();
}