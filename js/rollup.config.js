import commonjs from 'rollup-plugin-commonjs';
import multiEntry from 'rollup-plugin-multi-entry';
import resolve from 'rollup-plugin-node-resolve';

export default {
  // input : 'src/scripts/bezier.js',
  input : 'src/scripts/**/*.js',
  output : {
    file : '../staticweb/js/bezier.min.js',
    format : 'iife',
    name : 'Bezier'
  },
  sourceMap : 'inline',
  plugins : [
    resolve({jsnext : true, main : true}),
    // indicate which modules should be treated as external
    // external: [ 'lodash', 'd3', 'd3kit' ]
    commonjs({
      namedExports : {
        // left-hand side can be an absolute path, a path
        // relative to the current directory, or the name
        // of a module in node_modules
        'node_modules/d3kit/dist/d3kit.min.js' : [
					'AbstractChart',
					'CanvasPlate',
					'SvgPlate',
					'SvgChart',
					'DivPlate',
					'helper'
				]
      }
    }),
		multiEntry()
  ]
};
