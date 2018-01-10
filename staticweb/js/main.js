function testCall() {
	console.log('Calling Python...');
	let v1 = eel.my_python_function(1, 2)();   // This calls the Python function that was decorated:
	let v2 = eel.my_python_function('jamon', 'queso')();

	v1.then(function (result) {
		console.log(result);
	});

	v2.then(function (result) {
		console.log(result);
	});

}

// const bez = Bezier.Bezier();
// bez.bark();

let options = Bezier.Bezier.getDefaultOptions();
options.margin = {top: 40, right: 40, bottom: 40, left: 40};
options.initialWidth = 400;
options.initialHeight = 480;
options.show_guides = true;
options.keep_tight = false;
options.x_scale = [-10, 90];
options.y_scale = [-10, 110];


let data = [
	{
		id: 1,
		coords: [
			{x: 0.0, y: 12.0},
			{x: 50.0, y: 15.0},
			{x: 40.0, y: 82},
			{x: 70, y: 90}]
	}, {
		id: 2,
		coords: [
			{x: 70.0, y: 90.0},
			{x: 90.0, y: 95.0},
			{x: 95.0, y: 30},
			{x: 0, y: 8}]
	}];

let bezzy = new Bezier.Bezier('#my-chart', options);

bezzy.data(data)
// handle bubbleClick event
	.on('cpClick', d => { alert(JSON.stringify(d)); })
	.fit({
		// mode: 'aspectRatio',
		// ratio: 10/12,
		width: '100%',
		height: '100%'
		//height: '200px'
	}, true);

function getData() {
	console.log(bezzy.data());
}
