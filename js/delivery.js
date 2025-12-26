// ============================
// КОНФИГУРАЦИОННЫЕ ПЕРЕМЕННЫЕ
// ============================
var CONFIG = {
  // Время работы
  WORK_START: { hour: 8, minute: 15 },
  WORK_END: { hour: 22, minute: 0 },
  
  // Интервал времени
  TIME_INTERVAL: 15, // минут
  
  // Минимальный промежуток между текущим временем и временем доставки
  PREP_TIME_MINUTES: 60, // время на сборку заказа (1 час)
  
  // Минимальное время для заказов после закрытия
  AFTER_CLOSE_MIN_TIME: { hour: 10, minute: 0 },
  
  // Временные ограничения для связи с датой
  SAME_DAY_CUTOFF: { hour: 21, minute: 0 }, // после этого времени - следующий день
  NEXT_DAY_MIN_TIME: { hour: 8, minute: 15 } // минимальное время на следующий день
};

// ============================
// ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ
// ============================
var selectedFromTime = null;
var selectedDate = null;
var timesList = [];
var currentConstraints = null;
var lastDateValue = '';
var dateCheckInterval = null;

// ============================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ============================

// Форматирование числа в двузначный формат
function formatNumber(num) {
  return num < 10 ? '0' + num : num.toString();
}

// Получение сегодняшней даты в формате YYYY-MM-DD
function getTodayDate() {
  var today = new Date();
  var year = today.getFullYear();
  var month = formatNumber(today.getMonth() + 1);
  var day = formatNumber(today.getDate());
  return year + '-' + month + '-' + day;
}

// Создание объекта времени из строки "ЧЧ:ММ"
function parseTime(timeStr) {
  if (!timeStr) return null;
  var parts = timeStr.split(':');
  return {
    hour: parseInt(parts[0]),
    minute: parseInt(parts[1]),
    totalMinutes: parseInt(parts[0]) * 60 + parseInt(parts[1])
  };
}

// Преобразование времени в минуты
function timeToMinutes(timeStr) {
  var time = parseTime(timeStr);
  return time ? time.totalMinutes : 0;
}

// Генерация списка доступного времени
function generateTimes() {
  timesList = [];
  var hour = CONFIG.WORK_START.hour;
  var minute = CONFIG.WORK_START.minute;
  var workEndMinutes = CONFIG.WORK_END.hour * 60 + CONFIG.WORK_END.minute;
  
  while (true) {
    var totalMinutes = hour * 60 + minute;
    if (totalMinutes > workEndMinutes) break;
    
    timesList.push({
      display: formatNumber(hour) + ':' + formatNumber(minute),
      minutes: totalMinutes,
      hour: hour,
      minute: minute,
      isAvailable: true
    });
    
    minute += CONFIG.TIME_INTERVAL;
    if (minute >= 60) {
      hour += 1;
      minute = minute % 60;
    }
  }
  
  return timesList;
}

// Получение текущего времени с учетом логики доставки
function getCurrentTimeConstraints() {
  var now = new Date();
  var currentHour = now.getHours();
  var currentMinute = now.getMinutes();
  var currentTotalMinutes = currentHour * 60 + currentMinute;
  
  var workStartMinutes = CONFIG.WORK_START.hour * 60 + CONFIG.WORK_START.minute;
  var workEndMinutes = CONFIG.WORK_END.hour * 60 + CONFIG.WORK_END.minute;
  var sameDayCutoff = CONFIG.SAME_DAY_CUTOFF.hour * 60 + CONFIG.SAME_DAY_CUTOFF.minute;
  
  // Логика определения минимального времени доставки
  if (currentTotalMinutes >= workStartMinutes && currentTotalMinutes <= workEndMinutes) {
    // В рабочее время
    if (currentTotalMinutes <= sameDayCutoff) {
      // Можно доставить сегодня
      var minDeliveryMinutes = currentTotalMinutes + CONFIG.PREP_TIME_MINUTES;
      
      // Если минимальное время выходит за рабочие часы, переносим на завтра
      if (minDeliveryMinutes > workEndMinutes) {
        return {
          isToday: false,
          minTime: CONFIG.NEXT_DAY_MIN_TIME,
          minMinutes: CONFIG.NEXT_DAY_MIN_TIME.hour * 60 + CONFIG.NEXT_DAY_MIN_TIME.minute,
          reason: 'preparation_after_close'
        };
      }
      
      return {
        isToday: true,
        minTime: {
          hour: Math.floor(minDeliveryMinutes / 60),
          minute: minDeliveryMinutes % 60
        },
        minMinutes: minDeliveryMinutes,
        reason: 'today_with_prep'
      };
    } else {
      // После 21:00, но до закрытия (22:00) - завтра с 8:15
      return {
        isToday: false,
        minTime: CONFIG.NEXT_DAY_MIN_TIME,
        minMinutes: CONFIG.NEXT_DAY_MIN_TIME.hour * 60 + CONFIG.NEXT_DAY_MIN_TIME.minute,
        reason: 'after_21_today'
      };
    }
  } else {
    // В нерабочее время (ночью)
    return {
      isToday: false,
      minTime: CONFIG.AFTER_CLOSE_MIN_TIME,
      minMinutes: CONFIG.AFTER_CLOSE_MIN_TIME.hour * 60 + CONFIG.AFTER_CLOSE_MIN_TIME.minute,
      reason: 'outside_work_hours'
    };
  }
}

