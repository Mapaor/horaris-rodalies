'use client';

import { useState, useEffect } from 'react';
import styles from './routeSelector.module.css';

export default function RouteSelector({ 
  origen, 
  desti, 
  hora, 
  estacions, 
  onOrigenChange, 
  onDestiChange, 
  onHoraChange, 
  onInvertirTrajecte 
}) {
  const [showHourDropdown, setShowHourDropdown] = useState(false);

  // Funció per gestionar la selecció d'hora
  const handleHourSelect = (selectedHour) => {
    onHoraChange(selectedHour);
    setShowHourDropdown(false);
  };

  // Tancar dropdown quan es fa clic fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showHourDropdown && !event.target.closest(`.${styles.hourSelector}`)) {
        setShowHourDropdown(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showHourDropdown]);

  return (
    <div className={styles.routeSelector}>
      <select 
        value={origen} 
        onChange={(e) => onOrigenChange(Number(e.target.value))}
        className={styles.select}
      >
        {estacions.map(estacio => (
          <option key={estacio.id} value={estacio.id}>
            {estacio.nom}
          </option>
        ))}
      </select>
      
      <button 
        onClick={onInvertirTrajecte}
        className={styles.swapButton}
      >
        ⇄
      </button>
      
      <select 
        value={desti} 
        onChange={(e) => onDestiChange(Number(e.target.value))}
        className={styles.select}
      >
        {estacions.map(estacio => (
          <option key={estacio.id} value={estacio.id}>
            {estacio.nom}
          </option>
        ))}
      </select>

      <div className={styles.hourSelector}>
        <button
          className={styles.hourButton}
          onClick={() => setShowHourDropdown(!showHourDropdown)}
          title="Hora de sortida"
        >
          {hora.toString().padStart(2, '0')}:00
        </button>
        
        {showHourDropdown && (
          <div className={styles.hourDropdown}>
            <div className={styles.hourGrid}>
              {/* Primera columna: 0:00-11:00 */}
              <div className={styles.hourColumn}>
                {Array.from({ length: 12 }, (_, i) => (
                  <button
                    key={i}
                    className={`${styles.hourOption} ${hora === i ? styles.selected : ''}`}
                    onClick={() => handleHourSelect(i)}
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
    </div>
  );
}
