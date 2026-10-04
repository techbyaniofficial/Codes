import { useEffect, useMemo, useState } from "react";

const API_URL = "";

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadTasks() {
    try {
      setError("");

      const response = await fetch(`${API_URL}/api/tasks`);

      if (!response.ok) {
        throw new Error("Failed to load tasks");
      }

      const data = await response.json();

      setTasks(data);
    } catch (error) {
      console.error(error);
      setError("Unable to connect to the backend.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTasks();
  }, []);

  async function addTask(event) {
    event.preventDefault();

    const trimmedTitle = title.trim();

    if (!trimmedTitle || saving) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      const response = await fetch(`${API_URL}/api/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: trimmedTitle
        })
      });

      if (!response.ok) {
        throw new Error("Failed to create task");
      }

      const newTask = await response.json();

      setTasks((currentTasks) => [
        newTask,
        ...currentTasks
      ]);

      setTitle("");
    } catch (error) {
      console.error(error);
      setError("Unable to create task.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleTask(task) {
    try {
      setError("");

      const response = await fetch(
        `${API_URL}/api/tasks/${task.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            completed: !task.completed
          })
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update task");
      }

      const updatedTask = await response.json();

      setTasks((currentTasks) =>
        currentTasks.map((item) =>
          item.id === updatedTask.id
            ? updatedTask
            : item
        )
      );
    } catch (error) {
      console.error(error);
      setError("Unable to update task.");
    }
  }

  async function deleteTask(id) {
    try {
      setError("");

      const response = await fetch(
        `${API_URL}/api/tasks/${id}`,
        {
          method: "DELETE"
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete task");
      }

      setTasks((currentTasks) =>
        currentTasks.filter((task) => task.id !== id)
      );
    } catch (error) {
      console.error(error);
      setError("Unable to delete task.");
    }
  }

  const completedCount = useMemo(
    () => tasks.filter((task) => task.completed).length,
    [tasks]
  );

  const pendingCount = tasks.length - completedCount;

  const progress =
    tasks.length === 0
      ? 0
      : Math.round((completedCount / tasks.length) * 100);

  return (
    <div className="app">

      {/* Background decoration */}
      <div className="background-glow glow-one"></div>
      <div className="background-glow glow-two"></div>


      <header className="topbar">

        <div className="brand">

          <div className="brand-icon">
            ✓
          </div>

          <div>
            <h1>
              Task<span>Flow</span>
            </h1>

            <p>
              Organize today. Build tomorrow.
            </p>
          </div>

        </div>


        <div className="connection-status">
          <span className="status-dot"></span>
          Connected
        </div>

      </header>


      <main className="dashboard">

        {/* Statistics */}

        <section className="stats-grid">

          <div className="stat-card">

            <div className="stat-icon blue">
              ☷
            </div>

            <div>
              <span className="stat-label">
                Total Tasks
              </span>

              <strong>
                {tasks.length}
              </strong>
            </div>

          </div>


          <div className="stat-card">

            <div className="stat-icon green">
              ✓
            </div>

            <div>
              <span className="stat-label">
                Completed
              </span>

              <strong>
                {completedCount}
              </strong>
            </div>

          </div>


          <div className="stat-card">

            <div className="stat-icon orange">
              ◷
            </div>

            <div>
              <span className="stat-label">
                Pending
              </span>

              <strong>
                {pendingCount}
              </strong>
            </div>

          </div>


          <div className="stat-card">

            <div className="stat-icon purple">
              ◉
            </div>

            <div className="progress-stat">

              <div className="progress-header">
                <span className="stat-label">
                  Progress
                </span>

                <strong>
                  {progress}%
                </strong>
              </div>

              <div className="progress-bar">
                <div
                  className="progress-value"
                  style={{
                    width: `${progress}%`
                  }}
                ></div>
              </div>

            </div>

          </div>

        </section>


        {/* Add task */}

        <form
          className="add-task-card"
          onSubmit={addTask}
        >

          <div className="add-icon">
            +
          </div>

          <input
            value={title}
            onChange={(event) =>
              setTitle(event.target.value)
            }
            placeholder="What needs to be done?"
            disabled={saving}
          />

          <button
            type="submit"
            disabled={!title.trim() || saving}
          >
            <span>
              {saving ? "Adding..." : "Add Task"}
            </span>

            {!saving && (
              <span className="button-arrow">
                →
              </span>
            )}
          </button>

        </form>


        {/* Error */}

        {error && (
          <div className="error-message">
            <span>!</span>
            {error}
          </div>
        )}


        {/* Tasks */}

        <section className="tasks-card">

          <div className="tasks-header">

            <div>
              <h2>Tasks</h2>

              <p>
                {tasks.length === 0
                  ? "Start by adding a task."
                  : "Keep going, you're doing great."}
              </p>
            </div>

            <div className="task-count">
              {tasks.length}
            </div>

          </div>


          {loading ? (
            <div className="empty-state">
              <div className="loader"></div>
              <p>Loading your tasks...</p>
            </div>
          ) : tasks.length === 0 ? (
            <div className="empty-state">

              <div className="empty-icon">
                ✓
              </div>

              <h3>
                Nothing here yet
              </h3>

              <p>
                Add your first task and get things moving.
              </p>

            </div>
          ) : (
            <div className="task-list">

              {tasks.map((task) => (

                <div
                  className={`task-item ${
                    task.completed
                      ? "is-completed"
                      : ""
                  }`}
                  key={task.id}
                >

                  <button
                    className="task-check"
                    onClick={() =>
                      toggleTask(task)
                    }
                    type="button"
                    aria-label={
                      task.completed
                        ? "Mark task incomplete"
                        : "Mark task complete"
                    }
                  >
                    {task.completed && "✓"}
                  </button>


                  <div className="task-info">

                    <span className="task-title">
                      {task.title}
                    </span>

                    <span className="task-meta">
                      Task #{task.id}
                      <span className="meta-dot">
                        •
                      </span>
                      {task.completed
                        ? "Completed"
                        : "In progress"}
                    </span>

                  </div>


                  <button
                    className="delete-task"
                    onClick={() =>
                      deleteTask(task.id)
                    }
                    type="button"
                    aria-label="Delete task"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        d="M4 7h16M10 11v6M14 11v6M9 7V4h6v3M6 7l1 13h10l1-13"
                      />
                    </svg>
                  </button>

                </div>

              ))}

            </div>
          )}

        </section>


        <footer className="footer">

          <span>
            ✦ A more productive you
          </span>

          <span className="footer-dot">
            •
          </span>

          <span>
            TaskFlow
          </span>

        </footer>

      </main>

    </div>
  );
}

export default App;