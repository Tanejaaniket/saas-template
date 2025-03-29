"use client";

import { useUser } from "@clerk/nextjs";
import axios from "axios";
import { useEffect } from "react";
import toast from "react-hot-toast";

function Dashboard() {
  const { user } = useUser();
  const [todos, setTodos] = useState([]);
  const [search, setSearch] = useState("");
  const [isSubscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [title, setTitle] = useState("");
  const fetchTodos = async (page) => {
    try {
      //*React query can be used
      setLoading(true);
      const response = await axios.get(
        `/api/todo?page=${page}&search=${search}`
      );
      setTodos(response.data.todos);
      toast.success("Todos Fetched Successfully");
    } catch (error) {
      toast.error("Unable to fetch todos");
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscription = async () => {
    try {
      const response = await axios.get(`/api/subscription`);
      toast.success("Subscription Fetched Successfully");
      setSubscribed(response.data.isSubscribed);
    } catch (error) {
      toast.error("Unable to fetch subscription");
    }
  };
  useEffect(() => {
    fetchTodos(1);
    fetchSubscription();
  }, []);

  const handleAddTodo = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "/api/todo",
        { title },
        { headers: { "Content-Type": "application/json" } }
      );
      toast.success("Todo Added Successfully");
      setTitle("");
      fetchTodos(1);
    } catch (error) {
      toast.error("Unable to add todo");
    }
  };
  const handleUpdateTodo = async (todoId) => {
    try {
      const response = await axios.put(
        `/api/todo/${id}`,
        {
          completed,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      toast.success("Todo updated Successfully");
      fetchTodos(1);
    } catch (error) {
      toast.error("Unable to update todo");
    }
  };

  const handleDeleteTodo = async (todoId) => {
    try {
      const response = await axios.delete(
        `/api/todo/${id}`
      );
      toast.success("Todo deleted Successfully");
      fetchTodos(1);
    } catch (error) {
      toast.error("Unable to delete todo");
    }
  };
  return <></>;
}

export default Dashboard;