// Проверка, доступно ли время с учетом даты и текущего времени
function isTimeAvailable(timeObj, selectedDate, isToField) {
  // Если поле "до" и не выбрано время "от" - блокируем все
  if (isToField && !selectedFromTime) {
    timeObj.isAvailable = false;
    return false;
  }
  
  // Если дата не выбрана, считаем что сегодня
  if (!selectedDate) {
    selectedDate = getTodayDate();
  }
  
  var now = new Date();
  var selected = new Date(selectedDate);
  
  // Приведение дат к началу дня для сравнения
  var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  var selectedDay = new Date(selected.getFullYear(), selected.getMonth(), selected.getDate());
  
  var timeDiff = selectedDay.getTime() - today.getTime();
  var daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
  
  // Получаем текущие ограничения
  currentConstraints = getCurrentTimeConstraints();
  
  // Если выбран сегодняшний день
  if (daysDiff === 0) {
    if (!currentConstraints.isToday) {
      timeObj.isAvailable = false;
      return false;
    }
    
    // Время должно быть не раньше минимального
    var isAvailable = timeObj.minutes >= currentConstraints.minMinutes;
    timeObj.isAvailable = isAvailable;
    return isAvailable;
  }
  
  // Если выбран завтрашний день
  if (daysDiff === 1) {
    var minMinutes;
    
    // Если сегодня после 21:00, минимальное время - 8:15
    if (currentConstraints.reason === 'after_21_today') {
      minMinutes = CONFIG.NEXT_DAY_MIN_TIME.hour * 60 + CONFIG.NEXT_DAY_MIN_TIME.minute;
      var isAvailable = timeObj.minutes >= minMinutes;
      timeObj.isAvailable = isAvailable;
      return isAvailable;
    }
    
    // Если заказ ночью (нерабочее время), минимальное время - 10:00
    if (currentConstraints.reason === 'outside_work_hours') {
      minMinutes = CONFIG.AFTER_CLOSE_MIN_TIME.hour * 60 + CONFIG.AFTER_CLOSE_MIN_TIME.minute;
      var isAvailable = timeObj.minutes >= minMinutes;
      timeObj.isAvailable = isAvailable;
      return isAvailable;
    }
    
    // В остальных случаях доступно все рабочее время
    timeObj.isAvailable = true;
    return true;
  }
  
  // Если выбран день послезавтра и дальше - все доступно
  timeObj.isAvailable = true;
  return true;
}

// ============================
// ОСНОВНЫЕ ФУНКЦИИ
// ============================

// Добавление CSS стилей
function addStyles() {
  if (document.querySelector('#time-picker-styles')) return;
  
  var style = document.createElement('style');
  style.id = 'time-picker-styles';
  style.textContent = `
    .frm-select-time.disabled {
      opacity: 0.4;
      pointer-events: none;
    }
    .frm-select-time.disabled label {
      cursor: not-allowed;
      color: #aaa;
      text-decoration: line-through;
    }
    .frm-select-time input[disabled] {
      cursor: not-allowed;
    }
    .time-hint {
      font-size: 12px;
      color: #666;
      margin-top: 5px;
      padding: 8px 12px;
      background: #f5f5f5;
      border-radius: 4px;
      display: block;
      border-left: 4px solid #ddd;
    }
    .time-hint.success {
      background: #e8f5e8;
      color: #2e7d32;
      border-left-color: #4caf50;
    }
    .time-hint.warning {
      background: #fff3e0;
      color: #ef6c00;
      border-left-color: #ff9800;
    }
    .time-hint.night {
      background: #e3f2fd;
      color: #1565c0;
      border-left-color: #2196f3;
    }
    .no-time-message {
      padding: 15px;
      text-align: center;
      color: #666;
      font-style: italic;
      background: #f9f9f9;
      border-radius: 4px;
      margin: 10px;
    }
    .select-time-first {
      padding: 15px;
      text-align: center;
      color: #666;
      font-style: italic;
      background: #f0f8ff;
      border-radius: 4px;
      margin: 10px;
      border-left: 4px solid #2196f3;
    }
  `;
  document.head.appendChild(style);
}

