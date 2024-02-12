import './style.css';
// console.log('Hello from index.js');

// document.getElementById("app").innerText = "Text";

jQuery(document).ready(function () {
  // ����� ��� ��������� ����� ��䳿, ��� ������ ����������
  let eventToEdit;

  // ����������� datetimepicker ��� ������ ���� �� ����
  jQuery('.datetimepicker').datepicker({
      timepicker: true,
      language: 'en',
      range: true,
      multipleDates: true,
      multipleDatesSeparator: " - "
  });

  // ����������� ���������
  jQuery('#calendar').fullCalendar({
      // ������������ ���������...
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
          // ��������� ����, �� ��� �������
          const clickedDate = date.format('YYYY-MM-DD');
          // ³������� ���������� ���� ��� ��������� ��䳿
          jQuery('input[name="edate"]').val(clickedDate);
          jQuery('#modal-view-event-add').modal('show');
      },
      eventClick: function (event, jsEvent, view) {
          // ³���������� ������� ��䳿 ��� ���� �� ��
          jQuery('.event-title').html(event.title);

          let eventDetails = ''; // ������� ����� ������� ��䳿

          // �������� �������� ���� � ��䳿
          if (event.start) {
              eventDetails += '<p><strong>Date:</strong> ' + event.start.format('YYYY-MM-DD') + '</p>';

              // �������� �������� ���� � ��䳿
              if (event.start.hasTime()) {
                  // ��������� ����, ���� �� �
                  eventDetails += '<p><strong>Start Time:</strong> ' + event.start.format('HH:mm') + '</p>' +
                      '<p><strong>End Time:</strong> ' + event.end.format('HH:mm') + '</p>';
              }
          }
          // ��������� ����� ��䳿
          eventDetails += '<p><strong>Description:</strong> ' + event.description + '</p>';

          // ³���������� ������� ��䳿
          jQuery('.event-body').html(eventDetails);

          // ��������� ����� ��䳿, ��� ������ ����������
          eventToEdit = event;

          jQuery('#modal-view-event').modal('show');
      },
      select: function (start, end, jsEvent, view) {
          // ������� ��������� ������ �������� �� ��������, ���� ������ ���� �� ���
          if (eventToEdit && eventToEdit.start.hasTime()) {
              jQuery('#calendar').fullCalendar('unselect');
          }
      }
  });

  // ������� ��� ��������� ���������� ��������������
  function generateEventId() {
      return Date.now().toString();
  }

  // ����, ��� ���������� ��� �������� ����� ��������� ��䳿
  jQuery("#add-event").submit(function (event) {
      // ��������� ���������� �������� �����
      event.preventDefault();

      // ��������� ���������� �������������� ��� ���� ��䳿
      const eventId = generateEventId();

      // ��������� ������� � �����
      const eventName = jQuery('input[name="ename"]').val().trim();
      const eventDate = jQuery('input[name="edate"]').val().trim();
      const eventStartTime = jQuery('input[name="estarttime"]').val().trim();
      const eventEndTime = jQuery('input[name="eendtime"]').val().trim();

      // �������� �� �������� ���
      let startDateTime, endDateTime;
      if (eventStartTime && eventEndTime) {
          // ���� �������� ���, ������������� ����
          startDateTime = eventDate + 'T' + eventStartTime;
          endDateTime = eventDate + 'T' + eventEndTime;
      } else {
          // ���� ��� �� ��������, �������� ���� ���� ��� ����
          startDateTime = eventDate;
          endDateTime = eventDate;
      }

      // ������ ���� �� ��������� ����� �� ������������ ��������������� �� �����
      const eventData = {
          id: eventId,
          title: eventName,
          start: startDateTime,
          end: endDateTime,
          description: jQuery('textarea[name="edesc"]').val()
      };
      jQuery('#calendar').fullCalendar('renderEvent', eventData, true);

      // �������� ���� ����� ��� ��������� �������� ��䳿
      jQuery('#add-event')[0].reset();

      // �������� ���������� ����
      jQuery('#modal-view-event-add').modal('hide');

      // ���������� ���� ��䳿 � �������� �������
      saveEvent(eventData);
  });

  // ������� ��� ���������� ���� � localStorage
  function saveEvent(eventData) {
      const events = JSON.parse(localStorage.getItem('events')) || [];
      events.push(eventData);
      localStorage.setItem('events', JSON.stringify(events));
  }

  // ������������ ���� ��� ����������� �������
  const savedEvents = loadEvents();
  savedEvents.forEach(function (eventData) {
      // ����������, �� ���� �� ���
      if (eventData.start.includes('T')) {
          // ���� �� ���, ��������� �� � �����
          jQuery('#calendar').fullCalendar('renderEvent', eventData, true);
      } else {
          // ���� �� �� ����, ��������� �� ���������� ���� (��� ����)
          eventData.allDay = true;
          jQuery('#calendar').fullCalendar('renderEvent', eventData, true);
      }
  });

  // ������� ��� ������������ ���� � localStorage
  function loadEvents() {
      return JSON.parse(localStorage.getItem('events')) || [];
  }

  // ����, ��� ���������� ��� ���� �� ������ "����������"
  jQuery('.edit-event').click(function () {
      // ������������ ������� ���� ����� ����������� ��䳿 �� ����� ����� ��䳿, ��� ������ ����������
      jQuery('input[name="edit-ename"]').val(eventToEdit.title);
      jQuery('input[name="edit-edate"]').val(eventToEdit.start ? eventToEdit.start.format('YYYY-MM-DD') : ''); // ���� ���� ����, ������������ �� ��������
      jQuery('input[name="edit-estarttime"]').val(eventToEdit.start && eventToEdit.start.hasTime() ? eventToEdit.start.format('HH:mm') : ''); // ���� ��� ����, ������������ ���� ��������
      jQuery('input[name="edit-eendtime"]').val(eventToEdit.end && eventToEdit.start.hasTime() ? eventToEdit.end.format('HH:mm') : ''); // ���� ��� ����, ������������ ���� ��������
      jQuery('textarea[name="edit-edesc"]').val(eventToEdit.description);

      // ³������� ���������� ���� ��� ����������� ��䳿
      jQuery('#modal-edit-event').modal('show');
  });

  // ����, ��� ���������� ��� �������� ����� ����������� ��䳿
  jQuery("#edit-event").submit(function (event) {
      // ��������� ���������� �������� �����
      event.preventDefault();

      // ��������� ����� ������� � ����� �����������
      const editedEventData = {
          title: jQuery('input[name="edit-ename"]').val(),
          start: jQuery('input[name="edit-edate"]').val(),
          startTime: jQuery('input[name="edit-estarttime"]').val(),
          endTime: jQuery('input[name="edit-eendtime"]').val(),
          description: jQuery('textarea[name="edit-edesc"]').val()
      };

      // ���������� ������ ���� �� ����
      let startDateTime, endDateTime;
      if (editedEventData.startTime && editedEventData.endTime) {
          startDateTime = editedEventData.start + 'T' + editedEventData.startTime;
          endDateTime = editedEventData.start + 'T' + editedEventData.endTime;
      } else {
          startDateTime = editedEventData.start;
          endDateTime = editedEventData.start;
      }

      // ��������� ����� ��䳿 � ��������
      eventToEdit.title = editedEventData.title;
      eventToEdit.start = startDateTime;
      eventToEdit.end = endDateTime;
      eventToEdit.description = editedEventData.description;
      jQuery('#calendar').fullCalendar('updateEvent', eventToEdit);

      // �������� ���������� ���� ��� ����������� ��䳿
      jQuery('#modal-edit-event').modal('hide');

      // ��������� ����� ��䳿 � ���������� �������
      updateEventInLocalStorage(eventToEdit);
  });

  // ������� ��� ��������� ��䳿 � ���������� �������
  function updateEventInLocalStorage(updatedEvent) {
      const events = JSON.parse(localStorage.getItem('events')) || [];
      const eventId = updatedEvent.id;
      const index = events.findIndex(function (event) {
          return event.id === eventId;
      });
      if (index !== -1) {
          // �������� �������� ���� � ������ id
          events[index] = {
              id: eventId, // ������������� ������ id
              title: updatedEvent.title,
              start: updatedEvent.start,
              end: updatedEvent.end,
              description: updatedEvent.description
          };
          localStorage.setItem('events', JSON.stringify(events));
      }
  }

  // ����, ��� ���������� ��� ��������� �� ������ "��������"
  jQuery('.delete-event').click(function () {
      // �������������, �� � ������ ���� ��� ���������
      if (eventToEdit) {
          // ϳ����������� ��������� �� ��������� ������������ ������������ ��������
          if (confirm('Are you sure?')) {
              // ������� ���� � ���������
              jQuery('#calendar').fullCalendar('removeEvents', eventToEdit.id);
              // ������� ���� � ���������� �������
              deleteEventFromLocalStorage(eventToEdit.id);
              // �������� �������� ����
              jQuery('#modal-view-event').modal('hide');
          }
      }
  });

  // ������� ��� ��������� ��䳿 � ���������� �������
  function deleteEventFromLocalStorage(eventId) {
      const events = JSON.parse(localStorage.getItem('events')) || [];
      const index = events.findIndex(function (event) {
          return event.id === eventId;
      });
      if (index !== -1) {
          // �������� ���� � ������ ����
          events.splice(index, 1);
          localStorage.setItem('events', JSON.stringify(events));
      }
  }

});









