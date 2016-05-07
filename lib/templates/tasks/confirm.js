// Configuration for the grunt confirm task
module.exports = {
	cleanup: {
		options: {
			question: 'Remove all files except your wpmanifest.json and SQL dumps? Press "y" to Continue:',
			input: '_key:y'
		}
	}
};
