import pitchFinder from 'pitchfinder';

const noteStrings = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

function noteFromPitch ( frequency ) {
	const c0 = 440.0 * Math.pow(2.0, -4.75)
	var noteNum = Math.round(12.0 * Math.log2(frequency / c0))
	return noteNum;
};

export function analysePitch(stream, callback) {
	const detectPitch = new pitchFinder.AMDF();

	var context = new AudioContext({sampleRate: 44100});
    var input = context.createMediaStreamSource(stream)
    var processor = context.createScriptProcessor(1024,1,1);

	input.connect(processor);
    processor.connect(context.destination);

	processor.onaudioprocess = (e) => {
      	const myAudioBuffer = e.inputBuffer;
      	const float32Array = myAudioBuffer.getChannelData(0);
		
		const pitch = detectPitch(float32Array);

		const halfStepsBelowMiddleC =  noteFromPitch(pitch);

		return callback({
			pitch: pitch,
			noteNum: halfStepsBelowMiddleC,
			octave: Math.floor(halfStepsBelowMiddleC / 12.0),
			note: noteStrings[Math.floor(halfStepsBelowMiddleC % 12)],
		});
	};


	return processor;
};

// --------------------------- //


function mod(n, m) {
	return ((n % m) + m) % m;
}

function getOctave(n){
	return Math.floor(n/12) + 4;
}

export function transposeOctave(sillabesList){
	var pitchList = sillabesList.map(x => x.pitch);
	pitchList.sort((a, b) => a - b);

	if(pitchList.length === 0) return [];
	
	var smallOct = getOctave(pitchList[0]);
	var bigOct = getOctave(pitchList[pitchList.length - 1]);

	var newSillabesList = sillabesList;

	// if(smallOct === 3 && bigOct === 3) return newSillabesList; // 3 oitava
	if(smallOct === 4 && bigOct === 4) return newSillabesList; // 4 oitava
	// if(smallOct === 5 && bigOct === 5) return newSillabesList; // 5 oitava
	if(smallOct === 3 && bigOct === 4) return newSillabesList; // 3 oitava + 4 oitava 
	if(smallOct === 4 && bigOct === 5) return newSillabesList; // 4 oitava + 5 oitava 
	
	// inteiramente em alguma oitava
	if(smallOct === bigOct){ 
		newSillabesList = sillabesList.map(x => {
			x.pitch = mod(x.pitch, 12);
			return x;
		});

		return newSillabesList;
	}

	// oitava 3 e abaixo
	if(bigOct <= 3){ 
		newSillabesList = sillabesList.map(x => {
			x.pitch = 12 - x.pitch;
			return x;
		});

		return newSillabesList;
	}

	// oitava 5 e acima;
	if(smallOct === 5 && bigOct > 5){
		newSillabesList = sillabesList.map(x => {
			x.pitch = x.pitch - 12;
			return x;
		});

		return newSillabesList;
	}

	if(smallOct > 5){
		newSillabesList = sillabesList.map(x => {
			x.pitch = mod(x.pitch, 12);
			return x;
		});
		console.log(newSillabesList);
		return newSillabesList;
	}

	return newSillabesList
}