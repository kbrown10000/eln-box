'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Notification {
  id: string;
  title: string;
  message: string;
  link?: string;
  read: number;
  createdAt: Date;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Poll for notifications every 30 seconds
  useEffect(() => {
    const fetchNotifications = async () => {
       try {
           // We need an API route for this if we want client-side polling easily
           // For now, we'll assume there's a server action wrapper or API
           // Let's create a simple API route for GET /api/notifications
           const res = await fetch('/api/notifications');
           if (res.ok) {
               const data = await res.json();
               setNotifications(data);
               setUnreadCount(data.filter((n: Notification) => n.read === 0).length);
           }
       } catch (e) {
           console.error(e);
       }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = async (id: string) => {
      await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: 1 } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <span className="sr-only">View notifications</span>
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full ring-2 ring-white bg-red-500" />
        )}
      </button>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
          <div className="py-1">
            <div className="px-4 py-2 border-b border-gray-100 font-medium text-gray-700">
                Notifications
            </div>
            {notifications.length === 0 ? (
                <div className="px-4 py-4 text-sm text-gray-500 text-center">
                    No notifications
                </div>
            ) : (
                <div className="max-h-96 overflow-y-auto">
                    {notifications.map(notification => (
                        <div key={notification.id} className={`px-4 py-3 hover:bg-gray-50 ${notification.read === 0 ? 'bg-blue-50' : ''}`}>
                            <div className="flex justify-between items-start">
                                <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                                {notification.read === 0 && (
                                    <button onClick={() => handleMarkAsRead(notification.id)} className="text-xs text-blue-600 hover:text-blue-800">
                                        Mark read
                                    </button>
                                )}
                            </div>
                            <p className="text-sm text-gray-500 mt-1">{notification.message}</p>
                            {notification.link && (
                                <Link href={notification.link} className="text-xs text-blue-600 hover:underline mt-2 block">
                                    View Details
                                </Link>
                            )}
                        </div>
                    ))}
                </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
