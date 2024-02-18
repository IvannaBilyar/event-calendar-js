import './style.css';

jQuery(document).ready(function () {
  let eventToEdit;
  let userEvents = [];

  let stateHolidays = generateHolidays(2024, 10);
  function generateHolidays(startYear, numberOfYears) {
    let holidays = [];
    for (let i = 0; i < numberOfYears; i++) {
      let year = startYear + i;
      holidays.push(
        { title: 'New Year', start: year + '-01-01', end: year + '-01-01', editable: false },
        { title: 'International Womens Day', start: year + '-03-08', end: year + '-03-08', editable: false },
        { title: 'Labor Day', start: year + '-05-01', end: year + '-05-01', editable: false },
        { title: 'The Constitution Day of Ukraine', start: year + '-06-28', end: year + '-06-28', editable: false },
        { title: 'Ukrainian Statehood Day', start: year + '-07-15', end: year + '-07-15', editable: false },
        { title: 'Independence Day', start: year + '-08-24', end: year + '-08-24', editable: false },
        { title: 'Day of Defenders of Ukraine', start: year + '-10-01', end: year + '-10-01', editable: false },
        { title: 'Christmas', start: year + '-12-25', end: year + '-12-25', editable: false }
      );
    }
    return holidays;
  }

  // Initializing the datetimepicker to select the date and time
  jQuery('.datetimepicker').datepicker({
    timepicker: true,
    language: 'en',
    range: true,
    multipleDates: true,
    multipleDatesSeparator: " - "
  });

  // Initializing the calendar
  jQuery('#calendar').fullCalendar({
    // Calendar settings...
    themeSystem: 'bootstrap4',
    businessHours: false,
    defaultView: 'month',
    editable: true,
    selectable: true,
    header: {
      left: 'prev,next today',
      center: 'title',
      right: 'month,agendaWeek,agendaDay'
    },
    dayClick: function (date, jsEvent, view) {
      const clickedDate = date.format('YYYY-MM-DD');
      const isStateHoliday = isDateStateHoliday(clickedDate);
      if (isStateHoliday) {
        if (!confirm('This day is a state holiday. Are you sure you want to add an event?')) {
          return;
        }
      }
      jQuery('input[name="edate"]').val(clickedDate);
      jQuery('#modal-view-event-add').modal('show');
    },

    eventClick: function (event, jsEvent, view) {
      const isStateHoliday = isDateStateHoliday(event.start.format('YYYY-MM-DD'));
      if (!isStateHoliday) {
        jQuery('.event-title').html(event.title);
        let eventDetails = '';

        if (event.start) {
          eventDetails += '<p><strong>Date:</strong> ' + event.start.format('YYYY-MM-DD') + '</p>';
          if (event.start.hasTime()) {
            eventDetails += '<p><strong>Start Time:</strong> ' + event.start.format('HH:mm') + '</p>' +
              '<p><strong>End Time:</strong> ' + event.end.format('HH:mm') + '</p>';
          }
        }
        eventDetails += '<p><strong>Description:</strong> ' + event.description + '</p>';
        jQuery('.event-body').html(eventDetails);
        eventToEdit = event;
        jQuery('#modal-view-event').modal('show');
      }
    },
    select: function (start, end, jsEvent, view) {
      // Block the ability to select areas on the calendar if the selected event has a time
      if (eventToEdit && eventToEdit.start.hasTime()) {
        jQuery('#calendar').fullCalendar('unselect');
      }
    },
    eventRender: function (event, element) {
      // Disable event editing for state holidays
      if (event.editable === false) {
        element.addClass('state-holiday');
      }
    },
    events: function (start, end, timezone, callback) {
      let allEvents = userEvents.concat(stateHolidays);
      callback(allEvents);
    }
  });

  // Function for generating a unique identifier
  function generateEventId() {
    return Date.now().toString();
  }

  // The event that occurs when the event add form is submitted
  jQuery("#add-event").submit(function (event) {
    event.preventDefault();
    const eventId = generateEventId();
    const eventName = jQuery('input[name="ename"]').val().trim();
    const eventDate = jQuery('input[name="edate"]').val().trim();
    const eventStartTime = jQuery('input[name="estarttime"]').val().trim();
    const eventEndTime = jQuery('input[name="eendtime"]').val().trim();
    let startDateTime, endDateTime;
    if (eventStartTime && eventEndTime) {
      startDateTime = eventDate + 'T' + eventStartTime;
      endDateTime = eventDate + 'T' + eventEndTime;
    } else {
      startDateTime = eventDate;
      endDateTime = eventDate;
    }

    // Add the event to the calendar with the generated ID and time
    const eventData = {
      id: eventId,
      title: eventName,
      start: startDateTime,
      end: endDateTime,
      description: jQuery('textarea[name="edesc"]').val(),
      editable: true // Allow editing for user events
    };
    jQuery('#calendar').fullCalendar('renderEvent', eventData, true);

    jQuery('#add-event')[0].reset();

    jQuery('#modal-view-event-add').modal('hide');

    saveEvent(eventData);
  });

  // Function to save events to localStorage
  function saveEvent(eventData) {
    const events = JSON.parse(localStorage.getItem('events')) || [];
    events.push(eventData);
    localStorage.setItem('events', JSON.stringify(events));
  }

  // Loading events when the page loads
  const savedEvents = loadEvents();
  savedEvents.forEach(function (eventData) {
    if (eventData.start.includes('T')) {
      jQuery('#calendar').fullCalendar('renderEvent', eventData, true);
    } else {
      eventData.allDay = true;
      jQuery('#calendar').fullCalendar('renderEvent', eventData, true);
    }
  });

  // Function for loading events from localStorage
  function loadEvents() {
    return JSON.parse(localStorage.getItem('events')) || [];
  }

  // The event that occurs when you click on the "Edit" button
  jQuery('.edit-event').click(function () {
    const isStateHoliday = isDateStateHoliday(eventToEdit.start.format('YYYY-MM-DD'));
    if (!isStateHoliday) {
      jQuery('input[name="edit-ename"]').val(eventToEdit.title);
      jQuery('input[name="edit-edate"]').val(eventToEdit.start ? eventToEdit.start.format('YYYY-MM-DD') : '');
      jQuery('input[name="edit-estarttime"]').val(eventToEdit.start && eventToEdit.start.hasTime() ? eventToEdit.start.format('HH:mm') : '');
      jQuery('input[name="edit-eendtime"]').val(eventToEdit.end && eventToEdit.start.hasTime() ? eventToEdit.end.format('HH:mm') : '');
      jQuery('textarea[name="edit-edesc"]').val(eventToEdit.description);

      jQuery('#modal-edit-event').modal('show');
    }
  });

  // The event that occurs when the event edit form is submitted
  jQuery("#edit-event").submit(function (event) {
    event.preventDefault();
    const editedEventData = {
      title: jQuery('input[name="edit-ename"]').val(),
      start: jQuery('input[name="edit-edate"]').val(),
      startTime: jQuery('input[name="edit-estarttime"]').val(),
      endTime: jQuery('input[name="edit-eendtime"]').val(),
      description: jQuery('textarea[name="edit-edesc"]').val()
    };

    let startDateTime, endDateTime;
    if (editedEventData.startTime && editedEventData.endTime) {
      startDateTime = editedEventData.start + 'T' + editedEventData.startTime;
      endDateTime = editedEventData.start + 'T' + editedEventData.endTime;
    } else {
      startDateTime = editedEventData.start;
      endDateTime = editedEventData.start;
    }

    eventToEdit.title = editedEventData.title;
    eventToEdit.start = startDateTime;
    eventToEdit.end = endDateTime;
    eventToEdit.description = editedEventData.description;
    jQuery('#calendar').fullCalendar('updateEvent', eventToEdit);

    jQuery('#modal-edit-event').modal('hide');
    jQuery('#modal-view-event').modal('hide');

    updateEventInLocalStorage(eventToEdit);
  });

  // Function for updating an event in localStorage
  function updateEventInLocalStorage(updatedEvent) {
    const events = JSON.parse(localStorage.getItem('events')) || [];
    const eventId = updatedEvent.id;
    const index = events.findIndex(function (event) {
      return event.id === eventId;
    });
    if (index !== -1) {
      events[index] = {
        id: eventId,
        title: updatedEvent.title,
        start: updatedEvent.start,
        end: updatedEvent.end,
        description: updatedEvent.description
      };
      localStorage.setItem('events', JSON.stringify(events));
    }
  }

  // The event that occurs when you click the "Delete" button
  jQuery('.delete-event').click(function () {
    const isStateHoliday = isDateStateHoliday(eventToEdit.start.format('YYYY-MM-DD'));
    if (!isStateHoliday) {
      if (eventToEdit) {
        if (confirm('Are you sure you want to delete this event?')) {
          jQuery('#calendar').fullCalendar('removeEvents', eventToEdit.id);
          deleteEventFromLocalStorage(eventToEdit.id);
          jQuery('#modal-view-event').modal('hide');
        }
      }
    }
  });

  // Function for deleting an event from localStorage
  function deleteEventFromLocalStorage(eventId) {
    const events = JSON.parse(localStorage.getItem('events')) || [];
    const index = events.findIndex(function (event) {
      return event.id === eventId;
    });
    if (index !== -1) {
      events.splice(index, 1);
      localStorage.setItem('events', JSON.stringify(events));
    }
  }

  // Function to check if a date is a state holiday
  function isDateStateHoliday(date) {
    for (let i = 0; i < stateHolidays.length; i++) {
      if (stateHolidays[i].start === date) {
        return true;
      }
    }
    return false;
  }

  //Function performed when entering text in the search field
  jQuery('#search-input').on('input', function () {
    const searchText = jQuery(this).val().trim().toLowerCase();
    // console.log('Search text:', searchText);
    const matchedEvents = searchEvents(searchText);
    // console.log('Matched events:', matchedEvents);
    displaySearchResults(matchedEvents);
  });

  // Search function for events by name or description
  function searchEvents(searchText) {
    const allEvents = jQuery('#calendar').fullCalendar('clientEvents');
    return allEvents.filter(function (event) {
      return event.title.toLowerCase().includes(searchText.toLowerCase()) || (event.description && event.description.toLowerCase().includes(searchText.toLowerCase()));
    });
  }

  // Function for displaying search results
  function displaySearchResults(events) {
    const searchResultsList = jQuery('#search-results');
    searchResultsList.empty();

    // console.log('Events found:', events);

    if (jQuery('#search-input').val().trim() === '') {
      return;
    }

    if (events.length > 0) {
      events.forEach(function (event) {
        const listItem = '<li>' +
          '<strong>' + event.title + '</strong><br>' +
          'Date: ' + event.start.format('YYYY-MM-DD') + '<br>' +
          'Time: ' + (event.start.hasTime() ? event.start.format('HH:mm') + ' - ' + event.end.format('HH:mm') : 'All day') +
          '</li>';
        searchResultsList.append(listItem);
      });
    } else {
      searchResultsList.append('<li>No events found</li>');
    }
  }
});










