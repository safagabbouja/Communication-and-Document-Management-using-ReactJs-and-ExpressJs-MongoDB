import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../base-components/Button";
import { FormInput, FormTextarea } from "../../base-components/Form";
import Lucide from "../../base-components/Lucide";
import { Menu, Tab } from "../../base-components/Headless";
import Swal from "sweetalert2";
import axios from "axios";
import { io, Socket } from 'socket.io-client';
import fakerData from "../../utils/faker";

interface Chat {
  _id: string;
  isGroupChat: boolean;
  chatName: string;
  users: Array<{ _id: string; name: string }>;
  latestMessage?: {
    sender: { name: string };
    content: string;
  };
}

interface Message {
  _id: string;
  content: string;
  sender: {
    _id: string;
    name: string;
  };
  chat: {
    _id: string;
  };
}

interface User {
  _id: string;
  token: string;
  name: string;
}

function getSender(loggedUser: any, users: Array<{ _id: string; name: string }>) {
  if (!loggedUser || users.length < 2) return "Unknown";
  return users[0]._id === loggedUser._id ? users[1].name : users[0].name;
}

function Main() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [chatBox, setChatBox] = useState(false);
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const [loggedUser, setLoggedUser] = useState<any | null>(null);
  const [showSearch, setShowSearch] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [notification, setNotification] = useState<Message[]>([]);
  const ENDPOINT = "http://localhost:5000"; // Update endpoint as needed
  const socketRef = useRef<Socket | null>(null);
  let selectedChatCompare: Chat | null = null;

  const navigate = useNavigate();

  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    navigate("/");
  };
