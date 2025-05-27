import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '../hooks/useAuth';
import { messagingService } from '../services/api';
import { FaInbox, FaUserCircle, FaPaperPlane, FaEllipsisV, FaSearch, FaPaperclip, FaRegSmile } from 'react-icons/fa';

const MessagesPage = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const messageEndRef = useRef(null);
  const chatWindowRef = useRef(null);

  // Fetch conversations on component mount
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        // In a production environment, this would call the API
        // const response = await messagingService.getConversations();
        // setConversations(response.data);
        
        // For demonstration, using mock data
        const mockConversations = getMockConversations();
        setConversations(mockConversations);
        
        if (mockConversations.length > 0) {
          setActiveConversation(mockConversations[0]);
          // Fetch messages for the first conversation
          fetchMessages(mockConversations[0].id);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching conversations:', err);
        setError('Failed to load conversations. Please try again.');
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

  // Fetch messages for a conversation
  const fetchMessages = async (conversationId) => {
    try {
      // In a production environment, this would call the API
      // const response = await messagingService.getMessages(conversationId);
      // setMessages(response.data);
      
      // For demonstration, using mock data
      setMessages(getMockMessages(conversationId));
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Failed to load messages. Please try again.');
    }
  };

  // Auto-scroll to the latest message
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Handle conversation selection
  const handleConversationSelect = (conversation) => {
    setActiveConversation(conversation);
    fetchMessages(conversation.id);
  };

  // Handle sending a new message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation) return;

    const messageData = {
      content: newMessage,
      conversation_id: activeConversation.id,
      timestamp: new Date().toISOString()
    };

    try {
      // In a production environment, this would call the API
      // await messagingService.sendMessage(activeConversation.id, { content: newMessage });
      
      // For demonstration, adding message locally
      const newMessageObj = {
        id: Math.floor(Math.random() * 1000),
        sender: {
          id: user?.id || 1,
          name: user?.name || 'You',
          avatar: user?.avatar || 'https://randomuser.me/api/portraits/men/1.jpg',
          isCurrentUser: true
        },
        content: newMessage,
        timestamp: new Date().toISOString(),
        read: true
      };
      
      setMessages([...messages, newMessageObj]);
      setNewMessage('');
      
      // Update the conversation with the latest message
      const updatedConversations = conversations.map(conv => 
        conv.id === activeConversation.id 
          ? { ...conv, lastMessage: newMessage, timestamp: new Date().toISOString() }
          : conv
      );
      
      setConversations(updatedConversations);
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
    }
  };

  // Format timestamp to readable format
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // If message is from today, show time only
    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // If message is from yesterday, show "Yesterday"
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    
    // Otherwise show date
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  // Filter conversations based on search term
  const filteredConversations = conversations.filter(conversation => {
    return conversation.participant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           (conversation.lastMessage && conversation.lastMessage.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  // Mock data for conversations
  const getMockConversations = () => [
    {
      id: 1,
      participant: {
        id: 101,
        name: 'John Smith',
        profession: 'Plumber',
        avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      },
      lastMessage: "I will be there at 3 PM tomorrow as scheduled.",
      timestamp: '2023-08-14T14:30:00',
      unread: 0
    },
    {
      id: 2,
      participant: {
        id: 102,
        name: 'Sarah Johnson',
        profession: 'Electrician',
        avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
      },
      lastMessage: "Do you have another issue with the wiring?",
      timestamp: '2023-08-13T09:15:00',
      unread: 2
    },
    {
      id: 3,
      participant: {
        id: 103,
        name: 'Mike Anderson',
        profession: 'Carpenter',
        avatar: 'https://randomuser.me/api/portraits/men/46.jpg',
      },
      lastMessage: "The shelves are complete. Please let me know when you can inspect them.",
      timestamp: '2023-08-12T16:45:00',
      unread: 0
    },
    {
      id: 4,
      participant: {
        id: 104,
        name: 'Emily Rodriguez',
        profession: 'Painter',
        avatar: 'https://randomuser.me/api/portraits/women/65.jpg',
      },
      lastMessage: "I have sent you the color options for your review.",
      timestamp: '2023-08-10T11:20:00',
      unread: 1
    },
    {
      id: 5,
      participant: {
        id: 105,
        name: 'David Chen',
        profession: 'HVAC Technician',
        avatar: 'https://randomuser.me/api/portraits/men/22.jpg',
      },
      lastMessage: "Your AC unit is working fine now, but it needs a filter replacement soon.",
      timestamp: '2023-08-08T13:50:00',
      unread: 0
    }
  ];

  // Mock data for messages in a conversation
  const getMockMessages = (conversationId) => {
    const conversation = conversations.find(c => c.id === conversationId);
    if (!conversation) return [];
    
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    switch(conversationId) {
      case 1: // John Smith (Plumber)
        return [
          {
            id: 101,
            sender: {
              id: user?.id || 1,
              name: user?.name || 'You',
              avatar: user?.avatar || 'https://randomuser.me/api/portraits/men/1.jpg',
              isCurrentUser: true
            },
            content: 'Hi John, I have a leaking faucet in the kitchen. Can you help?',
            timestamp: yesterday.toISOString(),
            read: true
          },
          {
            id: 102,
            sender: {
              id: 101,
              name: 'John Smith',
              avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
              isCurrentUser: false
            },
            content: 'Hello! I would be happy to help with your leaking faucet. Can you provide more details about the issue?',
            timestamp: yesterday.toISOString(),
            read: true
          },
          {
            id: 103,
            sender: {
              id: user?.id || 1,
              name: user?.name || 'You',
              avatar: user?.avatar || 'https://randomuser.me/api/portraits/men/1.jpg',
              isCurrentUser: true
            },
            content: 'It is dripping constantly, and I have tried tightening the handle, but it has not helped.',
            timestamp: yesterday.toISOString(),
            read: true
          },
          {
            id: 104,
            sender: {
              id: 101,
              name: 'John Smith',
              avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
              isCurrentUser: false
            },
            content: 'Sounds like a worn-out washer or cartridge. I can come take a look tomorrow at 3 PM if that works for you?',
            timestamp: yesterday.toISOString(),
            read: true
          },
          {
            id: 105,
            sender: {
              id: user?.id || 1,
              name: user?.name || 'You',
              avatar: user?.avatar || 'https://randomuser.me/api/portraits/men/1.jpg',
              isCurrentUser: true
            },
            content: '3 PM tomorrow works perfectly. How much will it cost?',
            timestamp: yesterday.toISOString(),
            read: true
          },
          {
            id: 106,
            sender: {
              id: 101,
              name: 'John Smith',
              avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
              isCurrentUser: false
            },
            content: 'The service call is $75, and depending on the parts needed, it could be another $20-50. I will give you a firm quote once I see the issue.',
            timestamp: today.toISOString(),
            read: true
          },
          {
            id: 107,
            sender: {
              id: user?.id || 1,
              name: user?.name || 'You',
              avatar: user?.avatar || 'https://randomuser.me/api/portraits/men/1.jpg',
              isCurrentUser: true
            },
            content: 'That sounds reasonable. Do I need to prepare anything before you arrive?',
            timestamp: today.toISOString(),
            read: true
          },
          {
            id: 108,
            sender: {
              id: 101,
              name: 'John Smith',
              avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
              isCurrentUser: false
            },
            content: 'I will be there at 3 PM tomorrow as scheduled.',
            timestamp: today.toISOString(),
            read: true
          }
        ];
      case 2: // Sarah Johnson (Electrician)
        return [
          {
            id: 201,
            sender: {
              id: 102,
              name: 'Sarah Johnson',
              avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
              isCurrentUser: false
            },
            content: 'I completed the wiring in your home office yesterday. How is everything working?',
            timestamp: '2023-08-12T10:30:00',
            read: true
          },
          {
            id: 202,
            sender: {
              id: user?.id || 1,
              name: user?.name || 'You',
              avatar: user?.avatar || 'https://randomuser.me/api/portraits/men/1.jpg',
              isCurrentUser: true
            },
            content: 'Everything works great! The outlets and lighting are perfect.',
            timestamp: '2023-08-12T11:45:00',
            read: true
          },
          {
            id: 203,
            sender: {
              id: 102,
              name: 'Sarah Johnson',
              avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
              isCurrentUser: false
            },
            content: 'Great to hear! If you have any issues or need any other electrical work, just let me know.',
            timestamp: '2023-08-12T12:15:00',
            read: true
          },
          {
            id: 204,
            sender: {
              id: 102,
              name: 'Sarah Johnson',
              avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
              isCurrentUser: false
            },
            content: 'Do you have another issue with the wiring?',
            timestamp: '2023-08-13T09:15:00',
            read: false
          }
        ];
      default:
        return [];
    }
  };

  return (
    <>
      <Helmet>
        <title>Messages | A-List Home Pros</title>
      </Helmet>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Messages</h1>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-3">
            {/* Conversations List */}
            <div className="border-r border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <FaSearch className="absolute left-3 top-3 text-gray-400" />
                </div>
              </div>
              
              <div className="overflow-y-auto" style={{ maxHeight: '600px' }}>
                {loading ? (
                  <div className="flex justify-center items-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    <FaInbox className="mx-auto text-gray-300 text-4xl mb-2" />
                    <p>No conversations found</p>
                  </div>
                ) : (
                  filteredConversations.map((conversation) => (
                    <div 
                      key={conversation.id}
                      className={`p-4 border-b border-gray-200 hover:bg-gray-50 cursor-pointer ${activeConversation?.id === conversation.id ? 'bg-blue-50' : ''}`}
                      onClick={() => handleConversationSelect(conversation)}
                    >
                      <div className="flex items-start">
                        <div className="relative">
                          <img 
                            src={conversation.participant.avatar} 
                            alt={conversation.participant.name}
                            className="w-12 h-12 rounded-full mr-4 object-cover"
                          />
                          {conversation.unread > 0 && (
                            <span className="absolute top-0 right-3 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                              {conversation.unread}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between">
                            <h3 className="font-semibold truncate">{conversation.participant.name}</h3>
                            <span className="text-xs text-gray-500">{formatTimestamp(conversation.timestamp)}</span>
                          </div>
                          <p className="text-sm text-gray-600 truncate">{conversation.lastMessage}</p>
                          <span className="text-xs text-gray-400">{conversation.participant.profession}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            {/* Chat Window */}
            <div className="md:col-span-2 flex flex-col h-[700px]">
              {activeConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                    <div className="flex items-center">
                      <img 
                        src={activeConversation.participant.avatar} 
                        alt={activeConversation.participant.name}
                        className="w-10 h-10 rounded-full mr-3 object-cover"
                      />
                      <div>
                        <h3 className="font-semibold">{activeConversation.participant.name}</h3>
                        <p className="text-xs text-gray-500">{activeConversation.participant.profession}</p>
                      </div>
                    </div>
                    <button className="text-gray-500 hover:text-gray-700">
                      <FaEllipsisV />
                    </button>
                  </div>
                  
                  {/* Messages */}
                  <div className="flex-1 p-4 overflow-y-auto bg-gray-50" ref={chatWindowRef}>
                    {messages.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-gray-500">
                        <FaUserCircle className="text-5xl mb-3 text-gray-300" />
                        <p>No messages yet</p>
                        <p className="text-sm">Send a message to start the conversation</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${message.sender.isCurrentUser ? 'justify-end' : 'justify-start'}`}
                          >
                            {!message.sender.isCurrentUser && (
                              <img 
                                src={message.sender.avatar} 
                                alt={message.sender.name}
                                className="w-8 h-8 rounded-full mr-2 self-end object-cover"
                              />
                            )}
                            <div>
                              <div 
                                className={`rounded-lg px-4 py-2 max-w-xs lg:max-w-md ${
                                  message.sender.isCurrentUser 
                                    ? 'bg-blue-600 text-white rounded-br-none' 
                                    : 'bg-white text-gray-800 rounded-bl-none shadow-sm'
                                }`}
                              >
                                <p>{message.content}</p>
                              </div>
                              <div className={`text-xs mt-1 ${message.sender.isCurrentUser ? 'text-right' : ''} text-gray-500`}>
                                {formatTimestamp(message.timestamp)}
                                {message.sender.isCurrentUser && (
                                  <span className="ml-2">
                                    {message.read ? 'Read' : 'Sent'}
                                  </span>
                                )}
                              </div>
                            </div>
                            {message.sender.isCurrentUser && (
                              <img 
                                src={message.sender.avatar} 
                                alt={message.sender.name}
                                className="w-8 h-8 rounded-full ml-2 self-end object-cover"
                              />
                            )}
                          </div>
                        ))}
                        <div ref={messageEndRef} />
                      </div>
                    )}
                  </div>
                  
                  {/* Message Input */}
                  <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-200 bg-white">
                    <div className="flex items-center">
                      <button 
                        type="button"
                        className="p-2 text-gray-500 hover:text-gray-700"
                        title="Attach file"
                      >
                        <FaPaperclip />
                      </button>
                      <input
                        type="text"
                        placeholder="Type a message..."
                        className="flex-1 border border-gray-300 rounded-full px-4 py-2 mx-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                      />
                      <button 
                        type="button"
                        className="p-2 text-gray-500 hover:text-gray-700 mr-2"
                        title="Add emoji"
                      >
                        <FaRegSmile />
                      </button>
                      <button
                        type="submit"
                        className={`p-2 rounded-full ${newMessage.trim() ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
                        disabled={!newMessage.trim()}
                      >
                        <FaPaperPlane />
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-500">
                  <FaInbox className="text-5xl mb-3 text-gray-300" />
                  <p>Select a conversation</p>
                  <p className="text-sm">Choose a conversation from the list to start messaging</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MessagesPage; 