import { useEffect, useState } from 'react';
import axios from 'axios';
import { Chart, CategoryScale, LinearScale, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

// Registrar componentes de Chart.js
Chart.register(CategoryScale, LinearScale, ArcElement, Title, Tooltip, Legend);


const App = () => {
    const [data, setData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage] = useState(15);
    const threshold = 300; // Umbral en centímetros

    const fetchData = async () => {
      try {
          const response = await axios.get('https://evidencia-2-amt-ispc.onrender.com/data', {
              headers: {
                  'Content-Type': 'application/json',
              },
          });
          setData(response.data);
      } catch (error) {
          console.error('Error fetching data:', error.response || error.message);
      }
  };

    useEffect(() => {
        fetchData();
        const intervalId = setInterval(fetchData, 15000); // Refresca cada 15 segundos
        return () => clearInterval(intervalId); // Limpia el intervalo al desmontar el componente
    }, []);

    const getLedStatus = (value) => {
        return value >= threshold ? 'Encendido' : 'Apagado';
    };

    // Calcular los índices de los registros a mostrar
    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    const currentRecords = data.slice(indexOfFirstRecord, indexOfLastRecord);
    const totalPages = Math.ceil(data.length / recordsPerPage);

    // Calcular estadísticas
    const totalRecords = data.length;
    const averageHeight = totalRecords ? (data.reduce((sum, item) => sum + item.value, 0) / totalRecords).toFixed(2) : 0;
    const maxHeight = totalRecords ? Math.max(...data.map(item => item.value)) : 0;
    const minHeight = totalRecords ? Math.min(...data.map(item => item.value)) : 0;

    // Calcular el estado de los LEDs
    const calculateLedStatus = () => {
      const ledOnCount = data.filter(item => item.value >= threshold).length;
      const ledOffCount = data.length - ledOnCount;

      return {
          labels: ['Encendido', 'Apagado'],
          data: [ledOnCount, ledOffCount]
      };
    };

    // Obtener datos para el gráfico de torta
    const ledData = calculateLedStatus();

    // Datos del gráfico de torta
    const chartData = {
      labels: ledData.labels,
      datasets: [{
          data: ledData.data,
          backgroundColor: ['rgba(58, 166, 238, 0.6)', 'rgba(255, 99, 132, 0.6)'], // Colores
          hoverBackgroundColor: ['rgba(58, 166, 238, 0.8)', 'rgba(255, 99, 132, 0.8)'],
      }]
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    return (
      <>
        <header
          style={
            {
              width: '100%',
              height: '100px',
              backgroundColor: '#3aa6ee',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'start',
              color: '#fff',
              padding: '20px 0',
            }
          }
        >
          <img src="/public/assets/logo_ispc.png" alt="" />
          <h1
            style={
              {
                marginLeft: '20px',
                fontWeight: 'bold',
                fontSize: '3rem',
                color: '#fff',
                textShadow: '2px 2px 4px #000',

              }
            }
          >Evidencia 3 - AMT TSDS</h1>
        </header>

        <div
          style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'row', // Mantener 'row' para crear columnas
              justifyContent: 'center', // Centrar el contenido horizontalmente
              alignItems: 'start', // Alinear al inicio de la columna
              marginTop: '50px',
          }}
        >
          <div style={{ width: '45%', display: 'flex', flexDirection: 'column', alignItems: 'start' }}>
            <h1
              style={ { fontSize: '2rem', fontWeight: 'bold', color: '#3aa6ee' } }
            >Estadisticas</h1>
              <div
                style={{
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'start',
                  alignItems: 'start',
                  marginTop: '0px',
                }}
              >
                  <p
                    style={
                      {
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                        color: '#fff',
                      }
                    }
                  >Total de registros: <span style={ { fontSize: '1.5rem', fontWeight: 'bold', color: '#3aa6ee' } }>{totalRecords}</span></p>
                  <p
                    style={
                      {
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                        color: '#fff',
                      }
                    }
                  >Altura promedio: <span
                    style={ { fontSize: '1.5rem', fontWeight: 'bold', color: '#3aa6ee' } }
                  >{averageHeight} cm</span> </p>
                  <p
                    style={
                      {
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                        color: '#fff',
                      }
                    }
                  >Altura máxima: <span
                    style={ { fontSize: '1.5rem', fontWeight: 'bold', color: '#3aa6ee' } }
                  >{maxHeight} cm</span></p>
                  <p
                    style={
                      {
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                        color: '#fff',
                      }
                    }
                  >Altura mínima: <span
                    style={ { fontSize: '1.5rem', fontWeight: 'bold', color: '#3aa6ee' } }
                  >{minHeight} cm</span></p>
              </div>
          </div>
          
          <div style={{ width: '45%', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
          <h1
              style={ { fontSize: '2rem', fontWeight: 'bold', color: '#3aa6ee' } }
            >Gráfico de Porcentaje del estado del LED</h1>

            <div
              style={{
                width: '400px',
                height: '400px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                alignItems: 'end',
                marginTop: '20px',
                marginBottom: '20px',
              }}
            >
                
                <Pie 
                  style={{ width: '200px', height: '200px' }}
                  data={chartData} 
                  options={{ 
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: true,
                            position: 'top',
                            labels: {
                                color: '#3aa6ee', // Cambia este valor por el color que desees
                                font: {
                                    size: 14,
                                    weight: 'bold', // Puedes cambiar el grosor de la fuente también
                                },
                                padding: 20, // Espaciado entre los labels
                            },
                        },
            },
                      }} />
                </div>
          </div>  
        
        </div>

        <div
          style={
            {
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '80px 0',

            }
          }
        >
            <h1
              style={ { fontSize: '2rem', fontWeight: 'bold', color: '#3aa6ee' } }
            >Datos del Sensor HC-SR04</h1>
            <table 
              style={ { justifyContent: 'center', borderCollapse: 'collapse', width: '100%', marginTop: '20px' } }
            >
                <thead
                  style={ { width: '100%' , backgroundColor: '#3aa6ee', color: '#fff', height: '50px', textAlign: 'center'} }
                >
                    <tr
                      
                    >
                        <th 
                          style={ { width: '20%', textAlign: 'center' } }
                        >ID</th>
                        <th
                          style={ { width: '30%', textAlign: 'center' } }
                        >Altura en cm</th>
                        <th
                          style={ { width: '25%', textAlign: 'center' } }
                        >Fecha del Registro</th>
                        <th
                          style={ { width: '25%', textAlign: 'center' } }
                        >Estado del LED</th>
                    </tr>
                </thead>
                <tbody

                >
                    {currentRecords.map((item) => (
                        <tr key={item.id}
                          style={ { width: '100%' , height: '40px', textAlign: 'center'} }
                        >
                            <td
                              style={ { width: '20%', textAlign: 'center' } }
                            >{item.id}</td>
                            <td
                              style={ { width: '30%', textAlign: 'center' } }
                            >{item.value}</td>
                            <td
                              style={ { width: '25%', textAlign: 'center' } }
                            >{new Date(item.timestamp).toLocaleString()}</td>
                            <td
                              style={ {  textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', height: '40px' } }
                            >
                                <span style={{
                                    display: 'inline-block',
                                    width: '20px',
                                    height: '20px',
                                    backgroundColor: item.value >= threshold ? 'green' : 'red',
                                    borderRadius: '50%',
                                    transition: 'background-color 0.3s'
                                }}></span>
                                {getLedStatus(item.value)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '30px', width: '40%' }}>
                <button 
                  onClick={handlePreviousPage} disabled={currentPage === 1} 
                  style={{ marginRight: '10px' , backgroundColor: '#3aa6ee', color: '#fff'}}
                >Anterior</button>
                <button 
                  onClick={handleNextPage} disabled={currentPage === totalPages}
                  style={{ marginRight: '10px' , backgroundColor: '#3aa6ee', color: '#fff'}}
                >Siguiente</button>
            </div>
        </div>

        <footer
          style={
            {
              width: '100vw',
              height: 'max-content',
              backgroundColor: '#333',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              padding: '20px 0',
            }
          }
        > 
          <img src="/public/assets/logo_ispc.png" alt="" 
            style={ { width: '180px' } }
          />
          <div 
            style={ { marginLeft: '20px' , gap: '10px', display: 'flex', flexDirection: 'column'} }
          >
          <span
            style={ { fontSize: '1.2rem', fontWeight: 'bold', color: '#3aa6ee' } }
          >Instituto Superior Politécnico de Córdoba</span>
          <span
            style={ { fontSize: '1.2rem', fontWeight: 'bold', color: '#fff' } }
          >Tecnicatura Superior en Desarrollo de Software</span>
          <span
            style={ { fontSize: '1.2rem', fontWeight: 'bold', color: '#3aa6ee' } }
          >Cohorte 2024</span>
          </div>
          
        </footer> 
      </>
    );
};

export default App;
