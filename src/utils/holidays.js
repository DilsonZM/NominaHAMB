export const HOLIDAYS_2025 = [
  '2025-01-01', // Año Nuevo
  '2025-01-06', // Reyes Magos
  '2025-03-24', // San José
  '2025-04-17', // Jueves Santo
  '2025-04-18', // Viernes Santo
  '2025-05-01', // Día del Trabajo
  '2025-06-02', // Ascensión del Señor
  '2025-06-23', // Corpus Christi
  '2025-06-30', // Sagrado Corazón
  '2025-07-20', // Grito de Independencia
  '2025-08-07', // Batalla de Boyacá
  '2025-08-18', // Asunción de la Virgen
  '2025-10-13', // Día de la Raza
  '2025-11-03', // Todos los Santos
  '2025-11-17', // Independencia de Cartagena
  '2025-12-08', // Inmaculada Concepción
  '2025-12-25', // Navidad
];

export const isHoliday = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const dateStr = `${year}-${month}-${day}`;

  // Por ahora solo soportamos 2025 hardcoded, pero se podría extender
  if (year === 2025) {
    return HOLIDAYS_2025.includes(dateStr);
  }
  return false;
};

export const isBusinessDay = (date) => {
  const day = date.getDay();
  // 0 = Domingo, 6 = Sábado
  // Asumimos Sábado como hábil por defecto en muchas nóminas, pero Domingo NO.
  // Festivos NO son hábiles.
  if (day === 0) return false; 
  if (isHoliday(date)) return false;
  return true;
};
