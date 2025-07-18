'use client';

import { useState, useEffect } from 'react';
import { FiMaximize2, FiMinimize2 } from 'react-icons/fi';
import styles from './routeSelector.module.css';

export default function RouteSelector({ 
  origen, 
  desti, 
  hora, 
  dia = 'Avui',
  dataSeleccionada,
  estacions, 
  onOrigenChange, 
  onDestiChange, 
  onHoraChange, 
  onDiaChange,
  onDataSeleccionadaChange,
  onInvertirTrajecte,
  swapViewMaximized,
  setSwapViewMaximized
}) {
  const [showHourDropdown, setShowHourDropdown] = useState(false);
  const [showDayDropdown, setShowDayDropdown] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showOrigenDropdown, setShowOrigenDropdown] = useState(false);
  const [showDestiDropdown, setShowDestiDropdown] = useState(false);
  // swapViewMaximized: per defecte true (maximized)
  const [isPC, setIsPC] = useState(typeof window !== 'undefined' ? window.innerWidth > 768 : true);

  useEffect(() => {
    const handleResize = () => {
      const pc = window.innerWidth > 768;
      setIsPC(pc);
      if (pc) {
        setSwapViewMaximized(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setSwapViewMaximized]);

  // Funció per gestionar la selecció d'hora
  const handleHourSelect = (selectedHour) => {
    onHoraChange(selectedHour);
    setShowHourDropdown(false);
  };

  // Funció per gestionar la selecció de dia
  const handleDaySelect = (selectedDay) => {
    onDiaChange(selectedDay);
    setShowDayDropdown(false);
    // Si selecciona "Demà", posar automàticament l'hora a les 5:00
    if (selectedDay === 'Demà') {
      onHoraChange(5);
    }
    // Si selecciona "Data concreta", obrir el selector personalitzat
    if (selectedDay === 'Data concreta') {
      setShowDatePicker(true);
      // Si no hi ha data seleccionada, assignar avui per defecte
      if (!dataSeleccionada) {
        const avui = new Date().toISOString().split('T')[0];
        onDataSeleccionadaChange(avui);
      }
    } else {
      setShowDatePicker(false);
    }
  };

  // Funció per gestionar el canvi de data específica
  const handleDateChange = (selectedDate) => {
    onDataSeleccionadaChange(selectedDate);
    setShowDatePicker(false);
  };

  // Funcions helper per al calendari
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return 'Seleccionar data';
    const date = new Date(dateString);
    return date.toLocaleDateString('ca-ES', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short' 
    });
  };

  const generateCalendarDays = () => {
    const today = new Date();
    const days = [];
    
    // Generar els pròxims 30 dies
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateString = date.toISOString().split('T')[0];
      
      days.push({
        date: dateString,
        day: date.getDate(),
        weekday: date.toLocaleDateString('ca-ES', { weekday: 'short' }),
        month: date.toLocaleDateString('ca-ES', { month: 'short' }),
        isToday: i === 0,
        isTomorrow: i === 1
      });
    }
    
    return days;
  };

  // Tancar dropdown quan es fa clic fora o es prem Escape
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showHourDropdown && !event.target.closest(`.${styles.hourSelector}`)) {
        setShowHourDropdown(false);
      }
      if (showDayDropdown && !event.target.closest(`.${styles.daySelector}`)) {
        setShowDayDropdown(false);
      }
      if (showDatePicker && !event.target.closest(`.${styles.datePickerContainer}`)) {
        setShowDatePicker(false);
      }
      if (showOrigenDropdown && !event.target.closest(`.${styles.origenSelector}`)) {
        setShowOrigenDropdown(false);
      }
      if (showDestiDropdown && !event.target.closest(`.${styles.destiSelector}`)) {
        setShowDestiDropdown(false);
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        if (showHourDropdown) setShowHourDropdown(false);
        if (showDayDropdown) setShowDayDropdown(false);
        if (showDatePicker) setShowDatePicker(false);
        if (showOrigenDropdown) setShowOrigenDropdown(false);
        if (showDestiDropdown) setShowDestiDropdown(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [showHourDropdown, showDayDropdown, showDatePicker, showOrigenDropdown, showDestiDropdown]);

  return (
    <div className={styles.routeSelector}>
      {/* Selector d'origen personalitzat */}
      <div className={styles.origenSelector}>
        <button
          className={styles.origenButton}
          onClick={() => setShowOrigenDropdown(!showOrigenDropdown)}
          title="Seleccionar estació d'origen"
          aria-label="Seleccionar estació d'origen"
          aria-expanded={showOrigenDropdown}
          aria-haspopup="listbox"
        >
          {estacions.find(e => e.id === origen)?.nom || 'Origen'}
        </button>
        {showOrigenDropdown && (
          <div className={styles.origenDropdown} role="listbox" aria-label="Opcions d'origen">
            {estacions.map(estacio => (
              <button
                key={estacio.id}
                className={`${styles.origenOption} ${origen === estacio.id ? styles.selected : ''}`}
                onClick={() => { onOrigenChange(estacio.id); setShowOrigenDropdown(false); }}
                role="option"
                aria-selected={origen === estacio.id}
              >
                {estacio.nom}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className={styles.buttonsContainer}>
        {/* Botó swapView només visible en mòbil */}
        {!isPC && (
          <button
            className={styles.swapView}
            onClick={() => setSwapViewMaximized((prev) => !prev)}
            title="Canvia la vista"
            aria-label="Canvia la vista"
          >
            {swapViewMaximized ? <FiMinimize2 /> : <FiMaximize2 />}
          </button>
        )}
        <button 
          onClick={onInvertirTrajecte}
          className={styles.swapButton}
        >
          ⇄
        </button>
      </div>

      {/* Selector de destí personalitzat */}
      <div className={styles.destiSelector}>
        <button
          className={styles.destiButton}
          onClick={() => setShowDestiDropdown(!showDestiDropdown)}
          title="Seleccionar estació de destí"
          aria-label="Seleccionar estació de destí"
          aria-expanded={showDestiDropdown}
          aria-haspopup="listbox"
        >
          {estacions.find(e => e.id === desti)?.nom || 'Destí'}
        </button>
        {showDestiDropdown && (
          <div className={styles.destiDropdown} role="listbox" aria-label="Opcions de destí">
            {estacions.map(estacio => (
              <button
                key={estacio.id}
                className={`${styles.destiOption} ${desti === estacio.id ? styles.selected : ''}`}
                onClick={() => { onDestiChange(estacio.id); setShowDestiDropdown(false); }}
                role="option"
                aria-selected={desti === estacio.id}
              >
                {estacio.nom}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className={styles.hourSelector}>
        <button
          className={styles.hourButton}
          onClick={() => setShowHourDropdown(!showHourDropdown)}
          title="Seleccionar hora de sortida"
          aria-label="Seleccionar hora de sortida"
          aria-expanded={showHourDropdown}
          aria-haspopup="listbox"
        >
          {hora.toString().padStart(2, '0')}:00
        </button>
        
        {showHourDropdown && (
          <div 
            className={styles.hourDropdown}
            role="listbox"
            aria-label="Opcions d'hora"
          >
            <div className={styles.hourGrid}>
              {/* Primera columna: 0:00-11:00 */}
              <div className={styles.hourColumn}>
                {Array.from({ length: 12 }, (_, i) => (
                  <button
                    key={i}
                    className={`${styles.hourOption} ${hora === i ? styles.selected : ''}`}
                    onClick={() => handleHourSelect(i)}
                    role="option"
                    aria-selected={hora === i}
                  >
                    {i.toString().padStart(2, '0')}:00
                  </button>
                ))}
              </div>
              
              {/* Segona columna: 12:00-23:00 */}
              <div className={styles.hourColumn}>
                {Array.from({ length: 12 }, (_, i) => {
                  const hourValue = i + 12;
                  return (
                    <button
                      key={hourValue}
                      className={`${styles.hourOption} ${hora === hourValue ? styles.selected : ''}`}
                      onClick={() => handleHourSelect(hourValue)}
                      role="option"
                      aria-selected={hora === hourValue}
                    >
                      {hourValue.toString().padStart(2, '0')}:00
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className={styles.daySelector}>
        <button
          className={styles.dayButton}
          onClick={() => setShowDayDropdown(!showDayDropdown)}
          title="Seleccionar dia"
          aria-label="Seleccionar dia"
          aria-expanded={showDayDropdown}
          aria-haspopup="listbox"
        >
          {dia}
        </button>
        
        {showDayDropdown && (
          <div 
            className={styles.dayDropdown}
            role="listbox"
            aria-label="Opcions de dia"
          >
            <button
              className={`${styles.dayOption} ${dia === 'Avui' ? styles.selected : ''}`}
              onClick={() => handleDaySelect('Avui')}
              role="option"
              aria-selected={dia === 'Avui'}
            >
              Avui
            </button>
            <button
              className={`${styles.dayOption} ${dia === 'Demà' ? styles.selected : ''}`}
              onClick={() => handleDaySelect('Demà')}
              role="option"
              aria-selected={dia === 'Demà'}
            >
              Demà
            </button>
            <button
              className={`${styles.dayOption} ${dia === 'Data concreta' ? styles.selected : ''}`}
              onClick={() => handleDaySelect('Data concreta')}
              role="option"
              aria-selected={dia === 'Data concreta'}
            >
              Data concreta
            </button>
          </div>
        )}
      </div>

      {/* Selector de data personalitzat */}
      {dia === 'Data concreta' && (
        <div className={styles.datePickerContainer}>
          <button
            className={styles.datePickerButton}
            onClick={() => setShowDatePicker(!showDatePicker)}
            title="Seleccionar data"
            aria-label="Seleccionar data"
            aria-expanded={showDatePicker}
            aria-haspopup="listbox"
          >
            {formatDateForDisplay(dataSeleccionada)}
          </button>
          
          {showDatePicker && (
            <div className={styles.datePickerDropdown}>
              <div className={styles.calendarGrid}>
                {generateCalendarDays().map((day) => (
                  <button
                    key={day.date}
                    className={`${styles.calendarDay} ${
                      dataSeleccionada === day.date ? styles.selected : ''
                    } ${day.isToday ? styles.today : ''}`}
                    onClick={() => handleDateChange(day.date)}
                  >
                    <span className={styles.weekday}>{day.weekday}</span>
                    <span className={styles.dayNumber}>{day.day}</span>
                    <span className={styles.month}>{day.month}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
