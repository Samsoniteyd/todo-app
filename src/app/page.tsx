"use client";
import { useEffect, useState } from "react";
import { FaEdit, FaTrashAlt, FaCheckCircle } from "react-icons/fa";
import { useRouter } from "next/navigation"; // Import useRouter for navigation
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  where,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db, auth } from "./firebase/config";
import { onAuthStateChanged, signOut } from "firebase/auth";
// import { useAuthState } from "react-firebase-hooks/auth";
import { User } from "firebase/auth";

interface Todo {
  id: string;
  task: string;
  completed: boolean;
  userId: string;
}

export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTask, setNewTask] = useState<string>("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editedTask, setEditedTask] = useState<string>("");
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  // Fetch todos for the logged-in user
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        const todosQuery = query(
          collection(db, "todos"),
          where("userId", "==", currentUser.uid)
        );

        const unsubscribe = onSnapshot(todosQuery, (snapshot) => {
          const fetchedTodos: Todo[] = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Todo[];

          setTodos(fetchedTodos);
        });

        return () => unsubscribe();
      } else {
        setUser(null);
        setTodos([]);
        router.push("/sign-in");
      }
    });

    return () => unsubscribeAuth();
  }, [router]);

  // Add a new task to Firestore for the logged-in user
  const addTask = async () => {
    if (newTask.trim() !== "" && user) {
      await addDoc(collection(db, "todos"), {
        task: newTask,
        completed: false,
        userId: user.uid,
      });
      setNewTask("");
    }
  };

  // Update an existing task in Firestore
  const updateTask = async (id: string) => {
    const taskDoc = doc(db, "todos", id);
    await updateDoc(taskDoc, { task: editedTask });
    setEditId(null);
  };

  // Delete a task from Firestore
  const deleteTask = async (id: string) => {
    const taskDoc = doc(db, "todos", id);
    await deleteDoc(taskDoc);
  };

  // Toggle task completion status in Firestore
  const toggleComplete = async (id: string, completed: boolean) => {
    const taskDoc = doc(db, "todos", id);
    await updateDoc(taskDoc, { completed: !completed });
  };

  // Handle user logout
  const handleLogout = async () => {
    await signOut(auth);
    router.push("/sign-in");
  };

  return (
    <>
      {/* Logout Button */}
      {user && (
        <div className="flex justify-end  mt-9 mr-9">
          <button
            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      )}

      <div className="max-w-md mx-auto mt-10 p-5 bg-white shadow-lg rounded-lg dark:bg-gray-800">
        <h1 className="text-2xl font-bold text-center mb-5 dark:text-white">
          Todo List
        </h1>

        {/* Add Task Input */}
        {user && (
          <div className="flex items-center mb-4">
            <input
              type="text"
              className="w-full px-3 py-2 border rounded-l-md dark:bg-gray-700 dark:text-white"
              placeholder="Add a new task..."
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
            />
            <button
              className="bg-indigo-600 text-white px-4 py-2 rounded-r-md hover:bg-indigo-700"
              onClick={addTask}
            >
              Add
            </button>
          </div>
        )}

        <ul className="space-y-3">
          {todos.map((todo) => (
            <li
              key={todo.id}
              className={`flex justify-between items-center p-3 border rounded-md ${todo.completed}`}
            >
              <div className="flex items-center space-x-2">
                <FaCheckCircle
                  className={`cursor-pointer ${
                    todo.completed ? "text-green-500" : "text-gray-400"
                  }`}
                  onClick={() => toggleComplete(todo.id, todo.completed)}
                />
                {editId === todo.id ? (
                  <input
                    type="text"
                    className="px-2 py-1 border rounded-md "
                    value={editedTask}
                    onChange={(e) => setEditedTask(e.target.value)}
                  />
                ) : (
                  <span
                    className={`text-lg ${
                      todo.completed ? "line-through text-gray-500" : ""
                    } `}
                  >
                    {todo.task}
                  </span>
                )}
              </div>

              {/* Icons for Edit and Delete */}
              <div className="flex space-x-3">
                {editId === todo.id ? (
                  <button
                    className="text-blue-500 hover:text-blue-700"
                    onClick={() => updateTask(todo.id)}
                  >
                    Save
                  </button>
                ) : (
                  <FaEdit
                    className="text-blue-500 cursor-pointer hover:text-blue-700"
                    onClick={() => {
                      setEditId(todo.id);
                      setEditedTask(todo.task);
                    }}
                  />
                )}
                <FaTrashAlt
                  className="text-red-500 cursor-pointer hover:text-red-700"
                  onClick={() => deleteTask(todo.id)}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