// Отслеживание изменений в поле даты с помощью polling
function setupDateListener() {
  var dateInput = document.getElementById('time');
  if (!dateInput) return;
  
  // Запоминаем начальное значение
  lastDateValue = dateInput.value || getTodayDate();
  selectedDate = dateInput.value || getTodayDate();
  
  // Проверяем каждые 300мс, изменилось ли значение
  if (dateCheckInterval) {
    clearInterval(dateCheckInterval);
  }
  
  dateCheckInterval = setInterval(function() {
    var currentValue = dateInput.value || getTodayDate();
    if (currentValue !== lastDateValue) {
      lastDateValue = currentValue;
      selectedDate = currentValue;
      recalculateTimeAvailability();
    }
  }, 300);
  
  // Также слушаем стандартные события
  dateInput.addEventListener('change', function() {
    selectedDate = dateInput.value || getTodayDate();
    recalculateTimeAvailability();
  });
  
  dateInput.addEventListener('input', function() {
    selectedDate = dateInput.value || getTodayDate();
    recalculateTimeAvailability();
  });
}

// Пересчет доступности времени
function recalculateTimeAvailability() {
  // Сначала сбрасываем ВСЕ флаги доступности
  timesList.forEach(function(timeObj) {
    timeObj.isAvailable = true;
  });
  
  // Пересчитываем доступность для поля "от"
  timesList.forEach(function(timeObj) {
    isTimeAvailable(timeObj, selectedDate, false);
  });
  
  // Обновляем UI
  updateFromTimeOptions();
  
  // Если выбрано время "от", обновляем "до"
  if (selectedFromTime) {
    updateToTimeOptions();
  }
  
  // Обновляем подсказку
  updateTimeHint();
}

// Обновление подсказки о времени доставки
function updateTimeHint() {
  var dateInput = document.getElementById('time');
  if (!dateInput) return;
  
  var hintId = 'delivery-time-hint';
  var existingHint = document.getElementById(hintId);
  
  if (existingHint) {
    existingHint.remove();
  }
  
  currentConstraints = getCurrentTimeConstraints();
  var hintText = '';
  var hintClass = '';
  
  switch (currentConstraints.reason) {
    case 'today_with_prep':
      var minTime = formatNumber(currentConstraints.minTime.hour) + ':' + formatNumber(currentConstraints.minTime.minute);
      hintText = '✅ Доставка сегодня возможна. Минимальное время: ' + minTime + ' (время на подготовку заказа 1 час)';
      hintClass = 'success';
      break;
    case 'preparation_after_close':
      hintText = '⚠️ Заказ будет готов после закрытия. Доступна доставка завтра с ' + 
                formatNumber(CONFIG.NEXT_DAY_MIN_TIME.hour) + ':' + formatNumber(CONFIG.NEXT_DAY_MIN_TIME.minute);
      hintClass = 'warning';
      break;
    case 'after_21_today':
      hintText = '🌙 Прием заказов после 21:00. Доставка завтра с ' + 
                formatNumber(CONFIG.NEXT_DAY_MIN_TIME.hour) + ':' + formatNumber(CONFIG.NEXT_DAY_MIN_TIME.minute);
      hintClass = 'night';
      break;
    case 'outside_work_hours':
      hintText = '🌙 Сейчас нерабочее время. Доставка завтра с ' + 
                formatNumber(CONFIG.AFTER_CLOSE_MIN_TIME.hour) + ':' + formatNumber(CONFIG.AFTER_CLOSE_MIN_TIME.minute);
      hintClass = 'night';
      break;
  }
  
  var hint = document.createElement('div');
  hint.id = hintId;
  hint.className = 'time-hint ' + hintClass;
  hint.textContent = hintText;
  
  var parent = dateInput.parentNode;
  if (dateInput.nextSibling) {
    parent.insertBefore(hint, dateInput.nextSibling);
  } else {
    parent.appendChild(hint);
  }
}

