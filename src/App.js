import React,{ useState,useEffect } from 'react';
import { MenuItem, Select, FormControl,Card, CardContent} from "@material-ui/core";
import InfoBox from "./InfoBox";
import './App.css';
import Map from "./Map";
import Table from "./Table";
import { sortData, prettyPrintStat } from "./util";
import LineGraph from "./LineGraph";
import "leaflet/dist/leaflet.css";


function App() {
  const [countries, setCountries]= useState([]);
  const [country, setCountry] = useState('Worldwide');
  const [countryInfo, setCountryInfo] = useState({});
  const [tableData, setTableData] = useState([]);
  const[mapCenter, setMapCenter] = useState({ lat: 34.80746, lng:-40.4796 });
  const [mapZoom, setMapZoom] = useState(3);
  const [mapCountries, setMapCountries] = useState([]);
  const[casesType, setCasesType] = useState("cases");
 
  useEffect(() => {
    fetch('https://disease.sh/v3/covid-19/all')
    .then((response) => response.json())
    .then((data) => {
      setCountryInfo(data)
    });
  }, []);

  //https://disease.sh/v3/covid-19/countries
  useEffect(() => {
    //the code inside here will run once
    //when the component loads and not again after
    const getCountriesData = async() => {
      await fetch("https://disease.sh/v3/covid-19/countries")
      .then((response) => response.json())
      .then((data) => {
        const countries = data.map((country) => (
          {
            name:country.country,
            value: country.countryInfo.iso2,
          }));

          const sortedData = sortData(data);
          setTableData(sortedData);
          setMapCountries(data);
          setCountries(countries);
      })
    }
    getCountriesData();

  }, []);
  const onCountryChange = async(event) => {
    const countryCode= event.target.value;
    setCountry(countryCode);

    const url = 
      countryCode === 'Worldwide' ? 'https://disease.sh/v3/covid-19/all' : `https://disease.sh/v3/covid-19/countries/${countryCode}`;

    await fetch(url).then((response) => response.json())
    .then((data) => {

      setCountry(countryCode);
      setCountryInfo(data);
      setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
      setMapZoom(4);
    })
  };
  console.log("country info >>>>", countryInfo);


  return (
    <div className="App">
      <div className="app__left">
        <div className="app__header">
          <h1>I am a Covid-19 trackor</h1>
          <FormControl className="app__dropdown">
            <Select varient="outlined" onChange={onCountryChange} value={country}>
              <MenuItem value="Worldwide">Worldwide</MenuItem>
              {countries.map((country)=> (
                <MenuItem value={country.value}>{country.name}</MenuItem>
              ))}
              {/*
              <MenuItem value="worldwide">Option2</MenuItem>
              <MenuItem value="worldwide">Option3</MenuItem>
              <MenuItem value="worldwide">YOOO</MenuItem> */}
            </Select>
          </FormControl>
        </div>
        <div className="app__status">
          <InfoBox
          isRed
          active={casesType === "cases"}
          onClick={e => setCasesType('cases')}
           title="Coronavirus cases" cases={prettyPrintStat(countryInfo.todayCases)} total={prettyPrintStat(countryInfo.cases)} />
          <InfoBox
          isRed 
          active={casesType === "recovered"}
          onClick={e => setCasesType('recovered')}
            title="Recovered"  cases={prettyPrintStat(countryInfo.todayRecovered)} total={prettyPrintStat(countryInfo.recovered)} />
          <InfoBox
          isRed
          active={casesType === "deaths"}
          onClick={e => setCasesType('deaths')}
            title="Deaths"  cases={prettyPrintStat(countryInfo.todayDeaths)}total={prettyPrintStat(countryInfo.deaths)} />
        </div> 

        <Map
          casesType={casesType}
          countries={mapCountries}
          center={mapCenter}
          zoom={mapZoom} 
        /> 

      </div>
      
        <Card className="app__right">
          <CardContent>
            <h3>Live cases by country</h3>
            <Table countries={tableData} />
            <h3 className="app__graphTitle"> Worldwide new {casesType}</h3>
            <LineGraph className="app__graph" casesType={casesType} />
          </CardContent>

        </Card>
      
     

    </div>
  );
}

export default App;
