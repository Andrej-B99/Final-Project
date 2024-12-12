import React, { useState, useEffect } from "react";
import './App.css';
import CryptoJS from "crypto-js";
import { motion } from "framer-motion"; 

function App() {
    const [tasks, setTasks] = useState([]);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [isDarkTheme, setIsDarkTheme] = useState(false);
    const [newTask, setNewTask] = useState({
        title: "",
        desc: "",
        priority: "high",
        deadline: "",
        category: "work",
        isUrgent: false,
        comments: [] 
    });
    const [currentFilter, setCurrentFilter] = useState("all");
    const [currentUser, setCurrentUser] = useState(null); 
    const [usernameInput, setUsernameInput] = useState(""); 
    const [passwordInput, setPasswordInput] = useState(""); 
    const [isCreatingProfile, setIsCreatingProfile] = useState(false); 

    // Loading the theme state from localStorage on initial load
    useEffect(() => {
        const savedTheme = localStorage.getItem("isDarkTheme") === "true";
        setIsDarkTheme(savedTheme);
        document.body.className = savedTheme ? "dark-theme" : "light-theme"; // Apply theme to body
    }, []);

    // Toggling the theme and saving to localStorage
    const toggleTheme = () => {
        const newTheme = !isDarkTheme;
        setIsDarkTheme(newTheme);
        localStorage.setItem("isDarkTheme", newTheme);
        document.body.className = newTheme ? "dark-theme" : "light-theme"; 
    };

    // Loading tasks for the current user from localStorage
    useEffect(() => {
        if (currentUser) {
            const savedTasks = JSON.parse(localStorage.getItem(`tasks_${currentUser}`)) || [];
            setTasks(savedTasks);
        }
    }, [currentUser]);

    // Saving tasks to localStorage whenever they are updated
    const saveTasksToLocalStorage = () => {
        if (currentUser) {
            localStorage.setItem(`tasks_${currentUser}`, JSON.stringify(tasks));
        }
    };

    // Saving tasks to localStorage every time they change
    useEffect(() => {
        saveTasksToLocalStorage();
    }, [tasks]);

    // Handling input changes for task creation
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setNewTask({
            ...newTask,
            [name]: type === "checkbox" ? checked : value
        });
    };

    // Adding a new task to the list
    const addTask = (e) => {
        e.preventDefault();
        const taskWithDate = { ...newTask, createdAt: new Date(), completed: false, id: new Date().toISOString() };
        const updatedTasks = [...tasks, taskWithDate];
        setTasks(updatedTasks);
        setNewTask({
            title: "",
            desc: "",
            priority: "high",
            deadline: "",
            category: "work",
            isUrgent: false,
            comments: [] 
        });
        setIsFormVisible(false);
    };

    // Deleting a task
    const deleteTask = (taskToDelete) => {
        const updatedTasks = tasks.filter((task) => task.id !== taskToDelete.id);
        setTasks(updatedTasks);
    };

    // Marking a task as completed
    const completeTask = (taskToComplete) => {
        const updatedTasks = tasks.map((task) =>
            task.id === taskToComplete.id
                ? { ...task, completed: !task.completed }
                : task
        );
        setTasks(updatedTasks);
    };

    // Sorting tasks by priority
    const sortByPriority = () => {
        const sortedTasks = [...tasks].sort((a, b) => {
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        });
        setTasks(sortedTasks);
    };

    // Filtering tasks based on the selected filter (all, completed, pending)
    const filterTasks = () => {
        if (currentFilter === "all") return tasks;
        if (currentFilter === "completed") return tasks.filter((task) => task.completed);
        if (currentFilter === "pending") return tasks.filter((task) => !task.completed);
    };

    // Handling the creation of a new profile
    const handleCreateProfile = (e) => {
        e.preventDefault();
        if (usernameInput.trim() !== "" && passwordInput.trim() !== "") {
            const hashedPassword = CryptoJS.SHA256(passwordInput).toString(); 
            localStorage.setItem(`user_${usernameInput.trim()}`, hashedPassword); 
            alert("Profile created successfully. You can now log in.");
            setIsCreatingProfile(false); 
        }
    };

    // Handling user login
    const handleLogin = (e) => {
        e.preventDefault();
        if (usernameInput.trim() !== "" && passwordInput.trim() !== "") {
            const storedHashedPassword = localStorage.getItem(`user_${usernameInput.trim()}`);
            const hashedPassword = CryptoJS.SHA256(passwordInput).toString();
            if (storedHashedPassword === hashedPassword) {
                setCurrentUser(usernameInput.trim());
                localStorage.setItem("currentUser", usernameInput.trim()); 
                setUsernameInput("");
                setPasswordInput(""); 
            } else {
                alert("Invalid username or password");
            }
        }
    };

    // Handling user logout
    const handleLogout = () => {
        setCurrentUser(null);
        setTasks([]);
        localStorage.removeItem("currentUser"); 
    };

    // Checking if there is already an active user
    useEffect(() => {
        const savedUser = localStorage.getItem("currentUser");
        if (savedUser) {
            setCurrentUser(savedUser);
        }
    }, []);

    // Animation settings for tasks
    const taskAnimation = {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
        exit: { opacity: 0, y: 10, transition: { duration: 0.5, ease: "easeIn" } },
    };

    // Adding a comment to a task
    const addComment = (taskId, commentText) => {
        const updatedTasks = tasks.map((task) =>
            task.id === taskId
                ? {
                      ...task,
                      comments: Array.isArray(task.comments)
                          ? [...task.comments, { text: commentText, date: new Date().toLocaleString() }]
                          : [{ text: commentText, date: new Date().toLocaleString() }], // If comments is not an array, create it
                  }
                : task
        );
        setTasks(updatedTasks);
    };

    return (
        <div className="container">
            <h1>Task Manager</h1>

            {/* Form for creating a new profile */}
            {isCreatingProfile ? (
                <div id="create-profile-form" className="form-container">
                    <h2>Create Profile</h2>
                    <div className="form-group">
                        <input
                            type="text"
                            placeholder="Enter username"
                            value={usernameInput}
                            onChange={(e) => setUsernameInput(e.target.value)}
                            className="input-field"
                        />
                    </div>
                    <div className="form-group">
                        <input
                            type="password"
                            placeholder="Enter password"
                            value={passwordInput}
                            onChange={(e) => setPasswordInput(e.target.value)}
                            className="input-field"
                        />
                    </div>
                    <button onClick={handleCreateProfile} className="submit-btn">Create Profile</button>
                    <button onClick={() => setIsCreatingProfile(false)} className="switch-form-btn">Already have an account? Log in</button>
                </div>
            ) : !currentUser ? (
                <div id="login-form" className="form-container">
                    <h2>Login</h2>
                    <div className="form-group">
                        <input
                            type="text"
                            placeholder="Enter username"
                            value={usernameInput}
                            onChange={(e) => setUsernameInput(e.target.value)}
                            className="input-field"
                        />
                    </div>
                    <div className="form-group">
                        <input
                            type="password"
                            placeholder="Enter password"
                            value={passwordInput}
                            onChange={(e) => setPasswordInput(e.target.value)}
                            className="input-field"
                        />
                    </div>
                    <button onClick={handleLogin} className="submit-btn">Login</button>
                    <button onClick={() => setIsCreatingProfile(true)} className="switch-form-btn">Create a new account</button>
                </div>
            ) : (
                <>
                    <p>Welcome, {currentUser}!</p>
                    <div id="logout-section" className="logout-container">
                        <button onClick={handleLogout}>Logout</button>
                    </div>

                    <button className="theme-toggle-btn" onClick={toggleTheme}>
                        Toggle Theme
                    </button>

                    <button id="add-task-btn" onClick={() => setIsFormVisible(!isFormVisible)}>
                        Add Task
                    </button>

                    {isFormVisible && (
                        <div id="task-form-section">
                            <form id="task-form" onSubmit={addTask}>
                                <input
                                    type="text"
                                    name="title"
                                    placeholder="Title"
                                    value={newTask.title}
                                    onChange={handleInputChange}
                                    required
                                />
                                <textarea
                                    name="desc"
                                    placeholder="Description"
                                    value={newTask.desc}
                                    onChange={handleInputChange}
                                    required
                                />
                                <select
                                    name="priority"
                                    value={newTask.priority}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="high">High</option>
                                    <option value="medium">Medium</option>
                                    <option value="low">Low</option>
                                </select>
                                <input
                                    type="date"
                                    name="deadline"
                                    value={newTask.deadline}
                                    onChange={handleInputChange}
                                    required
                                />
                                <select
                                    name="category"
                                    value={newTask.category}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="work">Work</option>
                                    <option value="personal">Personal</option>
                                    <option value="study">Study</option>
                                </select>
                                <label>
                                    Urgent
                                    <input
                                        type="checkbox"
                                        name="isUrgent"
                                        checked={newTask.isUrgent}
                                        onChange={handleInputChange}
                                    />
                                </label>
                                <button type="submit">Add Task</button>
                            </form>
                        </div>
                    )}

                    <button id="sort-priority" onClick={sortByPriority}>
                        Sort by Priority
                    </button>

                    <div id="filters">
                        <button
                            className={currentFilter === "all" ? "active" : ""}
                            onClick={() => setCurrentFilter("all")}
                        >
                            All
                        </button>
                        <button
                            className={currentFilter === "completed" ? "active" : ""}
                            onClick={() => setCurrentFilter("completed")}
                        >
                            Completed
                        </button>
                        <button
                            className={currentFilter === "pending" ? "active" : ""}
                            onClick={() => setCurrentFilter("pending")}
                        >
                            Pending
                        </button>
                    </div>

                    <div id="task-list">
                        {filterTasks().length === 0 ? (
                            <p>No tasks to show</p>
                        ) : (
                            filterTasks().map((task) => (
                                <motion.div
                                    key={task.id}
                                    className={`task-card ${task.completed ? "completed" : ""} ${task.isUrgent ? "urgent" : ""}`}
                                    variants={taskAnimation}
                                    initial="initial"
                                    animate="animate"
                                    exit="exit"
                                >
                                    <h3>{task.title}</h3>
                                    <p>{task.desc}</p>
                                    <p>Priority: <strong>{task.priority}</strong></p>
                                    <p>Category: <em>{task.category}</em></p>
                                    <p>Deadline: {task.deadline}</p>
                                    <p>Created at: {new Date(task.createdAt).toLocaleString()}</p>

                                    {/* Task comments */}
                                    <div className="comments-list">
                                        {task.comments && Array.isArray(task.comments) && task.comments.length > 0 ? (
                                            task.comments.map((comment, index) => (
                                                <div key={index} className="comment">
                                                    <p>{comment.text}</p>
                                                    <span>{comment.date}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <p>No comments yet</p> // Display message if there are no comments
                                        )}
                                    </div>

                                    <button onClick={() => addComment(task.id, prompt("Enter your comment:"))}>
                                        Add Comment
                                    </button>

                                    <button onClick={() => completeTask(task)}>Toggle Complete</button>
                                    <button onClick={() => deleteTask(task)} className="delete-btn">
                                        Delete Task
                                    </button>
                                </motion.div>
                            ))
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

export default App;