// Обновление опций времени "с"
function updateFromTimeOptions() {
  var fromInput = document.getElementById('time-from');
  if (!fromInput) return;
  
  var popupWrap = fromInput.closest('.js-popup-wrap');
  if (!popupWrap) return;
  
  var menu = popupWrap.querySelector('.menu');
  if (!menu) return;
  
  var timeElements = menu.querySelectorAll('.frm-select-time');
  var anyAvailable = false;
  
  // Удаляем старое сообщение
  var oldMessage = menu.querySelector('.no-time-message');
  if (oldMessage && oldMessage.parentNode) {
    oldMessage.parentNode.remove();
  }
  
  timeElements.forEach(function(element, index) {
    var radio = element.querySelector('input[type="radio"]');
    var label = element.querySelector('label');
    var timeObj = timesList[index];
    
    if (!timeObj) return;
    
    var isAvailable = timeObj.isAvailable;
    
    if (isAvailable) {
      radio.disabled = false;
      element.classList.remove('disabled');
      label.classList.remove('disabled');
      anyAvailable = true;
    } else {
      radio.disabled = true;
      element.classList.add('disabled');
      label.classList.add('disabled');
      
      if (radio.checked) {
        radio.checked = false;
        fromInput.value = '';
        selectedFromTime = null;
        
        var toInput = document.getElementById('time-to');
        if (toInput) {
          toInput.value = '';
        }
      }
    }
  });
  
  if (!anyAvailable && selectedDate) {
    showNoTimeMessage(menu, 'from');
  }
}

// Обновление опций времени "до"
function updateToTimeOptions() {
  var toInput = document.getElementById('time-to');
  if (!toInput) return;
  
  var popupWrap = toInput.closest('.js-popup-wrap');
  if (!popupWrap) return;
  
  var menu = popupWrap.querySelector('.menu');
  if (!menu) return;
  
  // Удаляем старое сообщение
  var oldMessage = menu.querySelector('.no-time-message, .select-time-first');
  if (oldMessage && oldMessage.parentNode) {
    oldMessage.parentNode.remove();
  }
  
  // Если время "от" не выбрано, блокируем все
  if (!selectedFromTime) {
    blockAllToOptions(menu);
    showSelectTimeFirstMessage(menu);
    return;
  }
  
  var fromMinutes = timeToMinutes(selectedFromTime);
  var minToMinutes = fromMinutes + CONFIG.PREP_TIME_MINUTES;
  
  var timeElements = menu.querySelectorAll('.frm-select-time');
  var anyAvailable = false;
  
  // Пересчитываем доступность для поля "до"
  timesList.forEach(function(timeObj) {
    // Сначала сбрасываем флаг
    timeObj.isAvailable = true;
    // Затем пересчитываем с учетом того, что это поле "до"
    isTimeAvailable(timeObj, selectedDate, true);
  });
  
  timeElements.forEach(function(element, index) {
    var radio = element.querySelector('input[type="radio"]');
    var label = element.querySelector('label');
    var timeObj = timesList[index];
    
    if (!timeObj) return;
    
    var isAvailableByGap = timeObj.minutes >= minToMinutes;
    var isAvailable = isAvailableByGap && timeObj.isAvailable;
    
    if (isAvailable) {
      radio.disabled = false;
      element.classList.remove('disabled');
      label.classList.remove('disabled');
      anyAvailable = true;
    } else {
      radio.disabled = true;
      element.classList.add('disabled');
      label.classList.add('disabled');
      
      if (radio.checked) {
        radio.checked = false;
        toInput.value = '';
      }
    }
  });
  
  if (!anyAvailable && selectedFromTime) {
    showNoTimeMessage(menu, 'to');
  }
}

// Блокировка всех опций в поле "до"
function blockAllToOptions(menu) {
  var timeElements = menu.querySelectorAll('.frm-select-time');
  
  timeElements.forEach(function(element) {
    var radio = element.querySelector('input[type="radio"]');
    var label = element.querySelector('label');
    
    radio.disabled = true;
    element.classList.add('disabled');
    label.classList.add('disabled');
    
    if (radio.checked) {
      radio.checked = false;
      var toInput = document.getElementById('time-to');
      if (toInput) {
        toInput.value = '';
      }
    }
  });
}

