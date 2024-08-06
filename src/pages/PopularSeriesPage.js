import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SerieList from './../components/SerieList';
import { Container, CircularProgress } from '@mui/material';

function PopularSeriesPage() {
  const [allSeries, setAllSeries] = useState([]); // Stores all series fetched initially
  const [visibleSeries, setVisibleSeries] = useState([]); // Stores series currently visible
  const [loading, setLoading] = useState(true);
  const seriesPerLoad = 6; // Number of series to show on each scroll

  useEffect(() => {
    const fetchSeries = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/series/top100series');
        const series = response.data;
        setAllSeries(series);
        setVisibleSeries(series.slice(0, seriesPerLoad)); // Initially show the first chunk
      } catch (error) {
        alert('Error fetching series: ' + error);
      } finally {
        setLoading(false);
      }
    };

    fetchSeries();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      // Check if the user is near the bottom of the page
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500 && !loading) {
        setLoading(true);
        // Load more series
        setVisibleSeries((prevVisibleSeries) => {
          const currentLength = prevVisibleSeries.length;
          const moreSeries = allSeries.slice(currentLength, currentLength + seriesPerLoad);
          return [...prevVisibleSeries, ...moreSeries];
        });
        setLoading(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [allSeries, loading]);

  return (
    <Container>
      <SerieList 
        title="Popular Series" 
        series={visibleSeries}
      />
      {loading && <CircularProgress />}
      {visibleSeries.length >= allSeries.length && (
        <p style={{ textAlign: 'center' }}>Yay! You have seen it all</p>
      )}
    </Container>
  );
}

export default PopularSeriesPage;




// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import SerieList from './../components/SerieList';
// import { Container, CircularProgress } from '@mui/material';

// function PopularSeriesPage() {
//   const [popularSeries, setPopularSeries] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchSeries = async () => {
//       try {
//         const response = await axios.get('http://localhost:5000/api/series/top100series');
//         const series = response.data;
        
//         setPopularSeries(series);
//       } catch (error) {
//         alert('Error fetching series: ' + error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchSeries();
//   }, []);

//   if (loading) {
//     return (
//       <Container>
//         <CircularProgress />
//       </Container>
//     );
//   }

//   return (
//     <Container>
//       <SerieList 
//         title="Popular Series" 
//         series={popularSeries}
//       />
//     </Container>
//   );
// }

// export default PopularSeriesPage;
