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
      // ��������� ����� ��䳿, ��� ������ ����������
      eventToEdit = event;
      // ³���������� ������� ��䳿 ��� ���� �� ��
      jQuery('.event-title').html(event.title);

      // �������� �������� ����
      if (event.start.hasTime()) {
        // ³���������� ������� ��䳿 � �����
        jQuery('.event-body').html('<p><strong>Date:</strong> ' + event.start.format('YYYY-MM-DD') + '</p>' + // ����������� ����
          '<p><strong>Start Time:</strong> ' + event.start.format('HH:mm') + '</p>' + // ����������� ����������� ����
          '<p><strong>End Time:</strong> ' + event.end.format('HH:mm') + '</p>' + // ����������� �������� ����
          '<p><strong>Description:</strong> ' + event.description + '</p>'); // ����������� �����
      } else {
        // ³���������� ������� ��䳿 ��� ����
        jQuery('.event-body').html('<p><strong>Date:</strong> ' + event.start.format('YYYY-MM-DD') + '</p>' + // ����������� ����
          '<p><strong>Description:</strong> ' + event.description + '</p>'); // ����������� �����
      }

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

  // ������� ��� ������������ ���� � localStorage
  function loadEvents() {
    return JSON.parse(localStorage.getItem('events')) || [];
  }

  // ����, ��� ���������� ��� ���� �� ������ "����������"
  jQuery('.edit-event').click(function () {
    // ������������ ������� ���� ����� ����������� ��䳿 �� ����� ����� ��䳿, ��� ������ ����������
    jQuery('input[name="edit-ename"]').val(eventToEdit.title);
    jQuery('input[name="edit-edate"]').val(eventToEdit.start.format('YYYY-MM-DD'));
    jQuery('input[name="edit-estarttime"]').val(eventToEdit.start.format('HH:mm'));
    jQuery('input[name="edit-eendtime"]').val(eventToEdit.end.format('HH:mm'));
    jQuery('textarea[name="edit-edesc"]').val(eventToEdit.description);

    // ³������� ���������� ���� ��� ����������� ��䳿
    jQuery('#modal-edit-event').modal('show');
  });


  // ������������ ���� ��� ����������� �������
  const savedEvents = loadEvents();
  savedEvents.forEach(function (eventData) {
    jQuery('#calendar').fullCalendar('renderEvent', eventData, true);
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
    const startDateTime = editedEventData.start + 'T' + editedEventData.startTime;
    const endDateTime = editedEventData.start + 'T' + editedEventData.endTime;

    // ��������� ����� ��䳿 � ��������
    eventToEdit.title = editedEventData.title;
    eventToEdit.start = startDateTime;
    eventToEdit.end = endDateTime;
    eventToEdit.description = editedEventData.description;
    jQuery('#calendar').fullCalendar('updateEvent', eventToEdit);

    // console.log("Updated Event ID:", eventToEdit.id);

    // �������� ���������� ���� ��� ����������� ��䳿
    jQuery('#modal-edit-event').modal('hide');

    // localStorage.removeItem('events');

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
      events[index] = updatedEvent;
      // console.log("Updated Events Array:", events); 
      localStorage.setItem('events', JSON.stringify(events));
    }
  }

});








