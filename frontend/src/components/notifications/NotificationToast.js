import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaExclamationTriangle, FaTimes } from 'react-icons/fa';

/**
 * Component for displaying toast notifications
 * 
 * @param {Object} props - Component properties
 * @param {string} props.id - Unique identifier for the notification
 * @param {string} props.message - Notification message
 * @param {string} props.type - Type of notification (success, error, warning, info)
 * @param {function} props.removeNotification - Function to remove the notification
 * @param {boolean} props.autoClose - Whether to automatically close the notification
 * @param {number} props.duration - Duration to display the notification in milliseconds
 */
const NotificationToast = ({ 
  id, 
  message, 
  type = 'info', 
  removeNotification, 
  autoClose = true, 
  duration = 5000 
}) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef(null);
  const animationFrameRef = useRef(null);
  const lastUpdateTimeRef = useRef(Date.now());

  // Set background color based on notification type
  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-100 dark:bg-green-800/30 border-green-400 dark:border-green-700';
      case 'error':
        return 'bg-red-100 dark:bg-red-800/30 border-red-400 dark:border-red-700';
      case 'warning':
        return 'bg-yellow-100 dark:bg-yellow-800/30 border-yellow-400 dark:border-yellow-700';
      case 'info':
      default:
        return 'bg-blue-100 dark:bg-blue-800/30 border-blue-400 dark:border-blue-700';
    }
  };

  // Set text color based on notification type
  const getTextColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-800 dark:text-green-200';
      case 'error':
        return 'text-red-800 dark:text-red-200';
      case 'warning':
        return 'text-yellow-800 dark:text-yellow-200';
      case 'info':
      default:
        return 'text-blue-800 dark:text-blue-200';
    }
  };

  // Set progress bar color based on notification type
  const getProgressBarColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500 dark:bg-green-400';
      case 'error':
        return 'bg-red-500 dark:bg-red-400';
      case 'warning':
        return 'bg-yellow-500 dark:bg-yellow-400';
      case 'info':
      default:
        return 'bg-blue-500 dark:bg-blue-400';
    }
  };

  // Set icon based on notification type
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <FaCheckCircle className="h-5 w-5 text-green-500 dark:text-green-400" />;
      case 'error':
        return <FaExclamationCircle className="h-5 w-5 text-red-500 dark:text-red-400" />;
      case 'warning':
        return <FaExclamationTriangle className="h-5 w-5 text-yellow-500 dark:text-yellow-400" />;
      case 'info':
      default:
        return <FaInfoCircle className="h-5 w-5 text-blue-500 dark:text-blue-400" />;
    }
  };

  // Update countdown timer for notification
  const updateCountdown = useCallback(() => {
    if (isPaused || !autoClose) return;

    const now = Date.now();
    const delta = now - lastUpdateTimeRef.current;
    lastUpdateTimeRef.current = now;

    setTimeLeft(prev => {
      const newTimeLeft = Math.max(0, prev - delta);
      if (newTimeLeft <= 0) {
        clearInterval(intervalRef.current);
        removeNotification(id);
        return 0;
      }
      return newTimeLeft;
    });

    animationFrameRef.current = requestAnimationFrame(updateCountdown);
  }, [id, isPaused, autoClose, removeNotification]);

  // Pause countdown on mouse enter
  const handleMouseEnter = () => {
    setIsPaused(true);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  };

  // Resume countdown on mouse leave
  const handleMouseLeave = () => {
    setIsPaused(false);
    lastUpdateTimeRef.current = Date.now();
    animationFrameRef.current = requestAnimationFrame(updateCountdown);
  };

  // Set up countdown timer on component mount
  useEffect(() => {
    if (autoClose) {
      lastUpdateTimeRef.current = Date.now();
      animationFrameRef.current = requestAnimationFrame(updateCountdown);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [autoClose, updateCountdown]);

  // Calculate remaining time percentage for progress bar
  const progressPercentage = (timeLeft / duration) * 100;

  return (
    <div
      className={`rounded-md border shadow-md max-w-sm w-full overflow-hidden mb-3 animate-slide-up ${getBackgroundColor()}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="alert"
    >
      <div className="flex p-4">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="mr-3 rtl:mr-0 rtl:ml-3 flex-1">
          <p className={`text-sm font-medium ${getTextColor()}`}>{message}</p>
        </div>
        <button
          onClick={() => removeNotification(id)}
          className={`ml-auto -mx-1.5 -my-1.5 rounded-lg p-1.5 inline-flex items-center justify-center h-8 w-8 ${getTextColor()} hover:bg-gray-100 dark:hover:bg-gray-700 focus:ring-2 focus:ring-gray-300`}
        >
          <FaTimes className="w-4 h-4" />
          <span className="sr-only">Close</span>
        </button>
      </div>
      {autoClose && (
        <div className="h-1 w-full bg-gray-200 dark:bg-gray-700">
          <div
            className={`h-1 ${getProgressBarColor()}`}
            style={{ width: `${progressPercentage}%`, transition: isPaused ? 'none' : 'width 0.3s linear' }}
          />
        </div>
      )}
    </div>
  );
};

export default NotificationToast; 