      // Local Storage Keys
      const STORAGE_KEY = "olymposExercises";

      // DOM Elements
      const newExerciseBtn = document.getElementById("new-exercise-button");
      const clearAllBtn = document.getElementById("clear-all-button");
      const noExercisesText = document.getElementById("no-exercises-text");
      const exercisesContainer = document.getElementById("exercises-container");

      // Modals
      const newExerciseModal = document.getElementById("new-exercise-modal");
      const addEntryModal = document.getElementById("add-entry-modal");
      const deleteConfirmationModal = document.getElementById(
        "delete-confirmation"
      );

      // Forms
      const newExerciseForm = document.getElementById("new-exercise-form");
      const addEntryForm = document.getElementById("add-entry-form");

      // Delete confirmation elements
      const deleteTarget = document.querySelector(".delete-target");
      const confirmDeleteBtn = document.getElementById("confirm-delete");
      const cancelDeleteBtn = document.getElementById("cancel-delete");

      // State
      let exercises = [];
      let deleteType = ""; // 'exercise' or 'entry'
      let deleteExerciseId = null;
      let deleteEntryIndex = null;

      // Initialize
      document.addEventListener("DOMContentLoaded", () => {
        // Set default date to today
        const today = new Date().toLocaleDateString('en-CA');
        document.getElementById("date").value = today;
        document.getElementById("entry-date").value = today;

        // Load data from localStorage
        loadExercises();
        renderExercises();

        // Event Listeners
        newExerciseBtn.addEventListener("click", () =>
          openModal(newExerciseModal)
        );

        // Close modals on cancel
        document.querySelectorAll(".btn-cancel").forEach((btn) => {
          btn.addEventListener("click", closeAllModals);
        });

        // Close modal when clicking outside
        window.addEventListener("click", (e) => {
          if (e.target.classList.contains("modal")) {
            closeAllModals();
          }
        });

        // Form submissions
        newExerciseForm.addEventListener("submit", handleNewExercise);
        addEntryForm.addEventListener("submit", handleAddEntry);

        // Delete confirmation
        confirmDeleteBtn.addEventListener("click", handleConfirmDelete);
        cancelDeleteBtn.addEventListener("click", closeAllModals);

        // Clear all button
        clearAllBtn.addEventListener("click", handleClearAll);
      });

      // Load exercises from localStorage
      function loadExercises() {
        const storedExercises = localStorage.getItem(STORAGE_KEY);
        exercises = storedExercises ? JSON.parse(storedExercises) : [];
      }

      // Save exercises to localStorage
      function saveExercises() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(exercises));
      }

    // Render all exercises
    function renderExercises() {
      noExercisesText.style.display = exercises.length > 0 ? "none" : "block";
      exercisesContainer.style.display = exercises.length > 0 ? "flex" : "none";

      if (exercises.length > 0) {
        clearAllBtn.style.display = "block";
      } else {
        clearAllBtn.style.display = "none";
      }

      exercisesContainer.innerHTML = "";

      //sort exercises alphabetically by name
      const sortedExercises = [...exercises].sort((a, b) => 
        a.name.toLowerCase().localeCompare(b.name.toLowerCase())
      );

      //render each exercise in sorted order
      sortedExercises.forEach((exercise) => {
        //find the original index of this exercise in the unsorted array
        const originalIndex = exercises.findIndex(ex => ex.name === exercise.name);
        const exerciseCard = createExerciseCard(exercise, originalIndex);
        exercisesContainer.appendChild(exerciseCard);
      });
    }

      // Create an exercise card
      function createExerciseCard(exercise, index) {
        const card = document.createElement("div");
        card.className = "exercise-card slide-up";
        card.dataset.index = index;

        // Header (always visible)
        const header = document.createElement("div");
        header.className = "exercise-header";
        header.innerHTML = `
          <h3 class="exercise-title">${exercise.name}</h3>
          <button class="exercise-toggle">▼</button>
        `;
        card.appendChild(header);

        // Content (expandable)
        const content = document.createElement("div");
        content.className = "exercise-content";

        // Tabs
        const tabs = document.createElement("div");
        tabs.className = "exercise-tabs";
        tabs.innerHTML = `
          <div class="tab active" data-tab="list">Entries</div>
          <div class="tab" data-tab="graph">Graph</div>
        `;
        content.appendChild(tabs);

        // Tab contents
        const listContent = document.createElement("div");
        listContent.className = "tab-content active";
        listContent.dataset.tab = "list";

        // Entries list
        const entriesList = document.createElement("ul");
        entriesList.className = "entries-list";

        if (exercise.entries.length > 0) {
          exercise.entries.forEach((entry, entryIndex) => {
            const listItem = document.createElement("li");
            listItem.className = "entry-item";

            // Fix date display by creating a date object with time set to noon to avoid timezone issues
            const date = new Date(entry.date + "T12:00:00");
            const formattedDate = date.toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
            });

            listItem.innerHTML = `
              <span class="entry-date">${formattedDate}</span>
              <div class="entry-details">
                <span class="entry-weight">${entry.weight} ${entry.unit}</span>
                <span class="entry-reps">${entry.reps}</span>
                <button class="entry-delete" data-entry-index="${entryIndex}">×</button>
              </div>
            `;
            entriesList.appendChild(listItem);
          });
        } else {
          const emptyMessage = document.createElement("div");
          emptyMessage.textContent = "No entries yet. Add your first one!";
          emptyMessage.style.textAlign = "center";
          emptyMessage.style.padding = "2rem";
          emptyMessage.style.color = "var(--text-secondary)";
          emptyMessage.style.fontStyle = "italic";
          entriesList.appendChild(emptyMessage);
        }

        listContent.appendChild(entriesList);

        // Add scrollbar hint if needed
        if (exercise.entries.length > 3) {
          const scrollbarNote = document.createElement("div");
          scrollbarNote.className = "scrollbar-note";
          scrollbarNote.textContent = "Scroll to see more entries";
          listContent.appendChild(scrollbarNote);
        }

        // Add Entry button
        const addEntryBtn = document.createElement("button");
        addEntryBtn.className = "add-entry-btn";
        addEntryBtn.textContent = "Add Entry";
        addEntryBtn.dataset.exerciseIndex = index;
        listContent.appendChild(addEntryBtn);

        // Graph content
        const graphContent = document.createElement("div");
        graphContent.className = "tab-content";
        graphContent.dataset.tab = "graph";

        if (exercise.entries.length > 1) {
          const chartContainer = document.createElement("div");
          chartContainer.className = "chart-container";
          chartContainer.innerHTML = `<canvas id="chart-${index}"></canvas>`;
          graphContent.appendChild(chartContainer);
        } else {
          const emptyGraphMessage = document.createElement("div");
          emptyGraphMessage.className = "empty-graph-message";
          emptyGraphMessage.textContent =
            "Add at least two entries to see a progress graph";
          graphContent.appendChild(emptyGraphMessage);
        }

        content.appendChild(listContent);
        content.appendChild(graphContent);

        // Action panel
        const actionPanel = document.createElement("div");
        actionPanel.className = "action-panel";
        actionPanel.innerHTML = `
          <button class="delete-exercise-btn" data-exercise-index="${index}">
            <span>Delete Exercise</span>
          </button>
        `;

        content.appendChild(actionPanel);
        card.appendChild(content);

        // Set up event listeners
        header.addEventListener("click", () =>
          toggleExerciseCard(card, exercise, index)
        );

        // Tab switching
        tabs.querySelectorAll(".tab").forEach((tab) => {
          tab.addEventListener("click", (e) => {
            const tabName = e.target.dataset.tab;
            switchTab(card, tabName);
          });
        });

        // Add entry button
        addEntryBtn.addEventListener("click", () => openAddEntryModal(index));

        // Delete exercise button
        actionPanel
          .querySelector(".delete-exercise-btn")
          .addEventListener("click", (e) => {
            e.stopPropagation();
            openDeleteConfirmation("exercise", index);
          });

        // Delete entry buttons
        entriesList.querySelectorAll(".entry-delete").forEach((btn) => {
          btn.addEventListener("click", (e) => {
            e.stopPropagation();
            const entryIndex = parseInt(e.target.dataset.entryIndex);
            openDeleteConfirmation("entry", index, entryIndex);
          });
        });

        return card;
      }

      // Toggle exercise card expansion
      function toggleExerciseCard(card, exercise, index) {
        const isExpanded = card.classList.contains("expanded");
        const content = card.querySelector(".exercise-content");
        const toggle = card.querySelector(".exercise-toggle");

        if (isExpanded) {
          content.style.height = "0";
          card.classList.remove("expanded");
        } else {
          // Expand the card
          card.classList.add("expanded");
          content.style.height = content.scrollHeight + "px";

          // Initialize chart if on graph tab and not already initialized
          const graphTab = card.querySelector('.tab[data-tab="graph"]');
          if (
            graphTab.classList.contains("active") &&
            exercise.entries.length > 1
          ) {
            initializeChart(exercise, index);
          }
        }
      }

      // Switch between tabs
      function switchTab(card, tabName) {
        // Update tab active state
        card.querySelectorAll(".tab").forEach((tab) => {
          tab.classList.toggle("active", tab.dataset.tab === tabName);
        });

        // Update content visibility
        card.querySelectorAll(".tab-content").forEach((content) => {
          content.classList.toggle("active", content.dataset.tab === tabName);
        });

        // Initialize chart if switching to graph tab
        if (tabName === "graph") {
          const index = parseInt(card.dataset.index);
          const exercise = exercises[index];

          if (exercise.entries.length > 1) {
            initializeChart(exercise, index);
          }
        }

        // Update content height
        const content = card.querySelector(".exercise-content");
        content.style.height = content.scrollHeight + "px";
      }

      // Initialize chart for an exercise
      function initializeChart(exercise, index) {
        const canvas = document.getElementById(`chart-${index}`);
        if (!canvas) return;

        // Clear existing chart if any
        if (canvas.chart) {
          canvas.chart.destroy();
        }

        const sortedEntries = [...exercise.entries].sort(
          (a, b) => new Date(a.date) - new Date(b.date)
        );

        // Prepare data for chart
        const dates = sortedEntries.map((entry) => {
          // Fix date display by creating a date object with time set to noon to avoid timezone issues
          const date = new Date(entry.date + "T12:00:00");
          return date.toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          });
        });

        // Calculate weight × reps for each entry
        const loadData = sortedEntries.map(
          (entry) => entry.weight * entry.reps
        );

        // Create the chart
        const ctx = canvas.getContext("2d");
        canvas.chart = new Chart(ctx, {
          type: "line",
          data: {
            labels: dates,
            datasets: [
              {
                label: "Load (Weight × Reps)",
                data: loadData,
                borderColor: "rgb(212, 175, 55)",
                backgroundColor: "rgba(212, 175, 55, 0.1)",
                borderWidth: 2,
                tension: 0.3,
                fill: false, // Remove shading under the line
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
              mode: "index",
              intersect: false,
            },
            plugins: {
              legend: {
                position: "top",
                labels: {
                  color: "#b8b8b8",
                  font: {
                    family: "Cinzel, serif",
                    size: 12,
                  },
                },
              },
              tooltip: {
                backgroundColor: "rgba(18, 18, 26, 0.8)",
                borderColor: "rgba(212, 175, 55, 0.5)",
                borderWidth: 1,
                titleColor: "#d4af37",
                bodyColor: "#f5f5f5",
                titleFont: {
                  family: "Cinzel, serif",
                  size: 14,
                },
                bodyFont: {
                  family: "Cormorant Garamond, serif",
                  size: 14,
                },
                padding: 10,
                displayColors: false,
                callbacks: {
                  label: function (context) {
                    const value = context.parsed.y || 0;
                    const entryIndex = context.dataIndex;
                    const entry = sortedEntries[entryIndex];
                    return `Load: ${value} (${entry.weight} ${entry.unit} × ${entry.reps} reps)`;
                  },
                },
              },
            },
            scales: {
              x: {
                grid: {
                  color: "rgba(212, 175, 55, 0.1)",
                },
                ticks: {
                  color: "#b8b8b8",
                  font: {
                    family: "Cormorant Garamond, serif",
                    size: 12,
                  },
                },
              },
              y: {
                grid: {
                  color: "rgba(212, 175, 55, 0.1)",
                },
                ticks: {
                  color: "rgb(212, 175, 55)",
                  font: {
                    family: "Cormorant Garamond, serif",
                    size: 12,
                  },
                },
                title: {
                  display: true,
                  text: `Load (${exercise.entries[0].unit} × reps)`,
                  color: "rgb(212, 175, 55)",
                  font: {
                    family: "Cinzel, serif",
                    size: 12,
                  },
                },
              },
            },
          },
        });
      }

      // Open modal helper
      function openModal(modal) {
        modal.classList.add("show");
      }

      // Close all modals
      function closeAllModals() {
        document.querySelectorAll(".modal").forEach((modal) => {
          modal.classList.remove("show");
        });

        // Reset forms
        newExerciseForm.reset();
        addEntryForm.reset();

        // Set default date to today
        const today = new Date().toLocaleDateString('en-CA');
        document.getElementById("date").value = today;
        document.getElementById("entry-date").value = today;
      }

      // Open add entry modal
      function openAddEntryModal(exerciseIndex) {
        // Set exercise ID in the form
        document.getElementById("entry-exercise-id").value = exerciseIndex;

        // Prepopulate with default values if available
        const exercise = exercises[exerciseIndex];
        if (exercise.entries.length > 0) {
          const lastEntry = exercise.entries[exercise.entries.length - 1];
          document.getElementById("entry-weight").value = lastEntry.weight;
          document.getElementById("entry-reps").value = lastEntry.reps;
        }

        openModal(addEntryModal);
      }

      // Open delete confirmation
      function openDeleteConfirmation(type, exerciseIndex, entryIndex = null) {
        deleteType = type;
        deleteExerciseId = exerciseIndex;
        deleteEntryIndex = entryIndex;

        if (type === "exercise") {
          // Deleting an entire exercise
          deleteTarget.textContent = `"${exercises[exerciseIndex].name}"`;
        } else if (type === "entry") {
          // Deleting a single entry from an exercise
          deleteTarget.textContent = `this entry from "${exercises[exerciseIndex].name}"`;
        } else if (type === "clear-all") {
          // Deleting all exercises, so no need to reference a specific name
          deleteTarget.textContent = "ALL exercises";
        }

        openModal(deleteConfirmationModal);
      }

      // Handle new exercise form submission
      function handleNewExercise(e) {
        e.preventDefault();

        const name = document.getElementById("exercise-name").value;
        const weight = parseFloat(document.getElementById("weight").value);
        const reps = parseInt(document.getElementById("reps").value);
        const date = document.getElementById("date").value;
        const unit = document.querySelector('input[name="unit"]:checked').value;

        const newExercise = {
          name,
          entries: [
            {
              date,
              weight,
              reps,
              unit,
            },
          ],
        };

        exercises.push(newExercise);
        saveExercises();
        renderExercises();
        closeAllModals();
      }

      // Handle add entry form submission
      function handleAddEntry(e) {
        e.preventDefault();

        const exerciseIndex =
          document.getElementById("entry-exercise-id").value;
        const weight = parseFloat(
          document.getElementById("entry-weight").value
        );
        const reps = parseInt(document.getElementById("entry-reps").value);
        const date = document.getElementById("entry-date").value;

        // Get the unit from the first entry
        const unit = exercises[exerciseIndex].entries[0].unit;

        const newEntry = {
          date,
          weight,
          reps,
          unit,
        };

        exercises[exerciseIndex].entries.push(newEntry);
        saveExercises();
        renderExercises();
        closeAllModals();
      }

      // Handle delete confirmation
      function handleConfirmDelete() {
        if (deleteType === "exercise") {
          exercises.splice(deleteExerciseId, 1);
        } else if (deleteType === "entry") {
          // Don't delete if it's the last entry
          if (exercises[deleteExerciseId].entries.length > 1) {
            exercises[deleteExerciseId].entries.splice(deleteEntryIndex, 1);
          } else {
            alert("Cannot delete the last entry. Delete the exercise instead.");
            closeAllModals();
            return;
          }
        }

        saveExercises();
        renderExercises();
        closeAllModals();
      }

      // Handle clear all
      function handleClearAll() {
        openDeleteConfirmation("clear-all");
        deleteTarget.textContent = "ALL exercises";

        // Modify the confirm delete handler temporarily
        const originalHandler = confirmDeleteBtn.onclick;
        confirmDeleteBtn.onclick = () => {
          exercises = [];
          saveExercises();
          renderExercises();
          closeAllModals();

          // Restore original handler
          confirmDeleteBtn.onclick = originalHandler;
        };
      }
