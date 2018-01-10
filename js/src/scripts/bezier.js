'use strict';

/**
 *
 *
 * TODO: Investigate d3kit as an abstraction layer
 *
 * */

function Dummy() {

	let me = {};

	me.bark = function _bark() {
		console.log('woughf!');
	};

	return me;

}


import { AbstractChart, CanvasPlate, SvgPlate } from 'd3kit';
import { SvgChart, helper } from 'd3kit';
import { scaleLinear, scaleOrdinal } from 'd3-scale';
import { axisLeft, axisBottom } from 'd3-axis';
import { extent } from 'd3-array';
import { drag } from 'd3-drag';
import { event as currentEvent} from 'd3-selection';


class CustomChart extends AbstractChart {
  constructor(selector, ...options) {

		console.log("Running CustomChart constructor");
    super(selector, ...options);

    this.addPlate('canvas1', new CanvasPlate());
    // now access D3 selection of this <canvas> element
    // via this.plates.canvas1.getSelection()

    this.addPlate('canvas2', new CanvasPlate());
    // now access D3 selection of this <canvas> element
    // via this.plates.canvas2.getSelection()

    this.addPlate('svg', new SvgPlate());
    // now access D3 selection of this <svg> element
    // via this.plates.svg.getSelection()

    this.updateDimensionNow();

		console.log("CustomCart constructor finished");

  }
}


function bezierPathFromBezierObject(coords) {
	let from = coords[0],
		cp_from = coords[1],
		cp_to = coords[2],
		to = coords[3];

	let path = "M " + from.x + " " + from.y;
	path += " C " + cp_from.x + " " + cp_from.y;
	path += " " + cp_to.x + " " + cp_to.y;
	path += " " + to.x + " " + to.y;
	return path;
}

class Bezier extends SvgChart {
	// Define default options for this chart
  static getDefaultOptions() {
    return helper.deepExtend(
      super.getDefaultOptions(),
      {
      margin: {top: 20, right: 20, bottom: 20, left: 20},
      initialWidth: 200,
      initialHeight: 200,
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

    this.xScale = scaleLinear();
    this.yScale = scaleLinear();
    this.xAxis = axisBottom().scale(this.xScale);
    this.yAxis = axisLeft().scale(this.yScale);
    this.xAxisG = this.rootG.append('g');
    this.yAxisG = this.rootG.append('g');
		
    // Add basic event listeners
    this.visualize = this.visualize.bind(this);
    this.on('resize.default', this.visualize);
    this.on('data.default', this.visualize);
  }

  // You can define a new function for this class.
  visualize() {

		let thisInstance = this;

    if(!this.hasData()) return;

    const data = this.data();

		let keep_tight = this.options.keep_tight;
		if(keep_tight) {
			this.xScale.domain(extent(data.coords, d => d.x))
				.range([0, this.getInnerWidth()]);
			this.yScale.domain(extent(data.coords, d => d.y))
				.range([this.getInnerHeight(), 0]);
		}	else {
			this.xScale.domain(this.options.x_scale)
				.range([0, this.getInnerWidth()]);
			this.yScale.domain(this.options.y_scale)
				.range([this.getInnerHeight(), 0]);
		}

    this.xAxisG
      .attr('transform', `translate(0,${this.getInnerHeight()})`)
      .call(this.xAxis);

    this.yAxisG.call(this.yAxis);



		// Actual PATH (bezier curve)

		const getSvgPath = function(data, xScale, yScale) {
			const coords = data.coords.map(function(d) {
				return {x:xScale(d.x), y:yScale(d.y)};
			});
			return bezierPathFromBezierObject(coords);
		}

		const path = this.rootG.selectAll('path.bezier').data(data);

		path.exit().remove();

		const pEnter = path.enter().append('path')
		  .attr('id', (d) => d.id)
			.classed('bezier', true);
			
		path.merge(pEnter)
			.attr("d", (d) => getSvgPath(d, this.xScale, this.yScale));

		// better to do this after the path, so it displays on top of it and
		// control points are actually clickeable everywhere
		this.show_guides();	

	}

	show_guides() {

		let thisInstance = this;

    const data = this.data();

		let show_guides = this.options.show_guides;
		if(!show_guides) return;

		// Guides
		const g1 = this.rootG.selectAll('line.guide.from').data(data);
		const g2 = this.rootG.selectAll('line.guide.to').data(data);

		g1.exit().remove();
		g2.exit().remove();

		const g1Enter = g1.enter().append('line')
		  .attr('id', (d) => 'gf' + d.id)
			.classed('guide', true)
			.classed('from', true);
		const g2Enter = g1.enter().append('line')
		  .attr('id', (d) => 'gt' + d.id)
			.classed('guide', true)
			.classed('to', true);

		g1.merge(g1Enter)
		  .attr("x1", (d) => this.xScale(d.coords[0].x))
		  .attr("y1", (d) => this.yScale(d.coords[0].y))
		  .attr("x2", (d) => this.xScale(d.coords[1].x))
		  .attr("y2", (d) => this.yScale(d.coords[1].y));
		g2.merge(g2Enter)
		  .attr("x1", (d) => this.xScale(d.coords[3].x))
		  .attr("y1", (d) => this.yScale(d.coords[3].y))
		  .attr("x2", (d) => this.xScale(d.coords[2].x))
		  .attr("y2", (d) => this.yScale(d.coords[2].y));



		// Add Control Points

    // const selection = this.rootG.selectAll('circle')
    //   .data(data.coords);
    const selection = this.rootG.selectAll('circle')
      .data(_.flattenDeep(_.map(data, (d) => d.coords)));

    selection.exit().remove();

		function started() {
			var circle = d3.select(this).classed("dragging", true);
		}

		function dragged(d) {
			var circle = d3.select(this);
			circle.raise()
				.attr("cx", d.x = thisInstance.xScale.invert(currentEvent.x))
				.attr("cy", d.y = thisInstance.yScale.invert(currentEvent.y));
			thisInstance.visualize();
		}

		function ended() {
			var circle = d3.select(this);
			circle.classed("dragging", false);
		}

    const sEnter = selection.enter().append('circle')
		  .classed("control-point", true)
      .attr('cx', d => this.xScale(d.x))
      .attr('cy', d => this.yScale(d.y))
			.on('click', (...args) => {
				this.dispatcher.apply('cpClick', this, args);
			})
		  .call(drag()
				.subject(function(d) {
					return {
						x: thisInstance.xScale(d.x),
						y: thisInstance.yScale(d.y)
					};
				})
				.on('start', started)
				.on('drag', dragged)
				.on('end', ended)
			);

    selection.merge(sEnter)
      .attr('cx', d => this.xScale(d.x))
      .attr('cy', d => this.yScale(d.y))
			.attr('r', 4);
  }

}

export { Dummy, CustomChart, Bezier };
// export { Bezier };

