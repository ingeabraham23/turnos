// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from 'react';
import Dexie from 'dexie';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const obtenerNombreMesAbreviado = (mes) => {
  const nombresMesesAbreviados = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  return nombresMesesAbreviados[mes];
};

const InformeTurnos = () => {
  const [todosLosTurnos, setTodosLosTurnos] = useState([]);
  const [turnosFiltrados, setTurnosFiltrados] = useState([]);
  const [nombreFiltro, setNombreFiltro] = useState('');
  const [fechaInicioFiltro, setFechaInicioFiltro] = useState(null);
  const [fechaFinFiltro, setFechaFinFiltro] = useState(null);

  const cargarTurnosDesdeDB = async () => {
    try {
      const db = new Dexie('TurnosDB');
      db.version(2).stores({ turnos: '++id, dia, persona, turnoCubierto' });

      const turnosGuardados = await db.turnos.toArray();
      setTodosLosTurnos(turnosGuardados);
      setTurnosFiltrados(turnosGuardados);
    } catch (error) {
      console.error('Error al cargar los turnos desde IndexedDB:', error);
    }
  };

  useEffect(() => {
    cargarTurnosDesdeDB();
  }, []);

  const filtrarTurnos = () => {
    // Filtrar los turnos según los valores ingresados en los cuadros de texto y los calendarios
    const turnosFiltradosTemp = todosLosTurnos.filter((turno) => {
      const nombreCoincide = turno.persona.toLowerCase().includes(nombreFiltro.toLowerCase());
      const fechaDentroRango = (!fechaInicioFiltro || new Date(turno.dia) >= fechaInicioFiltro) &&
        (!fechaFinFiltro || new Date(turno.dia) <= fechaFinFiltro);

      return nombreCoincide && fechaDentroRango;
    });

    // Actualizar el estado de los turnos filtrados
    setTurnosFiltrados(turnosFiltradosTemp);
  };

  return (
    <div>
      <h2>Informe de Turnos</h2>
      <div>
        <label>Nombre: </label>
        <input type="text" value={nombreFiltro} onChange={(e) => setNombreFiltro(e.target.value)} />
      </div>
      <div>
        <label>Fecha de Inicio: </label>
        <DatePicker selected={fechaInicioFiltro} onChange={(date) => setFechaInicioFiltro(date)} />
      </div>
      <div>
        <label>Fecha de Fin: </label>
        <DatePicker selected={fechaFinFiltro} onChange={(date) => setFechaFinFiltro(date)} />
      </div>
      <button onClick={filtrarTurnos}>Filtrar</button>
      <table>
        <thead>
          <tr>
            <th>Día</th>
            <th>Persona</th>
            <th>Turno Cubierto</th>
          </tr>
        </thead>
        <tbody>
          {turnosFiltrados.map((turno, index) => {
            const fecha = new Date(turno.dia);
            const fechaFormateada = `${fecha.toLocaleDateString('es-ES', { weekday: 'long' })} ${fecha.getDate()}/${obtenerNombreMesAbreviado(fecha.getMonth())}/${fecha.getFullYear()}`;

            return (
              <tr key={index}>
                <td>{fechaFormateada}</td>
                <td>{turno.persona}</td>
                <td>{turno.turnoCubierto ? 'Sí' : 'No'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default InformeTurnos;
