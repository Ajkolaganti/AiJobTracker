class AudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.initializeBuffers();
  }

  initializeBuffers() {
    this.inputBuffer = new Float32Array(128);
    this.outputBuffer = new Float32Array(128);
  }

  process(inputs, outputs) {
    const input = inputs[0];
    const output = outputs[0];

    // Handle no input gracefully
    if (!input || !input.length || !output || !output.length) {
      return true;
    }

    // Process each channel
    for (let channel = 0; channel < output.length; channel++) {
      const inputChannel = input[channel];
      const outputChannel = output[channel];

      // If we have input data, copy it to output
      if (inputChannel) {
        outputChannel.set(inputChannel);
      }
    }

    return true;
  }
}

registerProcessor('audio-processor', AudioProcessor);