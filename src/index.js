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
          // Відображення деталей події при кліку на неї
          jQuery('.event-title').html(event.title);

          let eventDetails = ''; // Початок рядка деталей події

          // Перевірка наявності дати у події
          if (event.start) {
              eventDetails += '<p><strong>Date:</strong> ' + event.start.format('YYYY-MM-DD') + '</p>';

              // Перевірка наявності часу у події
              if (event.start.hasTime()) {
                  // Додавання часу, якщо він є
                  eventDetails += '<p><strong>Start Time:</strong> ' + event.start.format('HH:mm') + '</p>' +
                      '<p><strong>End Time:</strong> ' + event.end.format('HH:mm') + '</p>';
              }
          }
          // Додавання опису події
          eventDetails += '<p><strong>Description:</strong> ' + event.description + '</p>';

          // Відображення деталей події
          jQuery('.event-body').html(eventDetails);

          // Зберігання даних події, яку будемо редагувати
          eventToEdit = event;

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

  // Завантаження подій при завантаженні сторінки
  const savedEvents = loadEvents();
  savedEvents.forEach(function (eventData) {
      // Перевіряємо, чи подія має час
      if (eventData.start.includes('T')) {
          // Якщо має час, рендеримо як з часом
          jQuery('#calendar').fullCalendar('renderEvent', eventData, true);
      } else {
          // Якщо не має часу, рендеримо як цілодобову подію (без часу)
          eventData.allDay = true;
          jQuery('#calendar').fullCalendar('renderEvent', eventData, true);
      }
  });

  // Функція для завантаження подій з localStorage
  function loadEvents() {
      return JSON.parse(localStorage.getItem('events')) || [];
  }

  // Подія, яка відбувається при кліку на кнопку "Редагувати"
  jQuery('.edit-event').click(function () {
      // Встановлення значень полів форми редагування події на основі даних події, яку будемо редагувати
      jQuery('input[name="edit-ename"]').val(eventToEdit.title);
      jQuery('input[name="edit-edate"]').val(eventToEdit.start ? eventToEdit.start.format('YYYY-MM-DD') : ''); // Якщо дата існує, встановлюємо її значення
      jQuery('input[name="edit-estarttime"]').val(eventToEdit.start && eventToEdit.start.hasTime() ? eventToEdit.start.format('HH:mm') : ''); // Якщо час існує, встановлюємо його значення
      jQuery('input[name="edit-eendtime"]').val(eventToEdit.end && eventToEdit.start.hasTime() ? eventToEdit.end.format('HH:mm') : ''); // Якщо час існує, встановлюємо його значення
      jQuery('textarea[name="edit-edesc"]').val(eventToEdit.description);

      // Відкриття модального вікна для редагування події
      jQuery('#modal-edit-event').modal('show');
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
      let startDateTime, endDateTime;
      if (editedEventData.startTime && editedEventData.endTime) {
          startDateTime = editedEventData.start + 'T' + editedEventData.startTime;
          endDateTime = editedEventData.start + 'T' + editedEventData.endTime;
      } else {
          startDateTime = editedEventData.start;
          endDateTime = editedEventData.start;
      }

      // Оновлення даних події в календарі
      eventToEdit.title = editedEventData.title;
      eventToEdit.start = startDateTime;
      eventToEdit.end = endDateTime;
      eventToEdit.description = editedEventData.description;
      jQuery('#calendar').fullCalendar('updateEvent', eventToEdit);

      // Закриття модального вікна для редагування події
      jQuery('#modal-edit-event').modal('hide');

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
          // Зберігаємо оновлену подію зі старим id
          events[index] = {
              id: eventId, // Використовуємо старий id
              title: updatedEvent.title,
              start: updatedEvent.start,
              end: updatedEvent.end,
              description: updatedEvent.description
          };
          localStorage.setItem('events', JSON.stringify(events));
      }
  }

  // Подія, яка відбувається при натисканні на кнопку "Видалити"
  jQuery('.delete-event').click(function () {
      // Переконайтесь, що є обрана подія для видалення
      if (eventToEdit) {
          // Підтвердження видалення за допомогою стандартного підтвердження браузера
          if (confirm('Are you sure?')) {
              // Видаліть подію з календаря
              jQuery('#calendar').fullCalendar('removeEvents', eventToEdit.id);
              // Видаліть подію з локального сховища
              deleteEventFromLocalStorage(eventToEdit.id);
              // Закрийте модальне вікно
              jQuery('#modal-view-event').modal('hide');
          }
      }
  });

  // Функція для видалення події з локального сховища
  function deleteEventFromLocalStorage(eventId) {
      const events = JSON.parse(localStorage.getItem('events')) || [];
      const index = events.findIndex(function (event) {
          return event.id === eventId;
      });
      if (index !== -1) {
          // Видалити подію зі списку подій
          events.splice(index, 1);
          localStorage.setItem('events', JSON.stringify(events));
      }
  }

});









