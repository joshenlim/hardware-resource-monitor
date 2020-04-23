import { Line, mixins } from 'vue-chartjs'

const { reactiveProp } = mixins

export default {
  extends: Line,
  mixins: [reactiveProp],
  data: () => ({
    options: {
      legend: {
        display: false
      },
      tooltips: {
          enabled: false
      },
      scales: {
        xAxes: [{
          display: false,
          gridLines: {
              display: false,
              drawBorder: false,
          }
        }],
        yAxes: [{
          ticks: {
            suggestedMin: 20,
            suggestedMax: 60,
          },
          display: false,
          gridLines: {
              display: false,
              drawBorder: false,
          }   
        }]
      }
    }
  }),
  mounted () {
    this.renderChart(this.chartData, this.options)
  }
}