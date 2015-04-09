

function createProgram( gl, shaders, opt_attribs, opt_locations ) {

	var program = gl.createProgram();
	shaders.forEach(function(shader) {
		gl.attachShader(program, shader);
	});
	if (opt_attribs) {
		opt_attribs.forEach(function(attrib, i) {
			gl.bindAttribLocation(
					program,
					opt_locations ? opt_locations[i] ? opt_locations[i] : i : i,
					attrib);
		});
	}
	gl.linkProgram(program);

	// Check the link status
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		var err = new Error("Failed to link program: "
			+ gl.getProgramInfoLog(program));
		gl.deleteProgram(program);
		throw err;
	}
	return program;
}

function loadShader(gl, shaderSource, shaderType) {
	var shader = gl.createShader(shaderType);
	gl.shaderSource(shader, shaderSource);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		// Something went wrong during compilation; get the error
		var err = new Error("Failed to compile " + shaderType + ": "
			+ gl.getShaderInfoLog(shader));
		gl.deleteShader(shader);
		throw err;
	}
	return shader;
}

function createShaderFromScript(gl, scriptId) {
	var shaderScript = document.getElementById(scriptId);
	if (!shaderScript) {
		throw new Error("*** Error: unknown script element" + scriptId);
	}
	return createShaderFromScriptTag(gl, shaderScript);
}

var shaderTypeMap = {
	"x-shader/x-vertex": "VERTEX_SHADER",
	"x-shader/x-fragment": "FRAGMENT_SHADER"
}

function createProgramFromScripts( gl, shaderScriptIds, opt_attribs, opt_locations, opt_cb) {
	shaders = shaderScriptIds.map(function(id) {
		return createShaderFromScript(gl, id);
	})
	return createProgram(gl, shaders, opt_attribs, opt_locations, opt_cb);
}

function createShaderFromScriptTag(gl, script) {
	var shaderSource = script.text;

	var shaderType = gl[shaderTypeMap[script.type]];
	if( shaderType == null ) {
		throw new Error("Unknown shader type: " + script.type);
	}

	return loadShader( gl, shaderSource, shaderType );
}

function standardProgram(gl) {
	var shaders = $("script").filter(function(script) {
		return /^x-shader/.test(script.type);
	}).map(function(script) {
		return createShaderFromScriptTag(gl, script);
	})
	var program = createProgram(gl, shaders);
	gl.useProgram(program);
	return program;
}
