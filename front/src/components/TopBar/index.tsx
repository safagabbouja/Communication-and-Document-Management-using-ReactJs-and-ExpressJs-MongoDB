import { useState, Fragment, useRef, useEffect } from "react";
import Lucide from "../../base-components/Lucide";
import logoUrl from "../../assets/images/logo.svg";
import { Link } from "react-router-dom";
import Breadcrumb from "../../base-components/Breadcrumb";
import { FormInput } from "../../base-components/Form";
import { Menu, Popover } from "../../base-components/Headless";
import fakerData from "../../utils/faker";
import _ from "lodash";
import clsx from "clsx";
import { Transition } from "@headlessui/react";
import { io, Socket } from 'socket.io-client';

function getSender(
  loggedUser: any,
  users: Array<{ _id: string; name: string }>
) {
  if (!loggedUser || users.length < 2) return "Unknown";
  return users[0]._id === loggedUser._id ? users[1].name : users[0].name;
}

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
    users: Array<{ _id: string; name: string }>;
  };
  createdAt?: string; // Add this line
}


interface User {
  _id: string;
  token: string;
  name: string;
}

function Main() {
  const [searchDropdown, setSearchDropdown] = useState(false);
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
  const [notification, setNotification] = useState<Message[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const ENDPOINT = "http://localhost:5000"; // Update endpoint as needed

  let selectedChatCompare: Chat | null = null;
  
  const showSearchDropdown = () => {
    setSearchDropdown(true);
  };

  const hideSearchDropdown = () => {
    setSearchDropdown(false);
  };
  useEffect(() => {
    const socket = io(ENDPOINT);
  
    socket.on('connect', () => {
      setSocketConnected(true);
      console.log('Connected to Socket.IO server');
    });
  
    socket.on('new notification', (notification) => {
      console.log('New notification received:', notification);
      setNotification((prevNotifications) => [...prevNotifications, notification]);
    });
  
    return () => {
      socket.disconnect();
    };
  }, []);
  

  return (
    <>
      {/* BEGIN: Top Bar */}
      <div className="top-bar-boxed h-[70px] z-[51] relative border-b border-white/[0.08] mt-12 md:-mt-5 -mx-3 sm:-mx-8 px-3 sm:px-8 md:pt-0 mb-12">
        <div className="flex items-center h-full">
          {/* BEGIN: Logo */}
          <Link to="/" className="hidden -intro-x md:flex">
            <img
              alt="Icewall Tailwind HTML Admin Template"
              className="w-6"
              src={logoUrl}
            />
            <span className="ml-3 text-lg text-white"> Icewall </span>
          </Link>
          {/* END: Logo */}
          {/* BEGIN: Breadcrumb (position de barre de recherche) */}
          <Breadcrumb
            light
            className="h-full md:ml-10 md:pl-10 md:border-l border-white/[0.08] mr-auto -intro-x"
          >
            <Breadcrumb.Link to="/">Application</Breadcrumb.Link>
            <Breadcrumb.Link to="/" active={true}>
              Dashboard
            </Breadcrumb.Link>
          </Breadcrumb>
          {/* END: Breadcrumb */}
          {/* BEGIN: Search */}
          <div className="relative mr-3 intro-x sm:mr-6">
            <div className="hidden search sm:block">
              <FormInput
                type="text"
                className="border-transparent w-56 shadow-none rounded-full bg-slate-200 pr-8 transition-[width] duration-300 ease-in-out focus:border-transparent focus:w-72 dark:bg-darkmode-400/70"
                placeholder="Search..."
                onFocus={showSearchDropdown}
                onBlur={hideSearchDropdown}
              />
              <Lucide
                icon="Search"
                className="absolute inset-y-0 right-0 w-5 h-5 my-auto mr-3 text-slate-600 dark:text-slate-500"
              />
            </div>
            <a className="relative text-white/70 sm:hidden" href="">
              <Lucide icon="Search" className="w-5 h-5 dark:text-slate-500" />
            </a>
          </div>
          {/* END: Search */}
          {/* BEGIN: Notifications */}
          {/* BEGIN: Notifications */}
      <Popover className="mr-4 intro-x sm:mr-6">
        <Popover.Button
          className={`
            relative text-white/70 outline-none block
            ${notification.length > 0 ? 'before:content-[\'\'] before:w-[8px] before:h-[8px] before:rounded-full before:absolute before:top-[-2px] before:right-0 before:bg-danger' : ''}
          `}
        >
          <Lucide icon="Bell" className="w-5 h-5 dark:text-slate-500" />
        </Popover.Button>
        <Popover.Panel className="w-[280px] sm:w-[350px] p-5 mt-2">
          <div className="mb-5 font-medium">Notifications</div>
          
        </Popover.Panel>
      </Popover>
      {/* END: Notifications */}
          {/* END: Notifications */}

          {/* BEGIN: Account Menu */}
          <Menu>
            <Menu.Button className="block w-8 h-8 overflow-hidden scale-110 rounded-full shadow-lg image-fit zoom-in intro-x">
              <img
                alt="Midone Tailwind HTML Admin Template"
                src={fakerData[9].photos[0]}
              />
            </Menu.Button>
            <Menu.Items className="w-56 mt-px relative bg-primary/80 before:block before:absolute before:bg-black before:inset-0 before:rounded-md before:z-[-1] text-white">
              <Menu.Header className="font-normal">
                <div className="font-medium">{fakerData[0].users[0].name}</div>
                <div className="text-xs text-white/70 mt-0.5 dark:text-slate-500">
                  {fakerData[0].jobs[0]}
                </div>
              </Menu.Header>
              <Menu.Divider className="bg-white/[0.08]" />
              <Menu.Item className="hover:bg-white/5">
                <Lucide icon="User" className="w-4 h-4 mr-2" /> Profile
              </Menu.Item>
              <Menu.Item className="hover:bg-white/5">
                <Lucide icon="Edit" className="w-4 h-4 mr-2" /> Add Account
 

                </Menu.Item>
                <Menu.Item className="hover:bg-white/5">
                  <Lucide icon="Lock" className="w-4 h-4 mr-2" /> Reset Password
                </Menu.Item>
                <Menu.Item className="hover:bg-white/5">
                  <Lucide icon="HelpCircle" className="w-4 h-4 mr-2" /> Help
                </Menu.Item>
                <Menu.Divider className="bg-white/[0.08]" />
                <Menu.Item className="hover:bg-white/5">
                  <Lucide icon="ToggleRight" className="w-4 h-4 mr-2" /> Logout
                </Menu.Item>
              </Menu.Items>
            </Menu>
            {/* END: Account Menu */}
          </div>
        </div>
        {/* END: Top Bar */}
      </>
    );
  }
  
  export default Main;