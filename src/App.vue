<template>
  <div id="app">
    <!-- <img alt="Vue logo" src="./assets/logo.png"> -->
    <div class="container">
      <div class="row">
        <div class="column">
          <div class="header machine-info">
            <p class="component">Machine Information</p>
            <p class="descriptor">Model: {{ machineInfo.model }}</p>
            <p class="descriptor">Manufacturer: {{ machineInfo.manufacturer }}</p>
            <p class="descriptor">OS Distro: {{ machineInfo.osType }}</p>
            <p class="descriptor">OS Name: {{ machineInfo.osName }} (Version: {{ machineInfo.osVersion }})</p>
          </div>
          <div class="charts">
            
          </div>
        </div>
        <div class="column">
          <div class="header">
            <p class="component">GPU</p>
            <p class="descriptor">{{ gpuInfo.model }}</p>
          </div>
          <p class='no-info'>No information to display</p>
        </div>
      </div>
      <div class="row">
        <div class="column cpu-usage-col">
          <div class="header">
            <p class="component">CPU</p>
            <p class="descriptor">{{ cpuInfo.manufacturer }} {{ cpuInfo.brand }}</p>
          </div>
          <div class="charts">
            <div class="gauge cpu-usage">
              <p class="type">LOAD</p>
              <p class="value">{{ cpuUsage.toFixed(1) }}%</p>
              <line-chart :chart-data="cpuLoad"></line-chart>
            </div>
            <div class="gauge">
              <div class="percent">
                <svg>
                  <circle cx="70" cy="70" r="70"></circle>
                  <circle cx="70" cy="70" r="70" v-bind:style="{ 'stroke-dashoffset': cpuTempDashOffset, 'stroke': cpuColor }"></circle>
                </svg>
                <div class="number">
                  <span class="type">TEMP</span>
                  <span class="value">{{ cpuInfo.temp.toFixed(1) }}</span>
                  <span class="unit">{{ cpuInfo.unit }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="column">
          <div class="header">
            <p class="component">FAN SPEED</p>
            <p class="descriptor">MAX: {{ cpuInfo.maxFanSpeed }}</p>
          </div>
          <div class="charts">
            <div class="gauge">
              <div class="percent">
                <svg>
                  <circle cx="70" cy="70" r="70"></circle>
                  <circle cx="70" cy="70" r="70" v-bind:style="{ 'stroke-dashoffset': cpuFanSpeedDashOffset, 'stroke': '#81D4FA' }"></circle>
                </svg>
                <div class="number fan-speed">
                  <span class="type">CPU</span>
                  <span class="value">{{ cpuInfo.fanSpeed }}</span>
                  <span class="unit">RPM</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="column">
          <div class="header">
            <p class="component">RAM</p>
            <p class="descriptor">{{ Math.round(memInfo.available) }}{{ memInfo.unit }} / {{ memInfo.total }}{{ memInfo.unit }}</p>
          </div>
          <div class="charts">
            <div class="gauge">
              <div class="percent">
                <svg>
                  <circle cx="70" cy="70" r="70"></circle>
                  <circle cx="70" cy="70" r="70" v-bind:style="{ 'stroke-dashoffset': memDashOffset, 'stroke': memColor }"></circle>
                </svg>
                <div class="number">
                  <span class="type">USAGE</span>
                  <span class="value">{{ memPercentage.toFixed(1) }}</span>
                  <span class="unit">%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import LineChart from './scripts/LineChart.js'

const interval = 5000
const api_url = 'http://192.168.1.17:3000/info'

const normal = '#00FF43'
const warning = '#FFCA28'
const danger = '#F44336'

export default {
  name: 'App',
  components: {
    LineChart
  },
  data() {
    return {
      machineInfo: {
        model: '',
        manufacturer: '',
        osType: '',
        osName: '',
        osVersion: '',
      },
      cpuInfo: {
        manufacturer: '',
        brand: '',
        temp: 10,
        unit: '°C',
        fanSpeed: 10,
        maxFanSpeed: 10,
      },
      gpuInfo: {
        model: '',
      },
      memInfo: {
        available: 16,
        total: 16,
        unit: 'GB'
      },

      cpuTempDashOffset: 0,
      cpuUsage: 0,
      cpuColor: normal,

      cpuFanSpeedDashOffset: 0,

      memPercentage: 10,
      memDashOffset: 0,
      memColor: normal,

      cpuLoad: {},
    }
  },
  methods: {
    retrieveInfo() {
      axios.get(api_url).then(res => {
        this.machineInfo = res.data.machine_info
        this.cpuInfo = res.data.cpu_info
        this.gpuInfo = res.data.gpu_info
        this.memInfo = res.data.mem_info

        this.cpuTempDashOffset = 440 - (440 * res.data.cpu_info.temp.toFixed(1)) / 100
        if (res.data.cpu_info.temp >= 80) this.cpuColor = danger
        else if (res.data.cpu_info.temp >= 70) this.cpuColor = warning
        else this.cpuColor = normal

        const cpuFanSpeedPercantage = ((res.data.cpu_info.fanSpeed / res.data.cpu_info.maxFanSpeed) * 100).toFixed(1)
        this.cpuFanSpeedDashOffset = 440 - (440 * cpuFanSpeedPercantage) / 100

        const memoryUsagePercentage = ((res.data.mem_info.available / res.data.mem_info.total) * 100)
        this.memPercentage = memoryUsagePercentage
        this.memDashOffset = 440 - (440 * memoryUsagePercentage) / 100
        if (this.memPercentage >= 80) this.memColor = danger
        else if (this.memPercentage >= 70) this.memColor = warning
        else this.memColor = normal

        this.cpuUsage = res.data.cpu_info.currentLoad

        if (this.cpuLoad.labels.length != 10) {
          this.cpuLoad = {
            labels : this.cpuLoad.labels.concat(1),
            datasets: [{
              ...this.cpuLoad.datasets[0],
              data: this.cpuLoad.datasets[0].data.concat(res.data.cpu_info.currentLoad)
            }]
          }
        } else {
          this.cpuLoad = {
            ...this.cpuLoad,
            datasets: [{
              ...this.cpuLoad.datasets[0],
              data: this.cpuLoad.datasets[0].data.slice(1, 10).concat(res.data.cpu_info.currentLoad)
            }]
          }
        }
      })
    },
    fillData () {
      this.cpuLoad = {
        labels: [1],
        datasets: [
          {
            label: 'Data One',
            fill: false,
            borderColor: '#29b6f6',
            data: [20]
          }
        ]
      }
    },
  },
  mounted() {
    this.fillData()
    this.retrieveInfo()

    window.setInterval(() => {
      this.retrieveInfo()
    }, interval)
  }
}
</script>

<style lang="scss">

@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@600;800&display=swap');

#app {
  font-family: Avenir, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  font-size: 16px;
}

