// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from 'react';
import InformeTurnos from './components/InformeTurnos';
import Dexie from 'dexie';

const db = new Dexie('TurnosDB');
db.version(2).stores({ turnos: '++id, dia, persona, turnoCubierto' });

const personas = ['Luis', 'Abraham', 'Agustina', 'Ubalda', 'Alejandra', 'Maximina', 'Isabel', 'Lucia']; // Lista de personas

const App = () => {
  const [turnos, setTurnos] = useState([]);
  const diasPorTurno = 60; // Número de días por turno basado en la cantidad de personas

  useEffect(() => {
    cargarTurnosDesdeDB();
  }, []);

  const cargarTurnosDesdeDB = async () => {
    try {
      const turnosGuardados = await db.turnos.toArray();
      setTurnos(turnosGuardados);
    } catch (error) {
      console.error('Error al cargar los turnos desde IndexedDB:', error);
    }
  };

  const guardarTurnosEnDB = async () => {
    try {
      await db.turnos.bulkPut(turnos);
    } catch (error) {
      console.error('Error al guardar los turnos en IndexedDB:', error);
    }
  };

  const generarTurnos = () => {
    const nuevosTurnos = [];
    const fechaBase = new Date(2024, 0, 29); // 29 de enero de 2024

    for (let i = 0; i < diasPorTurno; i++) {
      const dia = new Date(fechaBase);
      dia.setDate(fechaBase.getDate() + i);
      const persona = personas[i % personas.length];
      nuevosTurnos.push({ dia, persona, turnoCubierto: false });
    }

    setTurnos(nuevosTurnos);
    guardarTurnosEnDB();
  };

  const adelantarTurnoPersona = (index) => {
    const nuevosTurnos = [...turnos];
    const turnoActual = nuevosTurnos[index];

    // Recorrer los demás turnos desde el final
    for (let i = nuevosTurnos.length - 1; i > index; i--) {
      nuevosTurnos[i] = { ...nuevosTurnos[i - 1] };
    }

    // Agregar el nombre de la persona al día siguiente
    const siguienteDia = new Date(turnoActual.dia);
    siguienteDia.setDate(siguienteDia.getDate() + 1);
    nuevosTurnos[index + 1] = { dia: siguienteDia, persona: turnoActual.persona, turnoCubierto: false };

    // Actualizar el estado
    setTurnos(nuevosTurnos);
    guardarTurnosEnDB();
  };

  const saltarTurnoPersona = (index) => {
    const nuevosTurnos = [...turnos];
    
    // Saltar el turno para la persona actual
    nuevosTurnos.splice(index, 1);
    
    // Actualizar el estado
    setTurnos(nuevosTurnos);
    guardarTurnosEnDB();
  };

  const actualizarTurnoCubierto = (index, value) => {
    const nuevosTurnos = [...turnos];
    nuevosTurnos[index].turnoCubierto = value;
    setTurnos(nuevosTurnos);
    guardarTurnosEnDB();
  };

  const contarTurnosCubiertos = (nombrePersona) => {
    return turnos.filter(turno => turno.persona === nombrePersona && turno.turnoCubierto).length;
  };

  return (
    <div>
      <h1>Sistema de Turnos</h1>
      <button onClick={generarTurnos}>Generar Turnos</button>
      <table>
        <thead>
          <tr>
            <th>Día</th>
            <th>Persona</th>
            <th>Turno Cubierto</th>
            <th>Turnos Cubiertos</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {turnos.map((turno, index) => (
            <tr key={index}>
              <td>{turno.dia.toLocaleDateString()}</td>
              <td>{turno.persona}</td>
              <td>{turno.turnoCubierto ? 'Sí' : 'No'}</td>
              <td>{contarTurnosCubiertos(turno.persona)}</td>
              <td>
                <button onClick={() => adelantarTurnoPersona(index)}>Adelantar Turno</button>
                <button onClick={() => saltarTurnoPersona(index)}>Saltar Turno</button>
                <button onClick={() => actualizarTurnoCubierto(index, true)}>Marcar como Cubierto</button>
                <button onClick={() => actualizarTurnoCubierto(index, false)}>Marcar como No Cubierto</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <InformeTurnos />
    </div>
  );
};

export default App;
