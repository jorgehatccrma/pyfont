'use strict';

/**
 *
 *
 * TODO: Investigate d3kit as an abstraction layer
 *
 * */


import { AbstractChart, DivPlate, helper } from 'd3kit';
// import { scaleLinear, scaleOrdinal } from 'd3-scale';
// import { axisLeft, axisBottom } from 'd3-axis';
// import { extent } from 'd3-array';
// import { drag } from 'd3-drag';
import { event as currentEvent} from 'd3-selection';


class BezierTable extends AbstractChart {

	// Define default options for this chart
  static getDefaultOptions() {
    return helper.deepExtend(
      super.getDefaultOptions(),
      {
				columns: [
					{name: 'id', styles: [], num_dec: null},
					{name: 'x', styles: [], num_dec: 2},
					{name: 'y', styles: [], num_dec: 2}]
      }
    );
  }

	/**
   * Define the names of custom events that can be dispatched from this chart
   * @return {Array[String]} event names
   */
  static getCustomEventNames() {
    return ['cpClick'];
  }

	constructor(selector, options) {
    super(selector, options);

    // Add custom variables
		this.options = options;

		this.addPlate('main_table', new DivPlate());
    // now access D3 selection of this <div> element
    // via this.plates.main_table.getSelection()

    // Add basic event listeners
    this.visualize = this.visualize.bind(this);
    this.on('resize.default', this.visualize);
    this.on('data.default', this.visualize);

		const table = this.plates.main_table.getSelection()
			.append('table')
		  .classed('pure-table', true)
		  .classed('pure-table-horizontal', true)
			.classed('bezier', true);
		this.table = table;

		this.thead = table.append('thead');
		this.tbody = table.append('tbody');

		this.thead.selectAll('th').data(this.options.columns).enter()
			.append('th')
			.attr('class', col => col.name)
			.text(col => col.name);

		this.updateDimensionNow();
  }

  // You can define a new function for this class.
  visualize() {

		let thisInstance = this;

    if(!this.hasData()) return;

    const data = this.data();
		console.log(data.points);
		const opts = this.options;

		// create a row for each object in the data
    let rows = this.tbody.selectAll("tr.datapoint")
        .data(Object.values(data.points));

    let rowEnter = rows.enter()
        .append("tr")
				.classed('datapoint', true);

    // create a cell in each row for each column
    let cells = rows.selectAll("td")
        .data(function(row) {
            return opts.columns.map(function(column) {
                return {column: column, value: row[column.name]};
            });
        });

    const cellEnter = cells.enter()
        .append("td")
		    .attr('class', d => d.column.name);

		cells.merge(cellEnter)
				.text(function(d) { 
					if (d.column.num_dec) {
						return Number.parseFloat(d.value).toFixed(d.column.num_dec);
					}
					return d.value; 
				});

	}

}

export { BezierTable };