// Add a function to handle notification click
const handleNotificationClick = (msg: Message) => {
  // Navigate to the chat if needed or perform other actions
  // For now, just log the message for demo purposes
  console.log("Notification clicked:", msg);
};
// Add a function to check if a user is in the chat
const isUserInChat = (chatId: string) => {
  return selectedChat && selectedChat._id === chatId;
};
  const isSameSenderMargin = (messages: Message[], m: Message, i: number, userId: string | undefined): number => {
    if (userId === undefined) return 0;
    if (
      i < messages.length - 1 &&
      messages[i + 1].sender._id === m.sender._id &&
      messages[i].sender._id !== userId
    ) {
      return 33;
    } else if (
      (i < messages.length - 1 &&
        messages[i + 1].sender._id !== m.sender._id &&
        messages[i].sender._id !== userId) ||
      (i === messages.length - 1 && messages[i].sender._id !== userId)
    ) {
      return 0;
    } else {
      return 33;
    }
  };

  const fetchMessages = async () => {
    if (user && selectedChat && socketRef.current) {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        };

        const { data } = await axios.get(
          `http://localhost:5000/api/message/${selectedChat._id}`,
          config
        );

        setMessages(data);

        if (socketConnected) {
          socketRef.current.emit("join chat", selectedChat._id);
        }
      } catch (error) {
        console.error("Error loading messages:", error);
      }
    }
  };

  useEffect(() => {
    if (user && user._id) {
      socketRef.current = io(ENDPOINT);
      socketRef.current.emit("setup", user);
      socketRef.current.on("connected", () => setSocketConnected(true));
      socketRef.current.on("error", (error) => {
        console.error("Socket error:", error);
      });

      return () => {
        socketRef.current?.disconnect();
      };
    }
  }, [user]);

  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.on("message received", (newMessageReceived: Message) => {
        if (isUserInChat(newMessageReceived.chat._id)) {
          setMessages((prevMessages) => [...prevMessages, newMessageReceived]);
        } else {
          if (!notification.find((msg) => msg._id === newMessageReceived._id)) {
            setNotification((prevNotification) => [newMessageReceived, ...prevNotification]);
          }
        }
      });
  
      return () => {
        socketRef.current?.off("message received");
      };
    }
  }, [selectedChat, notification]);

  const sendMessage = async (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && newMessage) {
      if (user && selectedChat) {
        try {
          const config = {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          };

          setNewMessage(""); 

          const { data } = await axios.post(
            "http://localhost:5000/api/message",
            {
              content: newMessage,
              chatId: selectedChat._id,
            },
            config
          );

          if (socketRef.current) {
            socketRef.current.emit("new message", data);
          }

          setMessages((prevMessages) => [...prevMessages, data]);
        } catch (error) {
          Swal.fire({
            icon: "error",
            title: "Error Occurred!",
            text: "Failed to send the Message",
            confirmButtonText: "OK",
          });
        }
      }
    }
  };

  const fetchChats = async () => {
    if (user && user.token) {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        };
        const { data } = await axios.get(
          "http://localhost:5000/api/chat",
          config
        );
        setChats(data);
      } catch (error) {
        Swal.fire({
          title: "Error Occurred!",
          text: "Failed to Load the chats",
          icon: "error",
          confirmButtonText: "OK",
          position: "bottom-left",
        });
      }
    }
  };

  useEffect(() => {
    const userInfoString = localStorage.getItem("userInfo");
    if (userInfoString) {
      const userInfo = JSON.parse(userInfoString);
      setLoggedUser(userInfo);
      setUser(userInfo);
      fetchChats();
    } else {
      navigate("/");
    }
  }, [navigate]);

  const typingHandler = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(event.target.value);
  };

  const showChatBox = () => {
    setChatBox(!chatBox);
  };

  const handleSearch = async () => {
    if (!user || !user.token) {
      Swal.fire({
        icon: "error",
        title: "User not authenticated",
        text: "Please log in to perform a search",
        timer: 5000,
        position: "bottom-left",
      });
      return;
    }

    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const url = search
        ? `http://localhost:5000/api/user?search=${search}`
        : `http://localhost:5000/api/user`;

      const { data } = await axios.get(url, config);
      setSearchResult(data);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error Occurred!",
        text: "Failed to load the search results",
        timer: 5000,
        position: "bottom-left",
      });
    } finally {
      setLoading(false);
    }
  };

  const accessChat = async (userId: string) => {
    if (!user || !user.token) {
      Swal.fire({
        icon: "error",
        title: "User not authenticated",
        text: "Please log in to access chats",
        timer: 5000,
        position: "bottom-left",
      });
      return;
    }

    try {
      setLoadingChat(true);

      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.post(
        `http://localhost:5000/api/chat`,
        { userId },
        config
      );

      if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);
      setSelectedChat(data);

      showChatBox();
      fetchMessages();

      setLoadingChat(false);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error Occurred!",
        text: "Failed to Load the Chat",
        timer: 5000,
        position: "bottom-left",
      });
    }
  };

  return (

      <>
        <div className="flex flex-col items-center mt-8 intro-y sm:flex-row">
          <h2 className="mr-auto text-lg font-medium">Chat</h2>
          <div className="flex w-full mt-4 sm:w-auto sm:mt-0">
            <Button variant="primary" className="mr-2 shadow-md">
              Start New Chat
            </Button>
            <Menu className="ml-auto sm:ml-0">
      <Menu.Button as={Button} className="px-2 !box text-slate-500 relative">
        <span className="flex items-center justify-center w-5 h-5">
          <Lucide icon="Bell" className="w-4 h-4" />
          {notification.length > 0 && (
            <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full"></span>
          )}
        </span>
      </Menu.Button>
      <Menu.Items className="w-40">
        {notification.length > 0 ? (
          notification.map((msg) => (
            <Menu.Item
              key={msg._id}
              onClick={() => handleNotificationClick(msg)}
              className="cursor-pointer p-2 hover:bg-gray-200"
            >
              <div>{msg.sender.name} sent you a message</div>
    
            </Menu.Item>
          ))
        ) : (
          <Menu.Item className="p-2">No new notifications</Menu.Item>
        )}
      </Menu.Items>
    </Menu>
          </div>
        </div>
    
        <div className="grid grid-cols-12 gap-5 mt-5 intro-y">
          <Tab.Group className="col-span-12 lg:col-span-4 2xl:col-span-3">
            <div className="pr-1 intro-y">
              <div className="p-2 box">
                <Tab.List variant="pills">
                  <Tab>
                    <Tab.Button className="w-full py-2" as="button">
                      Chats
                    </Tab.Button>
                  </Tab>
                </Tab.List>
              </div>
            </div>
    
            <Tab.Panels>
              <Tab.Panel>
                <div className="pr-1">
                  <div className="px-5 pt-5 pb-5 mt-5 box lg:pb-0">
                    <div className="relative text-slate-500">
                      <FormInput
                        type="text"
                        className="px-4 py-3 pr-10 mr-4 border-transparent bg-slate-100"
                        placeholder="Search for messages or users..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                      <Lucide
                        icon="Search"
                        className="absolute inset-y-0 right-0 w-4 h-4 my-auto mr-3 cursor-pointer"
                        onClick={handleSearch}
                      />
                    </div>
                    <div className="overflow-x-auto scrollbar-hidden">
                      {searchResult.map((user) => (
                        <div
                          key={user._id}
                          className="intro-x cursor-pointer box relative flex items-center p-5 mt-5"
                          onClick={() => accessChat(user._id)}
                        >
                          <div className="ml-2 overflow-hidden">
                            <div className="flex items-center">
                              <a href="#" className="font-medium">
                                {user.name}
                              </a>
                            </div>
                            <div className="w-full truncate text-slate-500 mt-0.5">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
    
          <div className="col-span-8 intro-y lg:col-span-8 2xl:col-span-9">
            <div className="h-[600px] box">
              {chatBox && user && (
                <div className="flex flex-col h-full">
                  <div className="flex-1 px-5 pt-5 overflow-y-scroll scrollbar-hidden">
                    {messages.map((m, i) => (
                      <div
                        key={m._id}
                        className="flex items-end mb-4 max-w-[90%] sm:max-w-[49%]"
                        style={{
                          marginBottom: isSameSenderMargin(messages, m, i, user._id),
                          alignItems: m.sender._id === user._id ? "flex-end" : "flex-start",
                        }}
                      >
                        {m.sender._id !== user._id && (
                          <div className="relative flex-none w-10 h-10 mr-3 image-fit">
                            <img
                              alt="User"
                              className="rounded-full"
                              src={fakerData[1].photos[0]}
                            />
                          </div>
                        )}
    
                        <div
                          className={`px-4 py-3 rounded-md ${
                            m.sender._id === user._id
                              ? "text-white bg-primary rounded-l-md rounded-t-md"
                              : "bg-gray-200 text-black rounded-r-md rounded-t-md"
                          }`}
                          style={{
                            marginRight: m.sender._id === user._id ? "-500px" : "auto",
                            marginLeft: m.sender._id === user._id ? "auto" : "0px",
                          }}
                        >
                          <div className="mt-1 text-xs text-opacity-80">
                            <div className="flex items-center">
                              <span className="font-bold">{m.sender.name}:</span>
                             <p className="ml-2">{m.content}</p> 
                            </div>
                          </div>
                        </div>
    
                        {m.sender._id === user._id && (
                          <div className="relative flex-none w-10 h-10 ml-3 image-fit">
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
    
                  <div className="flex items-center pt-4 pb-10 border-t sm:py-4 border-slate-200/60 dark:border-darkmode-400">
                    <FormTextarea
                      className="px-5 py-3 border-transparent shadow-none resize-none h-[46px] dark:bg-darkmode-600 focus:border-transparent focus:ring-0"
                      rows={1}
                      placeholder="Type your message..."
                      onKeyDown={sendMessage}
                      onChange={typingHandler}
                      value={newMessage}
                    />
                    <a
                      href="#"
                      className="flex items-center justify-center flex-none w-8 h-8 mr-5 text-white rounded-full sm:w-10 sm:h-10 bg-primary"
                    >
                      <Lucide icon="Send" className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </>
    );
  }

  export default Main;
      