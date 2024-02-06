import './style.css';
// console.log('Hello from index.js');

// document.getElementById("app").innerText = "Text";

$(document).ready(function () {
    const today = new Date();
    let activeDay;
    let month = today.getMonth();
    let year = today.getFullYear();
  
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
  
    const eventsArr = [];
    getEvents();
  
    $('#calendar').fullCalendar({
      defaultView: 'month', 
      header: {
        left: 'prev,next today',
        center: 'title',
        right: 'month,agendaWeek,agendaDay'
      },
      events: function (start, end, timezone, callback) {
        // �� ������� ��� ��������� ����
        const events = [];
        callback(events);
      },
      dayClick: function (date, jsEvent, view) {
        // �� ������� ����������� ��� ���� �� ���������� ����
        getActiveDay(date.date());
        updateEvents(date.date());
        activeDay = date.date();
      },
      eventClick: function (calEvent, jsEvent, view) {
        // �� ������� ����������� ��� ���� �� ��������� ����
        // ������ ��������������� calEvent ��� ��������� ���������� ��� ����
      }
    });
  
    function getActiveDay(date) {
      const day = new Date(year, month, date);
      const dayName = day.toString().split(" ")[0];
      // ��� ����� ��������������� activeDay
      // eventDay.innerHTML = dayName;
      // eventDate.innerHTML = date + " " + months[month] + " " + year;
    }
  
    function updateEvents(date) {
      // ��� ����� ��������������� date ��� ��������� ���� �� ���������� ����
      let events = "";
      eventsArr.forEach((event) => {
        if (date === event.day && month + 1 === event.month && year === event.year) {
          event.events.forEach((event) => {
            events += `<div class="event">
                <div class="title">
                  <i class="fas fa-circle"></i>
                  <h3 class="event-title">${event.title}</h3>
                </div>
                <div class="event-time">
                  <span class="event-time">${event.time}</span>
                </div>
            </div>`;
          });
        }
      });
      // ��� �� ������ ��������������� events ��� ����������� ���� �� �������
    }
  
    function getEvents() {
      if (localStorage.getItem("events") !== null) {
        eventsArr.push(...JSON.parse(localStorage.getItem("events")));
      }
    }
  });
  

  



