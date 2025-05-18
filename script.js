const gemCountDisplay = document.getElementById('gemCount');
const congratsMessage = document.getElementById('congratsMessage');
const alarmAudio = document.getElementById('alarmSound');

let timers = {}; // Store active timers per habit

let activeHabits = JSON.parse(localStorage.getItem('activeHabits')) || [];
let completedHabits = JSON.parse(localStorage.getItem('completedHabits')) || [];
let gems = parseInt(localStorage.getItem('gems')) || 0;
gemCountDisplay.textContent = gems;

const habitNameInput = document.getElementById('habitName');
const habitTargetInput = document.getElementById('habitTarget');
const addHabitButton = document.getElementById('addHabit');
const habitListContainer = document.getElementById('habitList');


addHabitButton.addEventListener('click', () => {
  const name = habitNameInput.value.trim();
  const target = parseInt(habitTargetInput.value.trim());
  if (name && target > 0) {
    activeHabits.push({ name, target, completed: 0 });
    saveHabits();
    renderHabits();
    habitNameInput.value = '';
    habitTargetInput.value = '';
  }
});

function markComplete(index) {
  if (!alarmAudio.paused) {
  alarmAudio.pause();
  alarmAudio.currentTime = 0; // Reset sound to beginning
}

  activeHabits[index].completed += 1;

  if (activeHabits[index].completed >= activeHabits[index].target) {
    completedHabits.push(activeHabits[index]);
    activeHabits.splice(index, 1);

    // Show congratulatory animation
    showCongrats();
      document.getElementById('completeSound').play(); // 🔊 Play completion sound



    // Add 5 gems
    gems += 5;
    gemCountDisplay.textContent = gems;
    localStorage.setItem('gems', gems);

  }

  saveHabits();
  renderHabits();
}


function deleteHabit(index, list) {
  if (list === 'active') {
    activeHabits.splice(index, 1);
  } else {
    completedHabits.splice(index, 1);
  }
  saveHabits();
  renderHabits();
}

function saveHabits() {
  localStorage.setItem('activeHabits', JSON.stringify(activeHabits));
  localStorage.setItem('completedHabits', JSON.stringify(completedHabits));
}

function renderHabits() {
  habitListContainer.innerHTML = '';

  // Active Habits
  if (activeHabits.length > 0) {
    const activeTitle = document.createElement('h3');
    activeTitle.textContent = 'Active Habits';
    habitListContainer.appendChild(activeTitle);

    activeHabits.forEach((habit, index) => {
      const completionPercentage = Math.min((habit.completed / habit.target) * 100, 100);
      const habitDiv = document.createElement('div');
      habitDiv.classList.add('habit-item');
  habitDiv.innerHTML = `
  <div class="habit-header">
    <h3>${habit.name} (Goal: ${habit.target}/week)</h3>
    <div>
      <button id="done-${index}" onclick="markComplete(${index})" disabled><i class="fas fa-check-circle"></i> Done</button>
      <button onclick="deleteHabit(${index}, 'active')" style="background:#e53935;"><i class="fas fa-trash"></i></button>
    </div>
  </div>
  <div class="progress-container">
    <progress value="${completionPercentage}" max="100"></progress>
    <small>${habit.completed} / ${habit.target} completed</small>
  </div>
 <div class="timer-controls">
  <input type="number" id="hours-${index}" placeholder="hh" min="0" max="23">
  <input type="number" id="minutes-${index}" placeholder="mm" min="0" max="59">
  <input type="number" id="seconds-${index}" placeholder="ss" min="0" max="59">
  <button onclick="startTimer(${index})">Start Timer</button>
</div>

  <div class="timer-countdown" id="countdown-${index}"></div>
`;

      habitListContainer.appendChild(habitDiv);
    });
  }

  // Completed Habits
  if (completedHabits.length > 0) {
    const completedTitle = document.createElement('h3');
    completedTitle.textContent = '✅ Completed Habits';
    habitListContainer.appendChild(completedTitle);

    completedHabits.forEach((habit, index) => {
      const habitDiv = document.createElement('div');
      habitDiv.classList.add('habit-item');
      habitDiv.style.backgroundColor = '#e8f5e9';
     habitDiv.innerHTML = `
  <div class="habit-header">
    <h3>${habit.name} <span class="gem-reward">+5 gems added</span></h3>
    <button onclick="deleteHabit(${index}, 'completed')" style="background:#e53935;"><i class="fas fa-trash"></i></button>
  </div>

        <div class="progress-container">
          <progress value="100" max="100"></progress>
          <small>Completed ${habit.completed} times</small>
        </div>
      `;
      habitListContainer.appendChild(habitDiv);
    });
  }
}

renderHabits();


function showCongrats() {
  congratsMessage.style.display = 'block';
  setTimeout(() => {
    congratsMessage.style.display = 'none';
  }, 4000); // show for 4 seconds
}



function startTimer(index) {
  const h = parseInt(document.getElementById(`hours-${index}`).value) || 0;
  const m = parseInt(document.getElementById(`minutes-${index}`).value) || 0;
  const s = parseInt(document.getElementById(`seconds-${index}`).value) || 0;

  const countdownDisplay = document.getElementById(`countdown-${index}`);
  const doneButton = document.getElementById(`done-${index}`);

  const totalSeconds = h * 3600 + m * 60 + s;

  if (totalSeconds <= 0) {
    alert('Please enter a valid timer duration (HH:MM:SS).');
    return;
  }

  let remainingSeconds = totalSeconds;
  doneButton.disabled = true;
  updateCountdownDisplay(countdownDisplay, remainingSeconds);

  timers[index] = setInterval(() => {
    remainingSeconds--;

    if (remainingSeconds <= 0) {
  clearInterval(timers[index]);
  countdownDisplay.textContent = '⏰ Time’s up! You can now mark this habit as done.';
  doneButton.disabled = false;

  document.getElementById('alarmSound').play(); // 🔊 Play alarm sound
}

     else {
      updateCountdownDisplay(countdownDisplay, remainingSeconds);
    }
  }, 1000);
}


function updateCountdownDisplay(el, totalSec) {
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  el.textContent = `Time remaining: ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