body {
  background-color: #000000;
  color: #FFFFFF;
  margin: 0;
}

.container {
  height: 90vh;
  padding: 35px 50px;
  .row {
    height: 50%;
    display: flex;
    .column {
      flex: 1;
    }
    .cpu-usage-col {
      flex: 2
    }   
  }
}

.header {
  margin-bottom: 20px;
  .component {
    font-weight: 800;
    font-family: 'Manrope', sans-serif;
    color: #FFFFFF;
    margin: 0;
    margin-bottom: 10px;
    font-size: 2.5em;
  }
  .descriptor {
    margin: 0;
    font-weight: 600;
    font-size: 1.5em;
  }
}

.charts {
  display: flex;
  justify-content: center;
  align-items: center;

  #line-chart {
    height: 150px !important;
  }
}

.gauge {
  position: relative;
  width: 240px;
  svg {
    position: relative;
    width: 200px;
    height: 200px;
    transform: rotate(90deg);
  }

  svg circle {
    width: 100%;
    height: 100%;
    fill: none;
    stroke: #666666;
    stroke-width: 25;
    stroke-linecap: 10;
    transform: translate(30px, 30px);
    transition: all 0.2s ease;
    &:nth-child(2) {
      stroke: #00FF43;
      stroke-dasharray: 440;
      stroke-dashoffset: 440;
    }
  }

  .number {
    position: absolute;
    top: 70px;
    left: 75px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-content: center;
    .type {
      font-size: 0.8em;
      font-weight: 800;
      margin-top: -15px;
    }
    .value {
      font-size: 3em;
      margin-top: 0px;
    }
    .unit {
      position: relative;
      top: 0px;
    }
  }

  .fan-speed {
    left: 67px;
  }
}

.cpu-usage {
  font-weight: 800;
  font-size: 1.3em;
  .type {
    position: absolute;
    top: -45px;
  }
  .value {
    position: absolute;
    top: -45px;
    right: 0;
  }
}

.no-info {
  margin-top: 70px;
  font-weight: 600;
  font-size: 1.5em;
  color: rgba(255, 255, 255, 0.6);
}

.machine-info {
  p {
    text-align: left;
  }
  .component {
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.6);
  }
  .descriptor {
    margin-bottom: 10px;
    &:last-of-type {
      margin-bottom: 0px;
    }
  }
}
</style>