// Показать сообщение "Сначала выберите время"
function showSelectTimeFirstMessage(menu) {
  var messageId = 'select-time-first-message';
  var existingMessage = document.getElementById(messageId);
  
  if (existingMessage) return;
  
  var li = document.createElement('li');
  li.id = messageId;
  li.innerHTML = '<div class="select-time-first">⏰ Сначала выберите время начала доставки</div>';
  
  if (menu.firstChild) {
    menu.insertBefore(li, menu.firstChild);
  } else {
    menu.appendChild(li);
  }
}

// Показать сообщение о недоступности времени
function showNoTimeMessage(menu, type) {
  var messageId = 'no-time-message-' + type;
  var existingMessage = document.getElementById(messageId);
  
  if (existingMessage) return;
  
  var now = new Date();
  var selected = selectedDate ? new Date(selectedDate) : now;
  var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  var selectedDay = new Date(selected.getFullYear(), selected.getMonth(), selected.getDate());
  
  var timeDiff = selectedDay.getTime() - today.getTime();
  var daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
  
  var message = '';
  
  if (daysDiff === 0) {
    if (currentConstraints.reason === 'today_with_prep') {
      var minTime = formatNumber(currentConstraints.minTime.hour) + ':' + formatNumber(currentConstraints.minTime.minute);
      if (type === 'from') {
        message = 'Сегодня доступно время с ' + minTime;
      } else {
        message = 'Выберите время с учетом 1 часа на подготовку заказа';
      }
    } else {
      message = 'На сегодня доставка недоступна';
    }
  } else if (daysDiff === 1) {
    if (type === 'to') {
      message = 'Выберите время минимум на 1 час позже начала доставки';
    } else {
      message = 'Выберите подходящее время для доставки';
    }
  }
  
  if (message) {
    var li = document.createElement('li');
    li.id = messageId;
    li.innerHTML = '<div class="no-time-message">' + message + '</div>';
    
    if (menu.firstChild) {
      menu.insertBefore(li, menu.firstChild);
    } else {
      menu.appendChild(li);
    }
  }
}

// Создание элементов времени
function createTimeOptions() {
  generateTimes();
  
  // При загрузке всегда считаем, что выбрана сегодняшняя дата
  selectedDate = getTodayDate();
  
  // Пересчитываем доступность для сегодняшней даты
  recalculateTimeAvailability();
  
  ['from', 'to'].forEach(function(type) {
    var inputId = 'time-' + type;
    var input = document.getElementById(inputId);
    if (!input) return;
    
    var popupWrap = input.closest('.js-popup-wrap');
    if (!popupWrap) return;
    
    var menu = popupWrap.querySelector('.menu');
    if (!menu) return;
    
    menu.innerHTML = '';
    
    timesList.forEach(function(timeObj, index) {
      var num = index + 1;
      var itemId = inputId + (num < 10 ? '0' + num : num);
      
      var li = document.createElement('li');
      li.innerHTML = 
        '<div class="frm-select-time">' +
          '<input type="radio" name="time-' + type + '" id="' + itemId + '" value="' + timeObj.display + '">' +
          '<label for="' + itemId + '">' + timeObj.display + '</label>' +
        '</div>';
      
      menu.appendChild(li);
    });
    
    menu.addEventListener('click', function(e) {
      var radio = e.target.closest('input[type="radio"]');
      if (radio && !radio.disabled) {
        input.value = radio.value;
        
        if (type === 'from') {
          selectedFromTime = radio.value;
          updateToTimeOptions();
        }
      }
    });
  });
  
  // Блокируем поле "до" изначально
  var toMenu = document.querySelector('#time-to')?.closest('.js-popup-wrap')?.querySelector('.menu');
  if (toMenu) {
    blockAllToOptions(toMenu);
    showSelectTimeFirstMessage(toMenu);
  }
  
  // Если есть сохраненные значения
  var savedFromTime = document.getElementById('time-from')?.value;
  if (savedFromTime) {
    selectedFromTime = savedFromTime;
    updateToTimeOptions();
  }
}

// ============================
// ИНИЦИАЛИЗАЦИЯ
// ============================
function initTimeSelectors() {
  addStyles();
  createTimeOptions();
  setupDateListener();
  
  currentConstraints = getCurrentTimeConstraints();
}

// Запуск при загрузке страницы
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initTimeSelectors);
} else {
  initTimeSelectors();
}

// Очистка интервала при закрытии страницы
window.addEventListener('beforeunload', function() {
  if (dateCheckInterval) {
    clearInterval(dateCheckInterval);
  }
});