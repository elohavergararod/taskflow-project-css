document.addEventListener("DOMContentLoaded", () => {


    const taskBody = document.getElementById("taskBody");
    const taskInput = document.getElementById("taskInput");
    const prioritySelect = document.getElementById("prioritySelect");
    const categorySelect = document.getElementById("categorySelect");
    const addTaskBtn = document.getElementById("addTaskBtn");
    const searchInput = document.getElementById("searchInput");
    const taskCounter = document.getElementById("taskCounter");


    let tasks = [];
    let activeFilter = "all";
    let activePriority = "all";
    let activeCategory = "all";
    let searchText = "";

    function capitalize(str) {
        return str ? str.charAt(0).toUpperCase() + str.slice(1) : "";
    }

    function persistTasks() {
        localStorage.setItem("tasks", JSON.stringify(tasks));
    }

    function updateCounter() {
        if (!taskCounter) return;
        const completed = tasks.filter(t => t.status === "completed").length;
        taskCounter.textContent = `${completed}/${tasks.length}`;
    }

    function renderTasks() {
        taskBody.innerHTML = "";

        const filtered = tasks.filter(task => {
            const matchFilter = activeFilter === "all" || task.status === activeFilter;
            const matchPriority = activePriority === "all" || task.priority === activePriority;
            const matchCategory = activeCategory === "all" || task.category === activeCategory;
            const matchSearch = task.title.toLowerCase().includes(searchText);
            return matchFilter && matchPriority && matchCategory && matchSearch;
        });

        filtered.forEach(task => {

            const tr = document.createElement("tr");
            if (task.status === "completed") tr.classList.add("completed-row");

            const isDone = task.status === "completed";

            tr.innerHTML = `
        <td>
          <button class="check-btn ${isDone ? "done" : ""}" data-id="${task.id}">
            ${isDone ? "✓" : "○"}
          </button>
        </td>
        <td>${task.title}</td>
        <td><span class="badge ${task.priority}">${capitalize(task.priority)}</span></td>
        <td><span class="badge ${task.category}">${capitalize(task.category)}</span></td>
        <td>
          ${isDone
                    ? `<span class="status-completed">Completed</span>`
                    : `<span class="status-pending">Pending</span>`}
        </td>
        <td class="actions">
          <button class="edit-btn" data-id="${task.id}">Edit</button>
          <button class="del-btn" data-id="${task.id}">✕</button>
        </td>
      `;

            taskBody.appendChild(tr);
        });

        updateCounter();
    }


    function addTask() {
        const text = taskInput.value.trim();
        if (!text) return;

        tasks.push({
            id: Date.now(),
            title: text,
            priority: prioritySelect.value,
            category: categorySelect.value,
            status: "pending"
        });

        taskInput.value = "";
        persistTasks();
        renderTasks();
    }

    addTaskBtn.addEventListener("click", addTask);
    taskInput.addEventListener("keydown", e => {
    if (e.key === "Enter") {
        e.preventDefault();   
        addTask();
    }
    });

    taskBody.addEventListener("click", e => {

        const btn = e.target.closest("button");
        if (!btn) return;

        const id = Number(btn.dataset.id);
        if (isNaN(id)) return;

        if (e.target.classList.contains("check-btn")) {
            const task = tasks.find(t => t.id === id);
            if (task) {
                task.status = task.status === "completed" ? "pending" : "completed";
                persistTasks();
                renderTasks();
            }
        }

        if (e.target.classList.contains("edit-btn")) {

            const task = tasks.find(t => t.id === id);
            if (!task) return;

            const tr = e.target.closest("tr");

            tr.innerHTML = `
                <td></td>
                <td><input type="text" value="${task.title}" class="edit-title"></td>
                <td>
                    <select class="edit-priority">
                        <option value="high" ${task.priority === "high" ? "selected" : ""}>High</option>
                        <option value="medium" ${task.priority === "medium" ? "selected" : ""}>Medium</option>
                        <option value="low" ${task.priority === "low" ? "selected" : ""}>Low</option>
                    </select>
                </td>
                <td>
                    <select class="edit-category">
                        <option value="work" ${task.category === "work" ? "selected" : ""}>Work</option>
                        <option value="studies" ${task.category === "studies" ? "selected" : ""}>Studies</option>
                        <option value="personal" ${task.category === "personal" ? "selected" : ""}>Personal</option>
                    </select>
                </td>
                <td></td>
                <td>
                    <button class="save-btn" data-id="${task.id}">Save</button>
                </td>
            `;

            return;
        }

        if (e.target.classList.contains("save-btn")) {

            const task = tasks.find(t => t.id === id);
            if (!task) return;

            const tr = e.target.closest("tr");

            task.title = tr.querySelector(".edit-title").value.trim();
            task.priority = tr.querySelector(".edit-priority").value;
            task.category = tr.querySelector(".edit-category").value;

            persistTasks();
            renderTasks();
            return;
        }


        if (e.target.classList.contains("del-btn")) {
            const tr = e.target.closest("tr");
            tr.classList.add("removing");

            setTimeout(() => {
                tasks = tasks.filter(t => t.id !== id);
                persistTasks();
                renderTasks();
            }, 200);
            return;
        }
    });

    document.querySelectorAll(".pill").forEach(btn => {
        btn.addEventListener("click", function () {
            document.querySelectorAll(".pill").forEach(p => p.classList.remove("active"));
            this.classList.add("active");
            activeFilter = this.dataset.filter;
            renderTasks();
        });
    });

    document.querySelectorAll("[data-priority]").forEach(btn => {
        btn.addEventListener("click", function () {
            document.querySelectorAll("[data-priority]").forEach(p => p.classList.remove("active"));
            this.classList.add("active");
            activePriority = this.dataset.priority;
            renderTasks();
        });
    });

    document.querySelectorAll("[data-category]").forEach(btn => {
        btn.addEventListener("click", function () {
            document.querySelectorAll("[data-category]").forEach(p => p.classList.remove("active"));
            this.classList.add("active");
            activeCategory = this.dataset.category;
            renderTasks();
        });
    });

    searchInput.addEventListener("input", () => {
        searchText = searchInput.value.toLowerCase();
        renderTasks();
    });

    function loadTasks() {
        const stored = localStorage.getItem("tasks");
        if (stored) {
            tasks = JSON.parse(stored).map(t => ({
                ...t,
                status: t.status || "pending"
            }));
        }
        renderTasks();
    }

    loadTasks();
});