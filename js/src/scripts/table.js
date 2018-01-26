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
      margin: {top: 20, right: 20, bottom: 20, left: 20},
      initialWidth: 200,
      initialHeight: 200,
      width: 200,
      height: 200,
			show_guides: true,
			keep_tight: true,
			x_scale: [0, 1],
			y_scale: [0, 1]
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

		let table = this.plates.main_table.getSelection()
			.append('table')
		  .classed('pure-table', true)
		  .classed('pure-table-horizontal', true)
			.classed('bezier', true);

		const header = table.append('thead').append('tr');
		header.append('th').html('id');
		header.append('th').html('x');
		header.append('th').html('y');

		this.table = table.append('tbody');

		this.updateDimensionNow();
  }

  // You can define a new function for this class.
  visualize() {

		let thisInstance = this;

    if(!this.hasData()) return;

    const data = this.data();
		console.log(data.points);

		const table = this.table.selectAll('tr.datapoint')
			.data(Object.values(data.points));

		table.exit().remove();

		const rowEnter = table.enter()
			.append('tr')
			.classed('datapoint', true);

		const idEnter = rowEnter.append('td').classed('id', true);
		const xEnter = rowEnter.append('td').classed('x', true);
		const yEnter = rowEnter.append('td').classed('y', true);

		table.merge(idEnter).html(d => d.id);
		table.merge(xEnter).html(d => d.x);
		table.merge(yEnter).html(d => d.y);
	}

}

export { BezierTable };

