import './style.css';
// console.log('Hello from index.js');

// document.getElementById("app").innerText = "Text";

jQuery(document).ready(function () {
  // змінна для зберігання даних події, яку будемо редагувати
  let eventToEdit;

  // Ініціалізація datetimepicker для вибору дати та часу
  jQuery('.datetimepicker').datepicker({
    timepicker: true,
    language: 'en',
    range: true,
    multipleDates: true,
    multipleDatesSeparator: " - "
  });

  // Ініціалізація календаря
  jQuery('#calendar').fullCalendar({
    // налаштування календаря...
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
      // Отримання дати, на яку клікнули
      const clickedDate = date.format('YYYY-MM-DD');
      // Відкриття модального вікна для додавання події
      jQuery('input[name="edate"]').val(clickedDate);
      jQuery('#modal-view-event-add').modal('show');
    },
    eventClick: function (event, jsEvent, view) {
      // Зберігання даних події, яку будемо редагувати
      eventToEdit = event;
      // Відображення деталей події при кліку на неї
      jQuery('.event-title').html(event.title);

      // Перевірка наявності часу
      if (event.start.hasTime()) {
        // Відображення деталей події з часом
        jQuery('.event-body').html('<p><strong>Date:</strong> ' + event.start.format('YYYY-MM-DD') + '</p>' + // відображення дати
          '<p><strong>Start Time:</strong> ' + event.start.format('HH:mm') + '</p>' + // відображення початкового часу
          '<p><strong>End Time:</strong> ' + event.end.format('HH:mm') + '</p>' + // відображення кінцевого часу
          '<p><strong>Description:</strong> ' + event.description + '</p>'); // відображення опису
      } else {
        // Відображення деталей події без часу
        jQuery('.event-body').html('<p><strong>Date:</strong> ' + event.start.format('YYYY-MM-DD') + '</p>' + // відображення дати
          '<p><strong>Description:</strong> ' + event.description + '</p>'); // відображення опису
      }

      jQuery('#modal-view-event').modal('show');
    },
    select: function (start, end, jsEvent, view) {
      // Блокуємо можливість вибору областей на календарі, якщо обрана подія має час
      if (eventToEdit && eventToEdit.start.hasTime()) {
        jQuery('#calendar').fullCalendar('unselect');
      }
    }
  });

  // Функція для генерації унікального ідентифікатора
  function generateEventId() {
    return Date.now().toString();
  }


  // Подія, яка відбувається при відправці форми додавання події
  jQuery("#add-event").submit(function (event) {
    // Зупиняємо стандартну поведінку форми
    event.preventDefault();

    // Генерація унікального ідентифікатора для нової події
    const eventId = generateEventId();

    // Отримання значень з форми
    const eventName = jQuery('input[name="ename"]').val().trim();
    const eventDate = jQuery('input[name="edate"]').val().trim();
    const eventStartTime = jQuery('input[name="estarttime"]').val().trim();
    const eventEndTime = jQuery('input[name="eendtime"]').val().trim();

    // Перевірка чи вказаний час
    let startDateTime, endDateTime;
    if (eventStartTime && eventEndTime) {
      // Якщо вказаний час, використовуємо його
      startDateTime = eventDate + 'T' + eventStartTime;
      endDateTime = eventDate + 'T' + eventEndTime;
    } else {
      // Якщо час не вказаний, передаємо лише дату без часу
      startDateTime = eventDate;
      endDateTime = eventDate;
    }

    // Додаємо подію до календаря разом із згенерованим ідентифікатором та часом
    const eventData = {
      id: eventId,
      title: eventName,
      start: startDateTime,
      end: endDateTime,
      description: jQuery('textarea[name="edesc"]').val()
    };
    jQuery('#calendar').fullCalendar('renderEvent', eventData, true);

    // Очищення полів форми для додавання наступної події
    jQuery('#add-event')[0].reset();

    // Закриття модального вікна
    jQuery('#modal-view-event-add').modal('hide');

    // Збереження нової події у локальне сховище
    saveEvent(eventData);
  });

  // Функція для збереження подій у localStorage
  function saveEvent(eventData) {
    const events = JSON.parse(localStorage.getItem('events')) || [];
    events.push(eventData);
    localStorage.setItem('events', JSON.stringify(events));
  }

  // Функція для завантаження подій з localStorage
  function loadEvents() {
    return JSON.parse(localStorage.getItem('events')) || [];
  }

  // Подія, яка відбувається при кліку на кнопку "Редагувати"
  jQuery('.edit-event').click(function () {
    // Встановлення значень полів форми редагування події на основі даних події, яку будемо редагувати
    jQuery('input[name="edit-ename"]').val(eventToEdit.title);
    jQuery('input[name="edit-edate"]').val(eventToEdit.start.format('YYYY-MM-DD'));
    jQuery('input[name="edit-estarttime"]').val(eventToEdit.start.format('HH:mm'));
    jQuery('input[name="edit-eendtime"]').val(eventToEdit.end.format('HH:mm'));
    jQuery('textarea[name="edit-edesc"]').val(eventToEdit.description);

    // Відкриття модального вікна для редагування події
    jQuery('#modal-edit-event').modal('show');
  });


  // Завантаження подій при завантаженні сторінки
  const savedEvents = loadEvents();
  savedEvents.forEach(function (eventData) {
    jQuery('#calendar').fullCalendar('renderEvent', eventData, true);
  });

  // Подія, яка відбувається при відправці форми редагування події
  jQuery("#edit-event").submit(function (event) {
    // Зупиняємо стандартну поведінку форми
    event.preventDefault();
    // Отримання нових значень з форми редагування
    const editedEventData = {
      title: jQuery('input[name="edit-ename"]').val(),
      start: jQuery('input[name="edit-edate"]').val(),
      startTime: jQuery('input[name="edit-estarttime"]').val(),
      endTime: jQuery('input[name="edit-eendtime"]').val(),
      description: jQuery('textarea[name="edit-edesc"]').val()
    };

    // Обчислення кінцевої дати та часу
    const startDateTime = editedEventData.start + 'T' + editedEventData.startTime;
    const endDateTime = editedEventData.start + 'T' + editedEventData.endTime;

    // Оновлення даних події в календарі
    eventToEdit.title = editedEventData.title;
    eventToEdit.start = startDateTime;
    eventToEdit.end = endDateTime;
    eventToEdit.description = editedEventData.description;
    jQuery('#calendar').fullCalendar('updateEvent', eventToEdit);

    // console.log("Updated Event ID:", eventToEdit.id);

    // Закриття модального вікна для редагування події
    jQuery('#modal-edit-event').modal('hide');

    // localStorage.removeItem('events');

    // Оновлення даних події в локальному сховищі
    updateEventInLocalStorage(eventToEdit);
  });

  // Функція для оновлення події в локальному сховищі
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








