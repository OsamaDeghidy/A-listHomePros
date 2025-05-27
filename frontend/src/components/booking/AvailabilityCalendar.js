import React, { useState, useEffect } from 'react';
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isToday, addWeeks, subWeeks } from 'date-fns';
import { ar } from 'date-fns/locale';
import { FaChevronLeft, FaChevronRight, FaCalendarAlt, FaClock } from 'react-icons/fa';
import { useSchedulingService } from '../../hooks/useSchedulingService';

const AvailabilityCalendar = ({ 
  alistproId, 
  onTimeSelected, 
  minDate = new Date(),
  maxDaysAhead = 30,
  selectedDate = null,
  selectedTime = null
}) => {
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [availableDays, setAvailableDays] = useState([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [selectedDay, setSelectedDay] = useState(selectedDate || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { getAvailability } = useSchedulingService();

  // Generate days for the current week view
  const daysInWeek = eachDayOfInterval({
    start: currentWeekStart,
    end: endOfWeek(currentWeekStart, { weekStartsOn: 1 })
  });

  // Fetch available days for the selected provider
  useEffect(() => {
    const fetchAvailableDays = async () => {
      if (!alistproId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Fetch availability data for the next 30 days
        const endDate = addDays(new Date(), maxDaysAhead);
        const response = await getAvailability(alistproId, format(new Date(), 'yyyy-MM-dd'), format(endDate, 'yyyy-MM-dd'));
        
        if (response && response.available_days) {
          // Parse the available days into Date objects
          const availableDatesArray = response.available_days.map(day => new Date(day));
          setAvailableDays(availableDatesArray);
          
          // If there's a selected date already, fetch time slots for it
          if (selectedDate) {
            fetchTimeSlotsForDay(selectedDate);
          }
        } else {
          setAvailableDays([]);
        }
      } catch (err) {
        console.error('Error fetching availability:', err);
        setError('Failed to load availability data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAvailableDays();
  }, [alistproId, maxDaysAhead, getAvailability, selectedDate]);

  // Fetch time slots for the selected day
  const fetchTimeSlotsForDay = async (date) => {
    if (!alistproId || !date) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const formattedDate = format(date, 'yyyy-MM-dd');
      const response = await getAvailability(alistproId, formattedDate, formattedDate);
      
      if (response && response.time_slots && response.time_slots[formattedDate]) {
        setAvailableTimeSlots(response.time_slots[formattedDate]);
      } else {
        setAvailableTimeSlots([]);
      }
    } catch (err) {
      console.error('Error fetching time slots:', err);
      setError('Failed to load available time slots');
    } finally {
      setLoading(false);
    }
  };

  // Handle date selection
  const handleDateClick = (date) => {
    // Check if the date is available
    const isAvailable = availableDays.some(availableDate => 
      isSameDay(new Date(availableDate), date)
    );
    
    if (isAvailable) {
      setSelectedDay(date);
      fetchTimeSlotsForDay(date);
    }
  };

  // Handle time slot selection
  const handleTimeClick = (time) => {
    if (selectedDay && time) {
      onTimeSelected({
        date: selectedDay,
        time: time,
        formattedDate: format(selectedDay, 'yyyy-MM-dd'),
        formattedTime: time
      });
    }
  };

  // Navigate to previous week
  const goToPreviousWeek = () => {
    const newStart = subWeeks(currentWeekStart, 1);
    // Prevent going to past weeks
    if (newStart >= startOfWeek(new Date(), { weekStartsOn: 1 })) {
      setCurrentWeekStart(newStart);
    }
  };

  // Navigate to next week
  const goToNextWeek = () => {
    const newStart = addWeeks(currentWeekStart, 1);
    // Prevent going too far in the future
    const maxStart = startOfWeek(addDays(new Date(), maxDaysAhead - 7), { weekStartsOn: 1 });
    if (newStart <= maxStart) {
      setCurrentWeekStart(newStart);
    }
  };

  // Check if a day is available
  const isDayAvailable = (date) => {
    return availableDays.some(availableDate => 
      isSameDay(new Date(availableDate), date)
    );
  };

  // Render calendar days
  const renderCalendarDays = () => {
    return daysInWeek.map((day, index) => {
      const dayAvailable = isDayAvailable(day);
      const isSelected = selectedDay && isSameDay(day, selectedDay);
      const dayIsToday = isToday(day);
      
      // Determine class names based on state
      let className = "flex flex-col items-center p-2 rounded-md cursor-pointer transition-colors ";
      
      if (isSelected) {
        className += "bg-blue-500 text-white ";
      } else if (dayIsToday) {
        className += "border border-blue-500 ";
      } else {
        className += "hover:bg-gray-100 ";
      }
      
      if (!dayAvailable) {
        className += "opacity-50 cursor-not-allowed ";
      }
      
      return (
        <div 
          key={index} 
          className={className}
          onClick={() => dayAvailable && handleDateClick(day)}
          aria-label={`${format(day, 'EEEE, MMMM d', { locale: ar })}`}
          aria-selected={isSelected}
          role="button"
        >
          <div className="text-xs uppercase font-semibold">
            {format(day, 'EEE', { locale: ar })}
          </div>
          <div className={`mt-1 ${isSelected ? 'text-white' : (dayIsToday ? 'text-blue-500 font-bold' : '')}`}>
            {format(day, 'd')}
          </div>
        </div>
      );
    });
  };

  // Render time slots
  const renderTimeSlots = () => {
    if (!selectedDay) {
      return (
        <div className="text-center py-8 text-gray-500">
          <FaClock className="mx-auto text-2xl mb-2" />
          <p>Please select a date to view available time slots</p>
        </div>
      );
    }
    
    if (loading) {
      return <div className="text-center py-4">Loading available times...</div>;
    }
    
    if (error) {
      return <div className="text-center py-4 text-red-500">{error}</div>;
    }
    
    if (availableTimeSlots.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <FaClock className="mx-auto text-2xl mb-2" />
          <p>No available time slots for this date</p>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-3 gap-2 mt-4">
        {availableTimeSlots.map((slot, index) => {
          const isSelectedSlot = selectedTime === slot;
          
          return (
            <button
              key={index}
              className={`py-2 px-4 rounded-md text-center transition-colors ${
                isSelectedSlot 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
              }`}
              onClick={() => handleTimeClick(slot)}
              aria-selected={isSelectedSlot}
            >
              {slot}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium flex items-center">
          <FaCalendarAlt className="mr-2 text-blue-500" />
          <span>حجز موعد</span>
        </h3>
        <div className="flex space-x-2">
          <button 
            onClick={goToPreviousWeek}
            className="p-2 rounded-full hover:bg-gray-100"
            aria-label="Previous week"
          >
            <FaChevronRight />
          </button>
          <button 
            onClick={goToNextWeek}
            className="p-2 rounded-full hover:bg-gray-100"
            aria-label="Next week"
          >
            <FaChevronLeft />
          </button>
        </div>
      </div>
      
      {loading && !availableDays.length ? (
        <div className="text-center py-8">Loading availability...</div>
      ) : error && !availableDays.length ? (
        <div className="text-center py-8 text-red-500">{error}</div>
      ) : (
        <>
          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1 mb-6">
            {renderCalendarDays()}
          </div>
          
          {/* Time Slots */}
          <div className="mt-6">
            <h4 className="text-md font-medium mb-3">
              {selectedDay ? (
                <>Available times for {format(selectedDay, 'EEEE, MMMM d', { locale: ar })}</>
              ) : (
                'Select a date to view available times'
              )}
            </h4>
            {renderTimeSlots()}
          </div>
        </>
      )}
    </div>
  );
};

export default AvailabilityCalendar; 